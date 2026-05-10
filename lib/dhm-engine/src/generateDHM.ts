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
  goalIntentShort,
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
  chapterTitle: string,
): string {
  const aud = referAudience(audience, salt);
  const g = referGoal(goal, salt + 1);
  const intent = goalIntentShort(goal, salt + chapterIdx * 11);
  const t = chapterTitle.replace(/^["']|["']$/g, "").trim() || "this chapter";

  const awareness = [
    `“${t}” names the gap between habit and breakthrough: until ${aud} sees that gap honestly, ${intent} stays abstract.`,
    `This chapter uses “${t}” to surface the hidden cost of delay—what ${aud} sacrifices week by week while ${intent} waits on the sidelines.`,
    `Under "${t}," you show why polite skepticism is expensive: ${aud} needs a clearer picture of risk before they'll invest in ${intent}.`,
    `Frame “${t}” as the reader’s wake-up scene—emotion first, then logic—so ${aud} feels why ${intent} is no longer optional.`,
    `Let “${t}” expose the story readers tell themselves to stay safe; your counter-story points them toward ${intent}.`,
    `Use “${t}” to collapse false trade-offs (${aud} believes X blocks Y); you reunite those threads around ${intent}.`,
    `“${t}” is where you prove the status quo has a bill due—${aud} should finish the chapter unable to pretend ${intent} can wait.`,
    `Anchor “${t}” in one vivid contrast (then vs now, insider vs outsider) so ${aud} recognizes themselves before you argue ${intent}.`,
    `Through “${t},” establish credibility by empathy: you understand ${aud}’s constraints, then narrow the path to ${intent}.`,
  ];

  const resolution = [
    `“${t}” moves proof into motion: ${aud} leaves with a method—not a mood—for ${intent}.`,
    `Here “${t}” turns principle into sequence: what to do Monday, what to check Friday, all aimed at ${intent}.`,
    `This chapter (“${t}”) is your reliability chapter—systems, guardrails, and feedback loops so ${intent} doesn’t collapse under busy weeks.`,
    `Under “${t},” trade hero stories for repeatable plays: ${aud} copies a workflow, not a personality, to advance ${intent}.`,
    `Use “${t}” to stack evidence next to execution—each claim earns the next step toward ${intent}.`,
    `“${t}” answers “how, exactly?” with templates and examples so ${aud} can rehearse ${intent} before going live.`,
    `Let “${t}” shrink the gap between insight and habit: one ritual, one metric, one review cadence tied to ${intent}.`,
    `Frame “${t}” as debugging: where ${aud}’s effort leaks, and how to patch it without shame—still aiming at ${intent}.`,
    `Close “${t}” with a crisp outcome statement: after this chapter, ${aud} knows what “good” looks like for ${intent}.`,
  ];

  const cta = [
    `“${t}” asks for a decision: ${aud} chooses a commitment that makes ${intent} unavoidable in the next two weeks.`,
    `This chapter (“${t}”) ends with a signature moment—${aud} states aloud (or writes) the pledge that locks in ${intent}.`,
    `Under “${t},” remove escape hatches: one primary action, one consequence of skipping it, one reward for keeping ${intent}.`,
    `Use “${t}” to bridge inspiration and calendar: ${aud} schedules the first concrete block of work toward ${intent}.`,
    `Let “${t}” translate values into velocity—identity language (“I am the kind of person who…”) tied to ${intent}.`,
    `“${t}” is where you compress the whole arc: ${aud} sees the finish line and names the next three moves for ${intent}.`,
    `Finish “${t}” with social proof plus personal accountability—who ${aud} tells, what they report, how ${intent} stays visible.`,
    `Anchor “${t}” in measurement without overwhelm: one scoreboard ${aud} checks weekly to guard ${intent}.`,
    `Close “${t}” by looping back to chapter one’s tension—now resolved through action toward ${intent}.`,
  ];

  const pool = kind === "awareness" ? awareness : kind === "resolution" ? resolution : cta;
  return pool[(chapterIdx + salt * 3) % pool.length];
}

function strandFocus(strandIdx: number, salt: number): string {
  const pools: string[][] = [
    [
      "stakes before tactics",
      "the mistake everyone excuses",
      "the emotion hiding behind metrics",
      "where urgency actually lives",
      "the identity fear underneath 'later'",
      "two opposing truths readers hold at once",
    ],
    [
      "sequence of moves (not vibes)",
      "handoffs between people or tools",
      "cadence: daily vs weekly rhythms",
      "where friction piles up in real workflows",
      "the smallest viable system that works",
      "failure modes when enthusiasm fades",
    ],
    [
      "what counts as proof here",
      "objections that kill adoption",
      "scorekeeping readers respect",
      "before/after deltas worth citing",
      "where anecdotes fail and numbers win",
      "ethics, accuracy, or bias readers fear",
    ],
  ];
  const pool = pools[strandIdx % 3];
  return pool[(salt + strandIdx * 5) % pool.length];
}

function buildPointTheme(
  code: SAYCode,
  audience: string,
  goal: string,
  strandIdx: number,
  pointIdx: number,
  salt: number,
  chapterTitle: string,
): string {
  const aud = referAudience(audience, salt + strandIdx * 3);
  const intent = goalIntentShort(goal, salt + strandIdx + pointIdx);
  const focus = strandFocus(strandIdx, salt + strandIdx);
  const t = chapterTitle.replace(/^["']|["']$/g, "").trim() || "this chapter";
  const beat = pointIdx === 0 ? "Open" : pointIdx === 1 ? "Deepen" : "Land";
  const idx = (strandIdx * 9 + pointIdx * 13 + salt * 7) % 1000;

  if (code === "S") {
    const pool = [
      `${beat} “${t}” through lived detail: one protagonist, one pressure point related to ${focus}, ending on the insight that sets up evidence.`,
      `Tell a single decisive scene for ${focus}—no montage—so ${aud} feels why ${intent} belongs in their real week.`,
      `Contrast two paths around ${focus}: the expensive default vs the disciplined alternative your chapter champions.`,
      `Use dialogue or internal monologue to expose the belief blocking ${intent}; let ${focus} carry the subtext.`,
      `Borrow structure from memoir or journalism: scene → reflection tied to ${focus}, always pointing toward ${intent}.`,
      `Pick an antagonist (market noise, legacy habit, bad incentive) and dramatize how it attacks ${focus}.`,
    ];
    return pool[idx % pool.length];
  }

  if (code === "Y") {
    const pool = [
      `Curate proof for ${focus}: primary source + secondary synthesis + one conflicting study you reconcile—each tied to ${intent}.`,
      `Pull industry metrics, a controlled experiment, or a regulator/advisory stance—then translate jargon into what ${aud} should conclude about ${intent}.`,
      `Interview-style testimony or transcript excerpt that illustrates ${focus}; pair it with a hard number so skeptics engage.`,
      `Compare two credible frameworks side by side on ${focus}; show trade-offs, then pick the fit for ${intent}.`,
      `Meta-analysis or survey snapshot if available; if not, triangulate with three independent signals about ${focus}.`,
      `Address an ethics or misuse angle on ${focus} before critics do—then restate why ${intent} stays responsible.`,
    ];
    return pool[idx % pool.length];
  }

  const pool = [
    `Give ${aud} an executable mini-playbook for ${focus}: three numbered moves that advance ${intent} inside “${t}”.`,
    `Ship one tangible artifact (worksheet, prompt stack, rubric) scoped to ${focus}; fill one row as a worked example toward ${intent}.`,
    `Define a weekly ritual plus one KPI for ${focus}; specify failure signals and a recovery step aligned with ${intent}.`,
    `Translate ${intent} into a decision tree for ${focus}: if X then Y; include one “stop rule” to avoid busywork.`,
    `Offer a constraint-based exercise for ${focus} (time-box, budget cap, quality bar) so ${aud} ships instead of polishing.`,
    `Close Advice with a rehearsal script: what ${aud} says, schedules, or commits—mapped to ${focus} and ${intent}.`,
  ];
  return pool[idx % pool.length];
}

function buildPointGuidance(
  code: SAYCode,
  kind: "awareness" | "resolution" | "cta",
  audience: string,
  goal: string,
  strandIdx: number,
  pointIdx: number,
  salt: number,
  chapterTitle: string,
): string {
  const aud = referAudience(audience, salt + 7);
  const intent = goalIntentShort(goal, salt + strandIdx);
  const focus = strandFocus(strandIdx, salt + 1);
  const t = chapterTitle.replace(/^["']|["']$/g, "").trim() || "this chapter";
  const ring =
    kind === "awareness" ? 0 : kind === "resolution" ? 9 : 18;
  const k = strandIdx + pointIdx + ring + salt;
  const idx = (k * 11 + salt) % 48;

  if (code === "S") {
    const lines = [
      `Write 400–700 words: one setting, one conflict tied to ${focus}, one turn that previews ${intent}.`,
      `Start in media res; reveal stakes for ${aud} within two paragraphs; close with a question Evidence must answer.`,
      `Ban slogans—show behavior: what ${aud} clicks, says, or avoids when ${focus} gets tested.`,
      `Use sensory specifics (time of day, tool, metric on screen) so ${focus} feels filmed, not summarized.`,
      `After the scene, add two sentences of interpretation linking to ${intent}—still in plain English.`,
      `If you use a composite character, say so once; keep empathy high and jargon low.`,
    ];
    return lines[idx % lines.length];
  }
  if (code === "Y") {
    const lines = [
      `Label each source type inline (study / practitioner / dataset). End with: “So for ${aud}, this implies…” about ${intent}.`,
      `Include one figure readers can sanity-check (growth rate, error margin, sample size). Translate it into a sentence ${aud} can quote.`,
      `Present a mini “rival hypotheses” paragraph on ${focus}: why skeptics doubt, what evidence shifts the balance.`,
      `Pair qualitative proof with numeric guardrails—numbers anchor emotion about ${focus}.`,
      `If evidence is emerging, say what would falsify your claim—credibility rises when ${aud} sees honesty.`,
      `Close Yielded Evidence with a bridge sentence that tees up Advice without repeating “${t}” verbatim.`,
    ];
    return lines[idx % lines.length];
  }
  const linesGeneral = [
    `Turn ${intent} into a checklist ${aud} can run this week; cap it at seven bullets scoped to ${focus}.`,
    `Specify definition of done for ${focus}: observable signal, timestamp, and owner.`,
    `Give one worked micro-example (names anonymized) showing ${focus} before and after your Advice.`,
    `Replace motivational clichés with mechanics: triggers, environments, accountability hooks.`,
    `End with one imperative sentence that connects to the next SAY letter in this strand.`,
    `Advance ${intent} without burying ${aud} in jargon; tie every bullet to ${focus}.`,
  ];
  const linesCta = [
    `End Advice with an irreversible next step toward ${intent}: calendar block, public pledge, or metric baseline tied to ${focus}.`,
    `Ask ${aud} to name an accountability partner or channel for reporting progress on ${intent}.`,
    `Close with a commitment ritual appropriate to the book's close: signed pledge, voice memo, or dated note.`,
    `Pair the next step with one consequence of delay and one reward for follow-through about ${focus}.`,
    `Ship a seven-day starter plan for ${intent}; each day one micro-action tied to ${focus}.`,
    `Schedule the first review date in-text so ${intent} does not evaporate after the chapter ends.`,
  ];
  const pool = kind === "cta" ? linesCta : linesGeneral;
  return pool[idx % pool.length];
}

function buildStrandsForChapter(
  matrix: string,
  kind: "awareness" | "resolution" | "cta",
  audience: string,
  goal: string,
  globalSalt: number,
  chapterTitle: string,
): Strand[] {
  const patterns = parseStrandPatterns(matrix);
  return patterns.map((pattern, strandIdx) => {
    const chars = pattern.split("") as SAYCode[];
    const points: SAYPoint[] = chars.map((code, pointIdx) => ({
      code,
      label: labelForCode(code),
      pointTheme: buildPointTheme(
        code,
        audience,
        goal,
        strandIdx,
        pointIdx,
        globalSalt + strandIdx * 10 + pointIdx,
        chapterTitle,
      ),
      guidance: buildPointGuidance(
        code,
        kind,
        audience,
        goal,
        strandIdx,
        pointIdx,
        globalSalt + strandIdx * 10 + pointIdx,
        chapterTitle,
      ),
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

  return `${body} Together, these movements form the Story of Thesis for ${title} - one arc for ${referAudience(audience, 99)}, grounded in ${gloss}.`;
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
  const chapterTheme = buildChapterTheme(kind, audience, goal, chapterIdx, globalChapterIndex * 17, title);
  const strands = buildStrandsForChapter(matrix, kind, audience, goal, globalChapterIndex * 31, title);
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
