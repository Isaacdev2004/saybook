/** SAY point vocabulary — used in PDF/DOCX key and labels */
export const SAY_LABELS = {
  S: "Storytelling",
  Y: "Yielded Evidence",
  A: "Advice",
} as const;

export type SAYCode = keyof typeof SAY_LABELS;

/** Printed at top of DHM exports */
export const SYNTAX_KEY_BLOCK = [
  "Syntax KEY: Storytelling, Advice, Yielded Evidence",
  "Letter codes — S = Storytelling · Y = Yielded Evidence · A = Advice",
  "Each letter is one SAY point. Three letters = one strand (subheading). Slashes separate strands in your chapter matrix (e.g. SYA/YAA/AYA = three strands × three SAY points).",
].join("\n");

export function labelForCode(char: string): string {
  if (char === "S") return SAY_LABELS.S;
  if (char === "Y") return SAY_LABELS.Y;
  if (char === "A") return SAY_LABELS.A;
  return char;
}

/** Validates segments like SYA/YAA/AYA — each segment exactly three chars from {S,Y,A}. */
export function normalizeChapterSyntaxMatrix(raw: string | undefined): string {
  if (!raw || !raw.trim()) return "SYA";
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, "");
  const parts = cleaned.split("/").filter(Boolean);
  const segOk = (s: string) => /^[SYA]{3}$/.test(s);
  if (parts.length === 0 || !parts.every(segOk)) return "SYA";
  return parts.join("/");
}

export function parseStrandPatterns(matrix: string): string[] {
  return matrix.split("/").filter(Boolean);
}
