import { getPlanLimits, normalizePlan } from "./planLimits";

export type DHMSyntax = "SYA" | "ASA" | "YAA";

export interface DHMChapter {
  num: number;
  title: string;
  /** Statement of thesis / Story-of-Thesis style line */
  sot: string;
  syntax: DHMSyntax;
  advice: string;
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
}

export interface GenerateDHMInput {
  title: string;
  audience: string;
  goal: string;
  genre?: string;
  plan: string;
}

const SYNTAX_CYCLE: DHMSyntax[] = ["SYA", "ASA", "YAA"];

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

function syntaxForIndex(globalIndex: number): DHMSyntax {
  return SYNTAX_CYCLE[globalIndex % SYNTAX_CYCLE.length];
}

function buildSot(kind: "awareness" | "resolution" | "cta", audience: string, goal: string, chapterIdx: number): string {
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

function buildAdvice(kind: "awareness" | "resolution" | "cta", audience: string, goal: string, chapterIdx: number): string {
  const aud = clampSnippet(audience, 40);
  const g = clampSnippet(goal, 48);
  const variants = {
    awareness: [
      `Lead with a lived scenario ${aud} recognizes, then reveal why "${g}" reframes the stakes.`,
      `Surface objections gently — show ${aud} you've anticipated why they'd hesitate.`,
      `Keep paragraphs tight; let curiosity pull ${aud} toward your methodology.`,
    ],
    resolution: [
      `Offer one framework per chapter beat so ${aud} can sketch "${g}" onto their calendar.`,
      `Mirror ${aud}'s vocabulary while advancing proof points — familiarity compounds trust.`,
      `Alternate reflection prompts with tactical lists so energy stays high.`,
    ],
    cta: [
      `Deliver a crisp rally cry tied to "${g}" — specificity converts browsers into advocates.`,
      `Give ${aud} a worksheet or checklist so momentum survives after the final page.`,
      `End with contrast: life without "${g}" vs the disciplined path you prescribe.`,
    ],
  };
  const pool = variants[kind];
  return pool[chapterIdx % pool.length];
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

export function generateDHM(input: GenerateDHMInput): DHMResult {
  const planId = normalizePlan(input.plan);
  const { chapters: chapterLimit, revisions } = getPlanLimits(planId);

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
    const num = globalNum++;
    awareness.push({
      num,
      title: awarenessTitles[i],
      sot: buildSot("awareness", input.audience, input.goal, i),
      syntax: syntaxForIndex(num - 1),
      advice: buildAdvice("awareness", input.audience, input.goal, i),
    });
  }
  for (let i = 0; i < nr; i++) {
    const num = globalNum++;
    resolution.push({
      num,
      title: resolutionTitles[i],
      sot: buildSot("resolution", input.audience, input.goal, i),
      syntax: syntaxForIndex(num - 1),
      advice: buildAdvice("resolution", input.audience, input.goal, i),
    });
  }
  for (let i = 0; i < nc; i++) {
    const num = globalNum++;
    callToAction.push({
      num,
      title: ctaTitles[i],
      sot: buildSot("cta", input.audience, input.goal, i),
      syntax: syntaxForIndex(num - 1),
      advice: buildAdvice("cta", input.audience, input.goal, i),
    });
  }

  return {
    arc: { awareness, resolution, callToAction },
    chapterLimit,
    revisionAllowance: revisions,
    plan: planId,
  };
}
