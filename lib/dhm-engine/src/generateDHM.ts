import { getPlanLimits, normalizePlan } from "./planLimits";
import {
  labelForCode,
  normalizeChapterSyntaxMatrix,
  parseStrandPatterns,
  varyChapterMatrix,
  type SAYCode,
  type VaryMatrixOptions,
} from "./syntax";
import {
  firstClause,
  goalGloss,
  referAudience,
  referGoal,
  softenClauseForSot,
} from "./phrasing";

export type { SAYCode } from "./syntax";

export interface SAYPoint {
  code: SAYCode;
  label: string;
  pointTheme: string;
  guidance: string;
}

export interface Strand {
  index: number;
  pattern: string;
  points: SAYPoint[];
}

export interface DHMChapter {
  num: number;
  title: string;
  chapterTheme: string;
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
  storyOfThesis: string;
  /** User’s template matrix (slash-separated strands). */
  chapterSyntaxMatrix: string;
}

export interface GenerateDHMInput {
  title: string;
  audience: string;
  goal: string;
  genre?: string;
  plan: string;
  chapterSyntaxMatrix?: string;
  /** When true (default), SAY order shifts by chapter from the template. */
  syntaxVaryPerChapter?: boolean;
  /** When true with variation, every strand still opens with Story (S); alternates SYA/SAY. */
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

function creativeChapterTitle(
  kind: "awareness" | "resolution" | "cta",
  localIdx: number,
  genre: string,
): string {
  const g = genre.toLowerCase();
  const businessy = g.includes("business") || g.includes("self") || g.includes("non");

  const awareness = businessy
    ? [
        "The Quiet Cost of Waiting",
        "What the Dashboard Won’t Tell You",
        "The Assumption That Expires First",
        "When Speed Feels Like Progress",
        "The Leaky Bucket Behind the Strategy",
        "The Meeting After the Meeting",
        "Why “Busy” Hides the Real Risk",
      ]
    : [
        "The Story Readers Tell Themselves First",
        "The Tension Under the Surface",
        "What Everyone Agrees On—Until They Don’t",
        "The Half-Truth Keeping People Stuck",
      ];

  const resolution = businessy
    ? [
        "From Insight to a Working Playbook",
        "The Week You Stop Reinventing the Wheel",
        "Proof You Can Steal From the Field",
        "Designing the Handoff, Not the Hero Moment",
        "Making the Method Boring (On Purpose)",
        "The Review Loop That Actually Sticks",
      ]
    : [
        "Turning Insight Into a Repeatable Practice",
        "The Bridge From Belief to Behavior",
        "What Changes When the Method Shows Up",
      ];

  const cta = businessy
    ? [
        "The Commitment That Survives Monday",
        "Your First 14 Days on the New Rails",
        "Signing the Contract With Yourself",
        "What to Measure So You Don’t Drift",
        "Closing the Loop Without Burning Out",
      ]
    : [
        "The Promise You Ask Them to Keep",
        "What Happens the Morning After",
        "Leaving With One Non‑Negotiable Next Step",
      ];

  const pool = kind === "awareness" ? awareness : kind === "resolution" ? resolution : cta;
  return pool[localIdx % pool.length];
}

function buildChapterTheme(
  kind: "awareness" | "resolution" | "cta",
  audience: string,
  goal: string,
  chapterIdx: number,
  salt: number,
): string {
  const aud = referAudience(audience, salt);
  const g = referGoal(goal, salt + 1);
  const variants = {
    awareness: [
      `If ${aud} keeps navigating without a clear method, clarity erodes before change can stick.`,
      `Until the real tension is named, ${aud} can’t line up around ${g}.`,
      `The hidden price for ${aud} is stalled momentum until ${g} feels reachable, not theoretical.`,
    ],
    resolution: [
      `Here ${aud} trades abstraction for proof—${g} becomes something they can run weekly.`,
      `This chapter anchors accountability: ${aud} bridge intention with repeatable habits tied to ${g}.`,
      `To stabilize progress, ${aud} needs guardrails that honor ${g} without overwhelm.`,
    ],
    cta: [
      `Invite ${aud} to commit: ${g}, made concrete with a single next step.`,
      `Close with a bridge ${aud} can act on tomorrow—no vague inspiration, only ${g} in motion.`,
      `Seal trust by tying ${g} to identity-level change ${aud} can sustain after launch.`,
    ],
  };
  const pool = variants[kind];
  return pool[chapterIdx % pool.length];
}

function strandFocus(strandIdx: number, salt: number): string {
  const pools: string[][] = [
    [
      "the opening problem and what’s at stake",
      "what hurts today if nothing changes",
      "the tension readers feel before your method appears",
    ],
    [
      "the workflow or system you’re installing",
      "how work should run once your approach is live",
      "the repeatable cadence that replaces heroics",
    ],
    [
      "evidence, examples, and how you’ll measure progress",
      "proof, counterarguments you answer, and a simple scoreboard",
      "what convinces skeptics and keeps momentum from fading",
    ],
  ];
  const pool = pools[strandIdx % 3];
  return pool[salt % pool.length];
}

function buildPointTheme(
  code: SAYCode,
  chapterTheme: string,
  audience: string,
  goal: string,
  strandIdx: number,
  pointIdx: number,
  salt: number,
): string {
  const ct = firstClause(chapterTheme, 130);
  const aud = referAudience(audience, salt + strandIdx * 3);
  const g = referGoal(goal, salt + pointIdx * 5 + 2);
  const focus = strandFocus(strandIdx, salt + strandIdx);
  const evidenceBeat =
    pointIdx === 0 ? "an opening, trust-building" : pointIdx === 1 ? "a tightening, doubt-reducing" : "a closing, decision-ready";

  if (code === "S") {
    return [
      `Choose a story centered on ${focus} that dramatizes this chapter’s through-line: ${ct}`,
      `Stage a scene where ${aud} pursues ${g} but collides with ${focus}; end on the emotional turn, not the lecture.`,
      `Use a before/after contrast around ${focus}: show what changes once the chapter’s lesson becomes non‑negotiable.`,
    ][(strandIdx + pointIdx + salt) % 3];
  }

  if (code === "Y") {
    return [
      `Provide ${evidenceBeat} evidence for ${g} (seen through ${focus}): one quantitative anchor, one field example, and one objection you dismantle.`,
      `Pick research suited to ${focus}: benchmark, controlled comparison, expert synthesis, or longitudinal note—then state plainly what it implies for ${g}.`,
      `Lay out a credibility ladder for ${focus}: claim → evidence → limit of the evidence → why the chapter theme still holds.`,
    ][(strandIdx + pointIdx + salt) % 3];
  }

  return [
    `Give ${aud} a three-move playbook for ${focus} that advances ${g} inside the chapter’s argument.`,
    `Offer a lightweight artifact for ${focus} (checklist, prompt bank, scorecard) and show one filled-in example tied to ${g}.`,
    `Define a habit plus a metric for ${focus}: frequency, leading indicator, and what “done well” looks like relative to ${g}.`,
  ][(strandIdx + pointIdx + salt) % 3];
}

function buildPointGuidance(
  code: SAYCode,
  kind: "awareness" | "resolution" | "cta",
  audience: string,
  goal: string,
  strandIdx: number,
  pointIdx: number,
  salt: number,
): string {
  const aud = referAudience(audience, salt + 7);
  const g = referGoal(goal, salt + 9);
  const k = strandIdx + pointIdx + (kind === "awareness" ? 0 : kind === "resolution" ? 3 : 6) + salt;
  const focus = strandFocus(strandIdx, salt + 1);

  if (code === "S") {
    const lines = [
      `Draft a concrete scene for ${focus}: who, where, the decision, and what went wrong or right for ${aud}.`,
      `Anchor one specific moment that shows why ${g} matters; skip abstract backstory and end with a question the evidence answers.`,
      `Close the story with one plain-language sentence that restates the chapter theme without repeating it word for word.`,
    ];
    return lines[k % lines.length];
  }
  if (code === "Y") {
    const lines = [
      `Mix two or three proof types for ${focus} (number, authority, case). Tie each finding back to ${g} and the chapter theme.`,
      `Include at least one verifiable claim for ${focus}, plus a short vignette showing ${aud} applying it.`,
      `Name one realistic doubt about ${focus} (cost, ethics, accuracy, time) and answer it on the page before Advice lands.`,
    ];
    return lines[k % lines.length];
  }
  const lines = [
    `Lay out three steps for ${focus} (setup → execution → review) that ${aud} can finish in under an hour.`,
    `Add one copy-ready line ${aud} can reuse for ${g} (prompt skeleton, checklist item, KPI definition) scoped to ${focus}.`,
    `End this Advice beat with one sentence that hands off cleanly to the next letter in the same strand—no jargon, no “handle the stakes” shorthand.`,
  ];
  return lines[k % lines.length];
}

function buildStrandsForChapter(
  matrix: string,
  chapterTheme: string,
  kind: "awareness" | "resolution" | "cta",
  audience: string,
  goal: string,
  globalSalt: number,
): Strand[] {
  const patterns = parseStrandPatterns(matrix);
  return patterns.map((pattern, strandIdx) => {
    const chars = pattern.split("") as SAYCode[];
    const points: SAYPoint[] = chars.map((code, pointIdx) => ({
      code,
      label: labelForCode(code),
      pointTheme: buildPointTheme(code, chapterTheme, audience, goal, strandIdx, pointIdx, globalSalt + strandIdx * 10 + pointIdx),
      guidance: buildPointGuidance(code, kind, audience, goal, strandIdx, pointIdx, globalSalt + strandIdx * 10 + pointIdx),
    }));
    return { index: strandIdx + 1, pattern, points };
  });
}

export function buildStoryOfThesis(
  chapterThemes: string[],
  bookTitle: string,
  audience: string,
  goal: string,
): string {
  const markers = ["Therefore,", "Yet", "Next,", "Still,", "From there,", "Finally,"];
  const title = bookTitle.trim() || "this project";
  const gloss = goalGloss(goal, chapterThemes.length);

  if (chapterThemes.length === 0) {
    return `${title} builds one sustained case for ${gloss}.`;
  }

  const beats = chapterThemes.map((raw, i) => {
    const clause = firstClause(raw, 100);
    return softenClauseForSot(clause, audience, i);
  });

  let body = beats[0];
  for (let i = 1; i < beats.length; i++) {
    const m = markers[(i - 1) % markers.length];
    const b = beats[i];
    const next = b.charAt(0).toLowerCase() + b.slice(1);
    body += ` ${m} ${next}`;
  }

  return `${body} Together, these movements form the Story of Thesis for ${title}—one arc for ${referAudience(audience, 99)}, grounded in ${gloss}.`;
}

function pushChapter(
  bucket: DHMChapter[],
  num: number,
  title: string,
  kind: "awareness" | "resolution" | "cta",
  chapterIdx: number,
  globalChapterIndex: number,
  audience: string,
  goal: string,
  matrixTemplate: string,
  syntaxOpts: VaryMatrixOptions,
): void {
  const matrix = varyChapterMatrix(matrixTemplate, globalChapterIndex, syntaxOpts);
  const chapterTheme = buildChapterTheme(kind, audience, goal, chapterIdx, globalChapterIndex * 17);
  const strands = buildStrandsForChapter(matrix, chapterTheme, kind, audience, goal, globalChapterIndex * 31);
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
  const matrixTemplate = normalizeChapterSyntaxMatrix(input.chapterSyntaxMatrix);

  const syntaxOpts: VaryMatrixOptions = {
    varyPerChapter: input.syntaxVaryPerChapter !== false,
    alwaysLeadWithStory: input.syntaxAlwaysLeadWithStory === true,
  };

  const [na, nr, nc] = splitArcChapterCounts(chapterLimit);
  const genre = (input.genre ?? "non-fiction").trim() || "non-fiction";

  const awareness: DHMChapter[] = [];
  const resolution: DHMChapter[] = [];
  const callToAction: DHMChapter[] = [];

  let globalNum = 1;
  let globalChapterIndex = 0;

  for (let i = 0; i < na; i++) {
    const title = creativeChapterTitle("awareness", i, genre);
    pushChapter(
      awareness,
      globalNum++,
      title,
      "awareness",
      i,
      globalChapterIndex++,
      input.audience,
      input.goal,
      matrixTemplate,
      syntaxOpts,
    );
  }
  for (let i = 0; i < nr; i++) {
    const title = creativeChapterTitle("resolution", i, genre);
    pushChapter(
      resolution,
      globalNum++,
      title,
      "resolution",
      i,
      globalChapterIndex++,
      input.audience,
      input.goal,
      matrixTemplate,
      syntaxOpts,
    );
  }
  for (let i = 0; i < nc; i++) {
    const title = creativeChapterTitle("cta", i, genre);
    pushChapter(
      callToAction,
      globalNum++,
      title,
      "cta",
      i,
      globalChapterIndex++,
      input.audience,
      input.goal,
      matrixTemplate,
      syntaxOpts,
    );
  }

  const chapterThemesOrdered = [
    ...awareness.map((c) => c.chapterTheme),
    ...resolution.map((c) => c.chapterTheme),
    ...callToAction.map((c) => c.chapterTheme),
  ];

  const bookTitle = input.title.trim() || "Your Book";
  const storyOfThesis = buildStoryOfThesis(chapterThemesOrdered, bookTitle, input.audience, input.goal);

  return {
    arc: { awareness, resolution, callToAction },
    chapterLimit,
    revisionAllowance: revisions,
    plan: planId,
    storyOfThesis,
    chapterSyntaxMatrix: matrixTemplate,
  };
}
