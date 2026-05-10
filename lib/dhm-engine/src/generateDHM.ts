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
  /** Verbatim join of this chapter’s strand thesis lines, using discourse markers. */
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
  /** Verbatim join of each chapter’s Story of Thesis summary (book-level SOT). */
  storyOfThesis: string;
  /** User’s template matrix (slash-separated strands). */
  chapterSyntaxMatrix: string;
  /**
   * Increment when outline rules change. Clients should regenerate cached DHMs when this
   * does not match the current engine. Omitted on older saved outlines.
   */
  dhmEngineVersion?: number;
}

/** Current DHM engine revision — bump when structure or weaving rules change. */
export const DHM_ENGINE_VERSION = 2;

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
   * Story lock: each **chapter** opens with Story — only the **first** strand is forced
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
  "From there,",
  "Building on that,",
  "In the next movement,",
  "Alongside that,",
  "Then,",
  "Subsequently,",
  "Finally,",
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

type ArcKind = "awareness" | "resolution" | "cta";

/** Simple, concrete thesis lines per arc × strand position (3 pools per arc). */
const STRAND_THESIS: Record<ArcKind, [string[], string[], string[]]> = {
  awareness: [
    [
      "Most creative work still leaks into busywork instead of the thinking that actually moves the draft.",
      "People pay in evenings and weekends while the real risk hides in small daily delays.",
      "The hidden cost is not laziness; it is attention split across tools that feel essential.",
      "Readers often defend the habit that hurts them because change can feel like admitting waste.",
      "Urgency shows up in meetings and inboxes long before the deeper problem is named.",
      "The story people use to stay safe often sounds reasonable until the full cost is added up.",
      "Stakes stay invisible when every week looks full but the main work never gets a clear block.",
      "Fear of waste can feel smaller than fear of change, so the old path keeps winning.",
      "The calendar fills with reactive tasks while the long game waits for a mythical open afternoon.",
      "Noise passes for rigor when nobody names what ‘done’ looks like for the real work.",
    ],
    [
      "Trying to fix structure and wording at once overloads working memory and stalls every pass.",
      "Editing while drafting trains the eye to polish sentences before the argument holds.",
      "When proof and story arrive out of order, the chapter feels smart but does not convince.",
      "A split focus makes every paragraph feel finished before the arc is even clear.",
      "Readers sense confusion before they can name it when evidence lands before stakes do.",
      "Sequence matters because belief needs a scene before a statistic can land with force.",
      "The common fix is to rearrange the same material instead of choosing one job per pass.",
      "Working memory buckles when the writer sorts logic, voice, and proof in a single sitting.",
      "Clarity breaks when every paragraph tries to win the argument before the reader knows what is at stake.",
      "Momentum dies when the writer pauses to fix tone while the structure is still untested.",
    ],
    [
      "Skepticism keeps winning when the old map still feels true even after it stops working.",
      "Proof only bites after readers admit the gap between what they do and what they want.",
      "Polite doubt is expensive when it lets a broken workflow survive another quarter.",
      "Without an honest picture of risk, good intentions recycle the same slow cycle.",
      "Evidence needs a face and a number or it stays abstract advice on a slide.",
      "The status quo wins whenever the cost of waiting feels smaller than the cost of change.",
      "Readers need to see the bill before they will fund a new method with real effort.",
      "Abstract encouragement fails when the old routine still looks cheaper than the new one.",
      "Hope without numbers lets people nod along and change nothing on Monday.",
      "Trust shifts only when the pain of staying put is named in plain, specific terms.",
    ],
  ],
  resolution: [
    [
      "A working method turns insight into a sequence readers can run on a normal week.",
      "The goal is a small playbook, not a mood: steps, order, and a clear stop rule.",
      "Replace hero moments with a boring loop that still works when motivation dips.",
      "Clarity means one primary path through the material, not every option at once.",
      "Readers should leave able to rehearse the move before they go live with it.",
      "The shift is from inspiration to a checklist that fits real constraints.",
      "What matters is repeatability, not how clever the idea sounds in the room.",
      "A good method names the first action, the check, and what to do when it fails.",
      "Readers need a script they can run tired — not a peak‑performance fantasy.",
      "The win is a boring repeat win: same steps, same guardrails, fewer heroics.",
    ],
    [
      "Systems beat willpower: handoffs, owners, and a review cadence that does not humiliate.",
      "Design the week so the new habit has a time box, a tool, and a trigger.",
      "Guardrails matter because busy weeks will always try to pull people back to the old rail.",
      "A light scoreboard keeps the new path visible without turning life into a spreadsheet.",
      "Feedback should be fast enough to correct course before shame sets in.",
      "The method should survive a bad day, not only a perfect one.",
      "Build the handoff between people or tools so nothing important lives only in memory.",
      "When enthusiasm fades, the system is what keeps the promise from dissolving.",
      "Defaults should make the right thing easier; shame should never be the primary fuel.",
      "Small rituals beat big speeches when the goal is behavior that survives stress.",
    ],
    [
      "Evidence here should be triangulated: story, number, and a second source that disagrees at first.",
      "Show the before and after in terms readers can verify without trusting charisma alone.",
      "Name the main objection, then answer it with data a skeptic can look up.",
      "One strong study beats five vague anecdotes if you explain what it does not prove.",
      "Accuracy builds trust; hedging every sentence does not.",
      "If the field is still divided, say so, then show how you still choose a path.",
      "Readers respect proof that includes failure modes, not only wins.",
      "End this block with a line that makes the next advice feel earned, not asserted.",
      "Transparency about limits lands better than pretending the case is airtight.",
      "Readers forgive uncertainty when they see honest scope and careful sourcing.",
    ],
  ],
  cta: [
    [
      "This chapter should end with a decision readers can own in plain language.",
      "Ask for one commitment that makes the new path harder to cancel quietly.",
      "The close is a signature moment: a pledge that fits the book’s promise without fluff.",
      "Remove escape hatches: one primary action and one honest consequence of skipping it.",
      "Identity language helps if it is tied to a dated action, not a slogan.",
      "Readers should know what they are saying yes to before they turn the page.",
      "Make the ask proportional to the evidence they have already accepted.",
      "The decision should feel serious and doable on the same breath.",
      "Ask readers to name what they will stop doing to protect the new yes.",
      "One brave sentence of commitment outperforms a page of rally language.",
    ],
    [
      "Bridge inspiration to the calendar: a first block of time with a start and an end.",
      "Name who they tell and how they report back so the plan survives Monday.",
      "Accountability works when it is specific: person, channel, and frequency.",
      "A public pledge should be small enough to keep and concrete enough to measure.",
      "Give one recovery move for when the first week slips, without excusing drift.",
      "The next step should fit a normal inbox, not a fantasy schedule.",
      "Social proof helps when it shows peers like them who stayed with it.",
      "Close with momentum: schedule before motivation fades.",
      "Peer examples land when they mirror constraints, not when they sound exceptional.",
      "Make the first checkpoint embarrassingly small so pride does not block the start.",
    ],
    [
      "Pick one scoreboard readers can check weekly without drowning in metrics.",
      "Measurement should signal drift early, not punish people for being human.",
      "End by looping back to the tension from early chapters, now answered with action.",
      "Compress the arc: readers see the finish line and the next three moves.",
      "Offer a seven-day starter where each day is one small win tied to the same aim.",
      "What gets measured should match what you actually want to improve.",
      "Readers should know what good looks like after this chapter ends.",
      "Leave one non‑negotiable next step that fits the rest of their life.",
      "Victory is visible continuity — not a single spike of effort.",
      "Close the loop with gratitude for progress, not punishment for slip‑ups.",
    ],
  ],
};

function buildStrandThesis(kind: ArcKind, strandIdx: number, salt: number): string {
  const row = STRAND_THESIS[kind][strandIdx % 3]!;
  return row[Math.abs(salt) % row.length]!;
}

function creativeChapterTitle(kind: ArcKind, localIdx: number, genre: string): string {
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
        "The Question They Won’t Say Out Loud",
        "When Loyalty Becomes a Liability",
        "The Small Compromise That Grows",
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
        "The Day the Tool Becomes a Habit",
        "Proof You Can Borrow Without Permission",
        "When the Work Stops Feeling Fragile",
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
        "The Line They Cross in Ink",
        "Who They Tell Before They Quit",
        "The Measure That Makes Honesty Cheap",
      ];

  const pool = kind === "awareness" ? awareness : kind === "resolution" ? resolution : cta;
  return pool[localIdx % pool.length]!;
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
      "the cost of delay in ordinary language",
      "what readers risk if nothing shifts",
    ],
    [
      "sequence of moves (not vibes)",
      "handoffs between people or tools",
      "cadence: daily vs weekly rhythms",
      "where friction piles up in real workflows",
      "the smallest viable system that works",
      "failure modes when enthusiasm fades",
      "the minimum viable ritual that still counts",
      "where shortcuts quietly undo progress",
    ],
    [
      "what counts as proof here",
      "objections that kill adoption",
      "scorekeeping readers respect",
      "before/after deltas worth citing",
      "where anecdotes fail and numbers win",
      "ethics, accuracy, or bias readers fear",
      "limits of the evidence (say them aloud)",
      "what skeptics need to hear before they move",
    ],
  ];
  const pool = pools[strandIdx % 3]!;
  return pool[(salt + strandIdx * 5) % pool.length]!;
}

/** Plain-language themes — does not quote title, audience, goal, or strand thesis verbatim. */
function buildPointTheme(code: SAYCode, strandIdx: number, pointIdx: number, salt: number): string {
  const focus = strandFocus(strandIdx, salt + strandIdx);
  const beat = pointIdx === 0 ? "Open" : pointIdx === 1 ? "Deepen" : "Land";
  const idx = (strandIdx * 9 + pointIdx * 13 + salt * 7) % 1000;

  if (code === "S") {
    const pool = [
      `${beat} with one lived scene: one person, one pressure point around ${focus}, ending where the insight lands.`,
      `Tell a single decisive moment about ${focus}—no montage—so readers feel why this block matters.`,
      `Contrast two paths around ${focus}: the costly default next to the disciplined alternative.`,
      `Use dialogue or inner voice to show the belief that blocks change; let ${focus} carry the subtext.`,
      `Borrow a tight scene → reflection shape tied to ${focus}; keep the camera close.`,
      `Pick a clear antagonist (noise, habit, bad incentive) and show how it attacks ${focus}.`,
      `Anchor ${focus} in a specific place and time so the reader cannot shrug it off as generic advice.`,
      `Let embarrassment, relief, or anger surface once—then steer back to ${focus} with restraint.`,
      `End Story on a hinge line that hands Yielded Evidence a clean question to answer.`,
      `Keep vocabulary plain; let weight come from detail around ${focus}, not from clever phrasing.`,
    ];
    return pool[idx % pool.length]!;
  }

  if (code === "Y") {
    const pool = [
      `Curate proof for ${focus}: one strong source, one second angle, and how you handle a conflict.`,
      `Pull one metric or study readers can sanity‑check; translate jargon into a plain takeaway.`,
      `Use testimony or a short excerpt that illustrates ${focus}; pair it with a hard number.`,
      `Compare two credible views on ${focus}; show trade‑offs, then pick the fit for this arc.`,
      `If the evidence is mixed, say so; show how you still justify the next step.`,
      `Address misuse or blind spots on ${focus} before critics do—then land the fair claim.`,
      `Cite primary material where possible; summarize fairly; note what you cannot prove yet.`,
      `Stack three grades of proof for ${focus}: observation, measurement, and independent check.`,
      `Close Yielded Evidence with one sentence that signals what Advice will optimize.`,
      `Where data is thin, be explicit about sample size, date, and context for ${focus}.`,
    ];
    return pool[idx % pool.length]!;
  }

  const pool = [
    `Give readers a small playbook for ${focus}: three numbered moves they can run this week.`,
    `Ship one tangible artifact (worksheet, prompt stack, rubric) scoped to ${focus}; show one filled row.`,
    `Define a weekly rhythm plus one signal for ${focus}; say what “off track” looks like.`,
    `Turn the strand’s claim into a simple decision tree for ${focus}: if X then Y; add one stop rule.`,
    `Offer a time‑boxed exercise for ${focus} so people ship instead of polishing.`,
    `Close Advice with a short rehearsal: what they say, schedule, or commit—mapped to ${focus}.`,
    `Name one habit to drop and one to install — both tied to ${focus}, both realistic.`,
    `Give a fallback plan for travel, illness, or overload so ${focus} survives bad weeks.`,
    `End with a single sentence readers could text to a friend about what they will do for ${focus}.`,
    `Tie each bullet to an observable outcome so Advice reads like engineering, not cheerleading.`,
  ];
  return pool[idx % pool.length]!;
}

function buildPointGuidance(
  code: SAYCode,
  kind: ArcKind,
  strandIdx: number,
  pointIdx: number,
  salt: number,
): string {
  const focus = strandFocus(strandIdx, salt + 1);
  const ring = kind === "awareness" ? 0 : kind === "resolution" ? 9 : 18;
  const k = strandIdx + pointIdx + ring + salt;
  const idx = (k * 11 + salt) % 48;

  if (code === "S") {
    const lines = [
      `Write 400–700 words: one setting, one conflict tied to ${focus}, one turn that sets up evidence.`,
      `Start in the middle of action; show stakes within two paragraphs; end with a question evidence must answer.`,
      `Avoid slogans—show behavior: what someone clicks, says, or avoids when ${focus} is tested.`,
      `Use concrete detail (time, tool, number on screen) so ${focus} feels filmed, not summarized.`,
      `After the scene, add two plain sentences that interpret what just happened for this strand.`,
      `If you blend real stories, say so once; keep empathy high and jargon low.`,
    ];
    return lines[idx % lines.length]!;
  }
  if (code === "Y") {
    const lines = [
      `Label source types inline (study / practitioner / dataset). End with what this implies for readers in one sentence.`,
      `Include one figure readers can repeat (rate, margin, sample size). Translate it into everyday words.`,
      `Offer a short “rival story” on ${focus}: why skeptics doubt, what would change their mind.`,
      `Pair a human example with a numeric guardrail so proof feels grounded.`,
      `If evidence is early or noisy, say what would prove you wrong—honesty raises trust.`,
      `Bridge to Advice without repeating the same sentence you used to open the strand.`,
    ];
    return lines[idx % lines.length]!;
  }
  const linesGeneral = [
    `Turn the strand’s aim into a checklist readers can run this week; cap it at seven bullets tied to ${focus}.`,
    `State a clear “done” signal for ${focus}: what we see, when, and who owns it.`,
    `Give one short before/after example (names changed) that shows ${focus} shifting.`,
    `Swap motivational lines for mechanics: triggers, environment, accountability hooks.`,
    `End with one clear imperative that hands off to the next SAY letter in this strand.`,
    `Keep language plain; tie every bullet to ${focus} and the shift this block argues for.`,
  ];
  const linesCta = [
    `End Advice with one irreversible next step tied to ${focus}: calendar block, public pledge, or baseline metric.`,
    `Ask readers to name how they will report progress so the plan survives a rough week.`,
    `Close with a commitment ritual that fits the book’s close: dated note, voice memo, or signed line.`,
    `Pair the next step with one risk of delay and one reward for follow‑through about ${focus}.`,
    `Offer a seven‑day starter: each day one micro‑action tied to ${focus}.`,
    `Schedule the first review date in the text so momentum does not vanish after the chapter.`,
  ];
  const pool = kind === "cta" ? linesCta : linesGeneral;
  return pool[idx % pool.length]!;
}

function buildStrandsForChapter(matrix: string, kind: ArcKind, globalSalt: number): Strand[] {
  const patterns = parseStrandPatterns(matrix);
  return patterns.map((pattern, strandIdx) => {
    const thesisSalt = globalSalt * 31 + strandIdx * 17;
    const strandThesis = buildStrandThesis(kind, strandIdx, thesisSalt);
    const chars = pattern.split("") as SAYCode[];
    const points: SAYPoint[] = chars.map((code, pointIdx) => ({
      code,
      label: labelForCode(code),
      pointTheme: buildPointTheme(code, strandIdx, pointIdx, globalSalt + strandIdx * 10 + pointIdx),
      guidance: buildPointGuidance(code, kind, strandIdx, pointIdx, globalSalt + strandIdx * 10 + pointIdx),
    }));
    return { index: strandIdx + 1, strandThesis, pattern, points };
  });
}

/** Book-level Story of Thesis: verbatim weave of each chapter’s Story of Thesis paragraph. */
export function buildStoryOfThesis(chapterStoryParagraphs: string[], markerOffset = 0): string {
  return joinThesisParagraph(chapterStoryParagraphs, { tier: "book", markerOffset });
}

function pushChapter(
  bucket: DHMChapter[],
  num: number,
  title: string,
  kind: ArcKind,
  chapterIdx: number,
  globalChapterIndex: number,
  matrixTemplate: string,
  syntaxOpts: VaryMatrixOptions,
): void {
  const matrix = varyChapterMatrix(matrixTemplate, globalChapterIndex, syntaxOpts);
  const strands = buildStrandsForChapter(matrix, kind, globalChapterIndex * 47 + chapterIdx * 3);
  const chapterStoryOfThesis = joinThesisParagraph(strands.map((s) => s.strandThesis), {
    tier: "chapter",
    markerOffset: globalChapterIndex,
  });
  bucket.push({
    num,
    title,
    chapterStoryOfThesis,
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
      matrixTemplate,
      syntaxOpts,
    );
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
