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
  "Each strand has one crisp thesis line (SOT). The chapter Story of Thesis joins those strand lines into one paragraph with discourse markers.",
  "Story lock (when enabled): the chapter opens with Story — only the first strand is forced S‑first; other strands follow normal SAY rotation.",
  "Connectors (Therefore, From there, …) glue strand lines into chapter summaries, and chapter summaries into the book‑level Story of Thesis — only your strand thesis wording is repeated verbatim inside those joins.",
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
  /**
   * Story lock: the **chapter** opens with Story — only the **first** strand is forced
   * to start with S (SYA/SAY style). Other strands follow normal rotation.
   */
  alwaysLeadWithStory: boolean;
}

/** Ensure first strand segment begins with S (Story first for the chapter). */
function chapterFirstStrandStoryLocked(segment: string, chapterIndex: number): string {
  const led = rotateStrandToLeadWithS(segment);
  return chapterIndex % 2 === 0 ? led : alternateSYA_SAY(led);
}

/** Build per-chapter matrix from user template. */
export function varyChapterMatrix(baseMatrix: string, chapterIndex: number, opts: VaryMatrixOptions): string {
  const normalized = normalizeChapterSyntaxMatrix(baseMatrix);
  const patterns = parseStrandPatterns(normalized);
  if (patterns.length === 0) return normalized;

  if (!opts.varyPerChapter) {
    if (!opts.alwaysLeadWithStory) return patterns.join("/");
    const rest = patterns.slice(1).map((seg) => seg);
    return [chapterFirstStrandStoryLocked(patterns[0], chapterIndex), ...rest].join("/");
  }

  return patterns
    .map((seg, strandIdx) => {
      if (opts.alwaysLeadWithStory && strandIdx === 0) {
        return chapterFirstStrandStoryLocked(seg, chapterIndex);
      }
      return rotateStrandSegment(seg, chapterIndex + strandIdx);
    })
    .join("/");
}
