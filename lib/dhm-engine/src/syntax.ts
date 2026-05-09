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

/** Section title for point-level themes (matches client revision sheet). */
export function pointThemeHeading(code: SAYCode): string {
  if (code === "S") return "Story theme";
  if (code === "Y") return "Yielded Evidence theme";
  return "Advice theme";
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

/** Rotate a 3-letter strand so a different SAY letter leads (S/Y/A cycle). */
export function rotateStrandSegment(segment: string, steps: number): string {
  const s = segment.toUpperCase();
  if (!/^[SYA]{3}$/.test(s)) return segment;
  const chars = s.split("") as SAYCode[];
  const n = ((steps % 3) + 3) % 3;
  return `${chars[n]}${chars[(n + 1) % 3]}${chars[(n + 2) % 3]}`;
}

/** Rotate segment until it starts with S (Storytelling). */
export function rotateStrandToLeadWithS(segment: string): string {
  const s = segment.toUpperCase();
  if (!/^[SYA]{3}$/.test(s)) return segment;
  const idx = s.indexOf("S");
  if (idx <= 0) return s;
  return s.slice(idx) + s.slice(0, idx);
}

/** Swap the two letters after S between SYA ↔ SAY (both start with Story). */
export function alternateSYA_SAY(segment: string): string {
  const s = segment.toUpperCase();
  if (s === "SYA") return "SAY";
  if (s === "SAY") return "SYA";
  const led = rotateStrandToLeadWithS(s);
  return led === "SYA" || led === "SAY" ? led : "SYA";
}

export interface VaryMatrixOptions {
  /** When true, each chapter gets rotated strand orders from the template. */
  varyPerChapter: boolean;
  /** When true with varyPerChapter, each strand keeps S first; alternates SYA/SAY. */
  alwaysLeadWithStory: boolean;
}

/** Build per-chapter matrix from user template. */
export function varyChapterMatrix(baseMatrix: string, chapterIndex: number, opts: VaryMatrixOptions): string {
  const normalized = normalizeChapterSyntaxMatrix(baseMatrix);
  const patterns = parseStrandPatterns(normalized);
  if (!opts.varyPerChapter) return patterns.join("/");

  return patterns
    .map((seg, strandIdx) => {
      const salt = chapterIndex + strandIdx * 2;
      if (opts.alwaysLeadWithStory) {
        const led = rotateStrandToLeadWithS(seg);
        return salt % 2 === 0 ? led : alternateSYA_SAY(led);
      }
      return rotateStrandSegment(seg, chapterIndex + strandIdx);
    })
    .join("/");
}
