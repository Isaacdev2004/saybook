import { getPlanLimits, normalizePlan } from "./planLimits";
import { normalizeChapterSyntaxMatrix, varyChapterMatrix, type VaryMatrixOptions } from "./syntax";
import { splitArcChapterCounts } from "./generateDHM";
import type { GenerateDHMInput } from "./generateDHM";

export type ArcSection = "awareness" | "resolution" | "callToAction";

export interface ChapterMatrixPlan {
  chapterCount: number;
  arcSections: ArcSection[];
  matrices: string[];
}

export function buildChapterMatrixPlan(input: GenerateDHMInput): ChapterMatrixPlan {
  const planId = normalizePlan(input.plan);
  const { chapters: chapterLimit } = getPlanLimits(planId);
  const [na, nr, nc] = splitArcChapterCounts(chapterLimit);
  const matrixTemplate = normalizeChapterSyntaxMatrix(input.chapterSyntaxMatrix);
  const syntaxOpts: VaryMatrixOptions = {
    varyPerChapter: input.syntaxVaryPerChapter !== false,
    alwaysLeadWithStory: input.syntaxAlwaysLeadWithStory === true,
  };

  const arcSections: ArcSection[] = [
    ...Array.from({ length: na }, () => "awareness" as const),
    ...Array.from({ length: nr }, () => "resolution" as const),
    ...Array.from({ length: nc }, () => "callToAction" as const),
  ];

  const matrices = arcSections.map((_, idx) => varyChapterMatrix(matrixTemplate, idx, syntaxOpts));

  return { chapterCount: arcSections.length, arcSections, matrices };
}
