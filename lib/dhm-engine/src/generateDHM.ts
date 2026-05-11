import type { SAYCode } from "./syntax";

export type { SAYCode } from "./syntax";

export interface SAYPoint {
  code: SAYCode;
  label: string;
  pointTheme: string;
  guidance: string;
}

export interface Strand {
  index: number;
  /** One crisp thesis sentence for this strand (the line woven into chapter / book Story of Thesis). */
  strandThesis: string;
  pattern: string;
  points: SAYPoint[];
}

export interface DHMChapter {
  num: number;
  title: string;
  /** Verbatim join of this chapterâ€™s strand thesis lines, using discourse markers. */
  chapterStoryOfThesis: string;
  strands: Strand[];
  chapterSyntaxMatrix: string;
}

export interface DHMArc {
  awareness: DHMChapter[];
  resolution: DHMChapter[];
  callToAction: DHMChapter[];
}

export interface DHMResult {
  arc: DHMArc;
  chapterLimit: number;
  revisionAllowance: number | "custom";
  plan: string;
  /** Verbatim join of each chapterâ€™s Story of Thesis summary (book-level SOT). */
  storyOfThesis: string;
  /** Userâ€™s template matrix (slash-separated strands). */
  chapterSyntaxMatrix: string;
  /**
   * Increment when outline rules change. Clients should regenerate cached DHMs when this
   * does not match the current engine. Omitted on older saved outlines.
   */
  dhmEngineVersion?: number;
}

/** Current DHM engine revision â€” bump when structure or weaving rules change. */
export const DHM_ENGINE_VERSION = 4;

export interface GenerateDHMInput {
  title: string;
  audience: string;
  goal: string;
  genre?: string;
  plan: string;
  chapterSyntaxMatrix?: string;
  /** When true (default), SAY order shifts by chapter from the template. */
  syntaxVaryPerChapter?: boolean;
  /**
   * Story lock: each **chapter** opens with Story â€” only the **first** strand is forced
   * S-first (SYA/SAY alternation). Other strands follow normal rotation.
   */
  syntaxAlwaysLeadWithStory?: boolean;
}

export function splitArcChapterCounts(total: number): [number, number, number] {
  if (total <= 0) return [0, 0, 0];
  const a = Math.ceil(total / 3);
  const rest = total - a;
  const b = Math.ceil(rest / 2);
  const c = total - a - b;
  return [a, b, Math.max(c, 0)];
}

/** Discourse glue between strand lines inside one chapter (clause-scale). */
const CHAPTER_JOIN_MARKERS = [
  "Therefore,",
  "Consequently,",
  "At the same time,",
  "This matters because",
  "Meanwhile,",
  "Still,",
  "Next,",
  "In parallel,",
];

/** Discourse glue between chapter summaries for the book-level Story of Thesis (arc-scale). */
const BOOK_JOIN_MARKERS = [
  "Furthermore,",
  "In addition,",
  "Just as",
  "Alongside that,",
  "Crucially,",
  "Then,",
  "Ultimately,",
];

export type ThesisJoinTier = "chapter" | "book";

export interface JoinThesisOptions {
  tier?: ThesisJoinTier;
  /** Rotates which marker starts first so adjacent chapters or books feel less identical. */
  markerOffset?: number;
}

function lowerFirst(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return t.charAt(0).toLowerCase() + t.slice(1);
}

function pickMarkers(tier: ThesisJoinTier): readonly string[] {
  return tier === "book" ? BOOK_JOIN_MARKERS : CHAPTER_JOIN_MARKERS;
}

/**
 * Join thesis sentences into one flowing paragraph. Strand/chapter sentences stay verbatim;
 * only connectors vary by tier (chapter vs book arc).
 */
export function joinThesisParagraph(sentences: string[], options?: JoinThesisOptions): string {
  const tier = options?.tier ?? "chapter";
  const offset = Math.max(0, options?.markerOffset ?? 0);
  const markers = pickMarkers(tier);
  const parts = sentences.map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!;
  let out = parts[0]!;
  for (let i = 1; i < parts.length; i++) {
    const m = markers[(offset + i - 1) % markers.length]!;
    const next = lowerFirst(parts[i]!);
    out += ` ${m} ${next}`;
  }
  return out;
}

/** Book-level Story of Thesis: verbatim weave of each chapterâ€™s Story of Thesis paragraph. */
export function buildStoryOfThesis(chapterStoryParagraphs: string[], markerOffset = 0): string {
  return joinThesisParagraph(chapterStoryParagraphs, { tier: "book", markerOffset });
}

/** @deprecated Template outlines are disabled — use POST /api/dhm (Gemini) instead. */
export function generateDHM(_input: GenerateDHMInput): DHMResult {
  throw new Error("Template DHM generation is disabled. Call POST /api/dhm on the API server.");
}
