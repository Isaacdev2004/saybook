import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export interface ReviewRecord {
  id: string;
  createdAt: string;
  rating: number;
  authorName: string | null;
  email: string | null;
  review: string;
}

export interface FounderSuggestionRecord {
  id: string;
  createdAt: string;
  authorName: string | null;
  email: string | null;
  writingProblems: string;
  questions: string;
  /** Simple keyword extraction for FAQ mining (replace with LLM later). */
  faqKeywords: string[];
  adminReply: string | null;
  repliedAt: string | null;
}

interface Store {
  reviews: ReviewRecord[];
  founderSuggestions: FounderSuggestionRecord[];
}

const DEFAULT: Store = { reviews: [], founderSuggestions: [] };

function filePath(): string {
  const dir = process.env["SAYBOOK_FEEDBACK_DATA_DIR"] ?? path.join(process.cwd(), "data");
  return path.join(dir, "saybook-feedback.json");
}

let chain: Promise<void> = Promise.resolve();

function runLocked<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(() => fn());
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readStore(): Promise<Store> {
  try {
    const raw = await readFile(filePath(), "utf-8");
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
      founderSuggestions: Array.isArray(parsed.founderSuggestions) ? parsed.founderSuggestions : [],
    };
  } catch {
    return structuredClone(DEFAULT);
  }
}

async function writeStore(store: Store): Promise<void> {
  const fp = filePath();
  await mkdir(path.dirname(fp), { recursive: true });
  await writeFile(fp, `${JSON.stringify(store, null, 2)}\n`, "utf-8");
}

function extractFaqKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const words = lower.match(/\b[a-z]{4,}\b/g) ?? [];
  const stop = new Set([
    "what",
    "when",
    "with",
    "that",
    "this",
    "from",
    "have",
    "your",
    "about",
    "would",
    "could",
    "should",
    "their",
    "there",
    "these",
    "those",
    "which",
    "where",
    "being",
    "been",
    "into",
    "more",
    "some",
    "very",
    "just",
    "like",
    "also",
    "only",
    "even",
    "much",
    "such",
    "then",
    "than",
    "them",
    "they",
  ]);
  const freq = new Map<string, number>();
  for (const w of words) {
    if (stop.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)
    .map(([w]) => w);
}

export async function appendReview(input: {
  rating: number;
  authorName?: string | null;
  email?: string | null;
  review: string;
}): Promise<ReviewRecord> {
  return runLocked(async () => {
    const store = await readStore();
    const row: ReviewRecord = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      rating: input.rating,
      authorName: input.authorName?.trim() || null,
      email: input.email?.trim() || null,
      review: input.review.trim(),
    };
    store.reviews.unshift(row);
    store.reviews = store.reviews.slice(0, 500);
    await writeStore(store);
    return row;
  });
}

export async function appendFounderSuggestion(input: {
  authorName?: string | null;
  email?: string | null;
  writingProblems: string;
  questions: string;
}): Promise<FounderSuggestionRecord> {
  return runLocked(async () => {
    const store = await readStore();
    const blob = `${input.writingProblems}\n${input.questions}`;
    const row: FounderSuggestionRecord = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      authorName: input.authorName?.trim() || null,
      email: input.email?.trim() || null,
      writingProblems: input.writingProblems.trim(),
      questions: input.questions.trim(),
      faqKeywords: extractFaqKeywords(blob),
      adminReply: null,
      repliedAt: null,
    };
    store.founderSuggestions.unshift(row);
    store.founderSuggestions = store.founderSuggestions.slice(0, 500);
    await writeStore(store);
    return row;
  });
}

export async function getFullStore(): Promise<Store> {
  return runLocked(readStore);
}

export async function setFounderReply(id: string, reply: string): Promise<FounderSuggestionRecord | null> {
  return runLocked(async () => {
    const store = await readStore();
    const row = store.founderSuggestions.find((r) => r.id === id);
    if (!row) return null;
    row.adminReply = reply.trim();
    row.repliedAt = new Date().toISOString();
    await writeStore(store);
    return row;
  });
}
