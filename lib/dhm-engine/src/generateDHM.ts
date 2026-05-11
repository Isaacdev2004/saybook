import { buildBookContext, type BookContext } from "./bookContext";
import { chapterPlanFor, pickSayPour } from "./chapterOutlines";
import { getPlanLimits, normalizePlan } from "./planLimits";
import {
  labelForCode,
  normalizeChapterSyntaxMatrix,
  parseStrandPatterns,
  varyChapterMatrix,
  type SAYCode,
  type VaryMatrixOptions,
} from "./syntax";

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
export const DHM_ENGINE_VERSION = 3;

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

function buildStrandsForChapter(matrix: string, globalChapterIndex: number, ctx: BookContext): Strand[] {
  const patterns = parseStrandPatterns(matrix);
  const plan = chapterPlanFor(globalChapterIndex, ctx, patterns.length);
  return patterns.map((pattern, strandIdx) => {
    const strandPlan = plan.strands[strandIdx]!;
    const counts: Partial<Record<SAYCode, number>> = {};
    const chars = pattern.split("") as SAYCode[];
    const points: SAYPoint[] = chars.map((code) => {
      const occurrence = counts[code] ?? 0;
      counts[code] = occurrence + 1;
      const slot = pickSayPour(strandPlan, code, occurrence);
      return {
        code,
        label: labelForCode(code),
        pointTheme: slot.theme,
        guidance: slot.guidance,
      };
    });
    return { index: strandIdx + 1, strandThesis: strandPlan.thesis, pattern, points };
  });
}

/** Book-level Story of Thesis: verbatim weave of each chapterâ€™s Story of Thesis paragraph. */
export function buildStoryOfThesis(chapterStoryParagraphs: string[], markerOffset = 0): string {
  return joinThesisParagraph(chapterStoryParagraphs, { tier: "book", markerOffset });
}

function pushChapter(
  bucket: DHMChapter[],
  num: number,
  globalChapterIndex: number,
  ctx: BookContext,
  matrixTemplate: string,
  syntaxOpts: VaryMatrixOptions,
): void {
  const matrix = varyChapterMatrix(matrixTemplate, globalChapterIndex, syntaxOpts);
  const plan = chapterPlanFor(globalChapterIndex, ctx, parseStrandPatterns(matrix).length);
  const strands = buildStrandsForChapter(matrix, globalChapterIndex, ctx);
  const chapterStoryOfThesis = joinThesisParagraph(strands.map((s) => s.strandThesis), {
    tier: "chapter",
    markerOffset: globalChapterIndex,
  });
  bucket.push({
    num,
    title: plan.title,
    chapterStoryOfThesis,
    strands,
    chapterSyntaxMatrix: matrix,
  });
}

export function generateDHM(input: GenerateDHMInput): DHMResult {
  const planId = normalizePlan(input.plan);
  const { chapters: chapterLimit, revisions } = getPlanLimits(planId);
  const matrixTemplate = normalizeChapterSyntaxMatrix(input.chapterSyntaxMatrix);
  const ctx = buildBookContext(input);

  const syntaxOpts: VaryMatrixOptions = {
    varyPerChapter: input.syntaxVaryPerChapter !== false,
    alwaysLeadWithStory: input.syntaxAlwaysLeadWithStory === true,
  };

  const [na, nr, nc] = splitArcChapterCounts(chapterLimit);

  const awareness: DHMChapter[] = [];
  const resolution: DHMChapter[] = [];
  const callToAction: DHMChapter[] = [];

  let globalNum = 1;
  let globalChapterIndex = 0;

  for (let i = 0; i < na; i++) {
    pushChapter(awareness, globalNum++, globalChapterIndex++, ctx, matrixTemplate, syntaxOpts);
  }
  for (let i = 0; i < nr; i++) {
    pushChapter(resolution, globalNum++, globalChapterIndex++, ctx, matrixTemplate, syntaxOpts);
  }
  for (let i = 0; i < nc; i++) {
    pushChapter(callToAction, globalNum++, globalChapterIndex++, ctx, matrixTemplate, syntaxOpts);
  }

  const chapterStoriesOrdered = [
    ...awareness.map((c) => c.chapterStoryOfThesis),
    ...resolution.map((c) => c.chapterStoryOfThesis),
    ...callToAction.map((c) => c.chapterStoryOfThesis),
  ];

  const storyOfThesis = buildStoryOfThesis(chapterStoriesOrdered, chapterStoriesOrdered.length);

  return {
    arc: { awareness, resolution, callToAction },
    chapterLimit,
    revisionAllowance: revisions,
    plan: planId,
    storyOfThesis,
    chapterSyntaxMatrix: matrixTemplate,
    dhmEngineVersion: DHM_ENGINE_VERSION,
  };
}
