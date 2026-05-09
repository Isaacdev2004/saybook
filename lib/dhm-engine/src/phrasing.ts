/** Rotate wording so we do not paste the same audience / goal verbatim everywhere. */

export function referAudience(audience: string, salt: number): string {
  const a = audience.replace(/\s+/g, " ").trim();
  if (!a) return "your readers";
  const templates = [
    a,
    `your intended readers (${a})`,
    `people in your audience—especially ${a}`,
    `${a}`,
    `readers who match this profile: ${a}`,
    `the professionals you’re writing for (${a})`,
    `this book’s primary audience (${a})`,
  ];
  return templates[Math.abs(salt) % templates.length];
}

export function referAudiencePronoun(salt: number): "they" | "your readers" {
  return salt % 3 === 0 ? "they" : "your readers";
}

/** Goal / thesis without repeating the full quoted string every time. */
export function referGoal(goal: string, salt: number): string {
  const g = goal.replace(/\s+/g, " ").trim();
  if (!g) return "the transformation you promise";
  const short = g.length > 72 ? `${g.slice(0, 69).trim()}…` : g;
  const templates = [
    short,
    `the outcome you’re arguing for (${short})`,
    `that central idea—${short}`,
    short,
    `the change you want readers to adopt: ${short}`,
    `your book’s practical promise (${short})`,
    `the shift you’re proving is possible (${short})`,
  ];
  return templates[Math.abs(salt) % templates.length];
}

/** Very short book-level gloss for closing sentences (avoid pasting the full goal again). */
export function goalGloss(goal: string, salt: number): string {
  const g = goal.replace(/\s+/g, " ").trim();
  if (!g) return "the thesis you develop chapter by chapter";
  const short = g.length > 88 ? `${g.slice(0, 85).trim()}…` : g;
  const templates = [
    short,
    "the transformation you argue for from first page to last",
    "the practical promise running beneath every chapter",
    "the through-line readers should feel even when wording shifts",
    short,
    `your book’s core contention (in brief: ${short})`,
  ];
  return templates[Math.abs(salt) % templates.length];
}

export function firstClause(text: string, maxLen = 140): string {
  const t = text.replace(/\s+/g, " ").trim();
  const stop = t.search(/[.!?](\s|$)/);
  const clause = stop > 0 ? t.slice(0, stop + 1) : t;
  if (clause.length <= maxLen) return clause;
  return `${clause.slice(0, maxLen - 1).trim()}…`;
}

/** Light rewrite: swap leading audience phrase for pronoun sometimes. */
export function softenClauseForSot(clause: string, audience: string, idx: number): string {
  let s = clause.trim();
  const a = audience.replace(/\s+/g, " ").trim();
  if (a && idx % 2 === 1 && s.startsWith(a)) {
    s = `They ${s.slice(a.length).trim()}`;
  }
  if (a && idx % 3 === 2 && s.includes(a)) {
    s = s.replace(a, "these readers");
  }
  return s;
}
