import { getPlanLimits, normalizePlan } from "./planLimits";
import {
  labelForCode,
  normalizeChapterSyntaxMatrix,
  parseStrandPatterns,
  type SAYCode,
} from "./syntax";

export type { SAYCode } from "./syntax";

export interface SAYPoint {
  code: SAYCode;
  label: string;
  /** Theme for this SAY point — aligns with chapter theme and progresses through the strand */
  pointTheme: string;
  /** Developmental guidance for drafting this beat */
  guidance: string;
}

export interface Strand {
  /** 1-based strand index within the chapter */
  index: number;
  /** Pattern e.g. SYA */
  pattern: string;
  points: SAYPoint[];
}

export interface DHMChapter {
  num: number;
  title: string;
  /** Unifies the chapter arc (formerly “statement of theme”) */
  chapterTheme: string;
  strands: Strand[];
  /** Full matrix chosen for this outline e.g. SYA/YAA/AYA */
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
  /** Book-level synthesis woven from all chapter themes */
  storyOfThesis: string;
  chapterSyntaxMatrix: string;
}

export interface GenerateDHMInput {
  title: string;
  audience: string;
  goal: string;
  genre?: string;
  plan: string;
  /** Chapter syntax matrix: slash-separated 3-letter strands (S/Y/A only), e.g. SYA or SYA/YAA/AYA */
  chapterSyntaxMatrix?: string;
}

function clampSnippet(text: string, max = 52): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

/** Split total chapters across Awareness → Resolution → Call to Action (dynamic thirds). */
export function splitArcChapterCounts(total: number): [number, number, number] {
  if (total <= 0) return [0, 0, 0];
  const a = Math.ceil(total / 3);
  const rest = total - a;
  const b = Math.ceil(rest / 2);
  const c = total - a - b;
  return [a, b, Math.max(c, 0)];
}

const awarenessTitleBlueprints = [
  (title: string) => `Why "${clampSnippet(title, 32)}" Matters Now`,
  (title: string) => `The Gap Behind ${clampSnippet(title, 36)}`,
  (title: string) => `What Readers Believe Before ${clampSnippet(title, 28)}`,
];

const resolutionTitleBlueprints = [
  (title: string) => `Translating Insight Into Practice`,
  (title: string) => `Removing Friction for ${clampSnippet(title, 34)}`,
  (title: string) => `Building Credibility Around Your Core Idea`,
];

const ctaTitleBlueprints = [
  (_title: string) => `From Understanding to Commitment`,
  (_title: string) => `The Reader's Next Bold Step`,
  (_title: string) => `Closing the Loop: Action That Lasts`,
];

function buildChapterTheme(
  kind: "awareness" | "resolution" | "cta",
  audience: string,
  goal: string,
  chapterIdx: number,
): string {
  const aud = clampSnippet(audience, 48);
  const g = clampSnippet(goal, 56);
  const variants = {
    awareness: [
      `If ${aud} keeps navigating without this framework, they risk losing clarity before change sticks.`,
      `Without naming the real tension, ${aud} cannot fully align around "${g}".`,
      `The hidden cost for ${aud} is stalled momentum until the promise of "${g}" feels reachable.`,
    ],
    resolution: [
      `Here ${aud} trades abstraction for proof — "${g}" becomes something they can execute weekly.`,
      `This chapter anchors accountability so ${aud} bridges intention with repeatable habits.`,
      `To stabilize progress, ${aud} needs guardrails that honor "${g}" without overwhelm.`,
    ],
    cta: [
      `Invite ${aud} to commit: the payoff is "${g}" made concrete with a single next step.`,
      `Close with an unmistakable bridge — ${aud} should leave knowing exactly what to do tomorrow.`,
      `Seal trust by tying "${g}" to identity-level change ${aud} can sustain past launch.`,
    ],
  };
  const pool = variants[kind];
  return pool[chapterIdx % pool.length];
}

function buildPointTheme(
  code: SAYCode,
  chapterTheme: string,
  audience: string,
  goal: string,
  strandIdx: number,
  pointIdx: number,
): string {
  const ct = clampSnippet(chapterTheme, 96);
  const aud = clampSnippet(audience, 46);
  const g = clampSnippet(goal, 70);
  const focus = strandFocus(strandIdx);
  const posture = pointIdx === 0 ? "introduce" : pointIdx === 1 ? "sharpen" : "resolve";

  if (code === "S") {
    return [
      `Choose a story about ${focus} that makes this chapter theme real: ${ct}`,
      `Tell a scene where ${aud} tries to ${g} but hits friction around ${focus}; show stakes and emotion, then pivot to the lesson.`,
      `Use a contrast story (before/after) focused on ${focus}: what changes once the reader treats the theme as non‑negotiable?`,
    ][(strandIdx + pointIdx) % 3];
  }

  if (code === "Y") {
    return [
      `Include evidence that supports ${posture}d belief in “${g}” through the lens of ${focus}: 1 study/statistic + 1 case example + 1 counterpoint you address.`,
      `Use research types suited to ${focus}: benchmarks, experiments, expert quotes, or industry reports; end with a clear “what this proves” sentence tied to the chapter theme.`,
      `Add credibility scaffolding for ${focus}: define the claim, cite proof, show limitations, then restate the chapter theme in stronger terms.`,
    ][(strandIdx + pointIdx) % 3];
  }

  return [
    `Give actionable advice for ${aud} around ${focus}: a 3-step move they can do this week to advance “${g}” while honoring the chapter theme.`,
    `Provide a tool or template for ${focus} (checklist, prompt set, scorecard, workflow); include an example filled in for a realistic scenario.`,
    `Prescribe a habit + measurement for ${focus}: what to do, how often, what to track, and what “good” looks like when they apply the chapter theme.`,
  ][(strandIdx + pointIdx) % 3];
}

function buildPointGuidance(
  code: SAYCode,
  kind: "awareness" | "resolution" | "cta",
  audience: string,
  goal: string,
  strandIdx: number,
  pointIdx: number,
): string {
  const aud = clampSnippet(audience, 40);
  const g = clampSnippet(goal, 44);
  const k = strandIdx + pointIdx + (kind === "awareness" ? 0 : kind === "resolution" ? 3 : 6);
  const focus = strandFocus(strandIdx);

  if (code === "S") {
    const lines = [
      `Draft a concrete scene about ${focus}: who, where, what decision, and what went wrong/right for ${aud}.`,
      `Use one specific moment that spotlights why “${g}” matters; avoid abstract backstory and end with a question the evidence answers.`,
      `Close the story with a crisp takeaway sentence that restates the chapter theme in plain language.`,
    ];
    return lines[k % lines.length];
  }
  if (code === "Y") {
    const lines = [
      `Choose 2–3 proof types for ${focus} (data/stat, expert, case study). Tie each directly to “${g}” and the chapter theme.`,
      `Include at least one number or citation-style claim for ${focus}, plus a short example showing it in practice for ${aud}.`,
      `Address one objection about ${focus} (cost, ethics, accuracy, time) so the advice feels earned.`,
    ];
    return lines[k % lines.length];
  }
  const lines = [
    `Give a step-by-step for ${focus}: step 1 setup, step 2 execution, step 3 review; keep it doable in 30–60 minutes.`,
    `Add one template line the reader can copy/paste for “${g}” (prompt, checklist item, KPI definition) focused on ${focus}.`,
    `End with a bridge: “Now that ${aud} can handle ${focus}, they’re ready for the next SAY point…”`,
  ];
  return lines[k % lines.length];
}

function strandFocus(strandIdx: number): string {
  const pool = [
    "the reader’s problem and stakes",
    "the method, workflow, or system they should adopt",
    "the tools, examples, and measurement that make it stick",
  ];
  return pool[strandIdx % pool.length];
}

function buildStrandsForChapter(
  matrix: string,
  chapterTheme: string,
  kind: "awareness" | "resolution" | "cta",
  audience: string,
  goal: string,
): Strand[] {
  const patterns = parseStrandPatterns(matrix);
  return patterns.map((pattern, strandIdx) => {
    const chars = pattern.split("") as SAYCode[];
    const points: SAYPoint[] = chars.map((code, pointIdx) => ({
      code,
      label: labelForCode(code),
      pointTheme: buildPointTheme(code, chapterTheme, audience, goal, strandIdx, pointIdx),
      guidance: buildPointGuidance(code, kind, audience, goal, strandIdx, pointIdx),
    }));
    return { index: strandIdx + 1, pattern, points };
  });
}

/** Combine chapter themes into one cohesive Story of Thesis paragraph (template weaving — swap for AI later). */
export function buildStoryOfThesis(
  chapterThemes: string[],
  bookTitle: string,
  audience: string,
  goal: string,
): string {
  const markers = [
    "Therefore,",
    "However,",
    "As such,",
    "As a result of this,",
    "Meanwhile,",
    "Consequently,",
  ];
  const aud = clampSnippet(audience, 56);
  const g = clampSnippet(goal, 100);
  const title = bookTitle.trim() || "this book";

  if (chapterThemes.length === 0) {
    return `"${title}" invites ${aud} into one sustained argument: ${g}`;
  }

  const sentences: string[] = [];
  chapterThemes.forEach((raw, i) => {
    let s = raw.trim().replace(/\s+/g, " ");
    if (!s.endsWith(".")) s += ".";
    if (i === 0) {
      sentences.push(s);
    } else {
      const m = markers[(i - 1) % markers.length];
      sentences.push(`${m} ${s.charAt(0).toLowerCase()}${s.slice(1)}`);
    }
  });

  const core = sentences.join(" ");
  return `${core} Taken together, these chapter movements form the Story of Thesis for "${title}" — a single through-line for ${aud}, anchored in ${g}`;
}

function sliceTitles(
  count: number,
  blueprints: Array<(title: string) => string>,
  bookTitle: string,
  offset: number,
): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const bp = blueprints[(i + offset) % blueprints.length];
    out.push(bp(bookTitle));
  }
  return out;
}

function pushChapter(
  bucket: DHMChapter[],
  num: number,
  title: string,
  kind: "awareness" | "resolution" | "cta",
  chapterIdx: number,
  audience: string,
  goal: string,
  matrix: string,
): void {
  const chapterTheme = buildChapterTheme(kind, audience, goal, chapterIdx);
  const strands = buildStrandsForChapter(matrix, chapterTheme, kind, audience, goal);
  bucket.push({
    num,
    title,
    chapterTheme,
    strands,
    chapterSyntaxMatrix: matrix,
  });
}

export function generateDHM(input: GenerateDHMInput): DHMResult {
  const planId = normalizePlan(input.plan);
  const { chapters: chapterLimit, revisions } = getPlanLimits(planId);
  const matrix = normalizeChapterSyntaxMatrix(input.chapterSyntaxMatrix);

  const [na, nr, nc] = splitArcChapterCounts(chapterLimit);
  const bookTitle = input.title.trim() || "Your Book";

  const awarenessTitles = sliceTitles(na, awarenessTitleBlueprints, bookTitle, 0);
  const resolutionTitles = sliceTitles(nr, resolutionTitleBlueprints, bookTitle, na);
  const ctaTitles = sliceTitles(nc, ctaTitleBlueprints, bookTitle, na + nr);

  const awareness: DHMChapter[] = [];
  const resolution: DHMChapter[] = [];
  const callToAction: DHMChapter[] = [];

  let globalNum = 1;

  for (let i = 0; i < na; i++) {
    pushChapter(awareness, globalNum++, awarenessTitles[i], "awareness", i, input.audience, input.goal, matrix);
  }
  for (let i = 0; i < nr; i++) {
    pushChapter(resolution, globalNum++, resolutionTitles[i], "resolution", i, input.audience, input.goal, matrix);
  }
  for (let i = 0; i < nc; i++) {
    pushChapter(callToAction, globalNum++, ctaTitles[i], "cta", i, input.audience, input.goal, matrix);
  }

  const chapterThemesOrdered = [
    ...awareness.map((c) => c.chapterTheme),
    ...resolution.map((c) => c.chapterTheme),
    ...callToAction.map((c) => c.chapterTheme),
  ];

  const storyOfThesis = buildStoryOfThesis(chapterThemesOrdered, bookTitle, input.audience, input.goal);

  return {
    arc: { awareness, resolution, callToAction },
    chapterLimit,
    revisionAllowance: revisions,
    plan: planId,
    storyOfThesis,
    chapterSyntaxMatrix: matrix,
  };
}
