import { getPlanLimits, normalizePlan } from "./planLimits";
import {
  labelForCode,
  normalizeChapterSyntaxMatrix,
  parseStrandPatterns,
  varyChapterMatrix,
  type SAYCode,
  type VaryMatrixOptions,
} from "./syntax";
import { buildStoryOfThesis, joinThesisParagraph, splitArcChapterCounts } from "./generateDHM";
import type { DHMArc, DHMChapter, DHMResult, GenerateDHMInput, SAYPoint, Strand } from "./generateDHM";
import { DHM_ENGINE_VERSION } from "./generateDHM";

export interface GeminiStrandOutline {
  strandThesis: string;
  points: { pointTheme: string; guidance: string }[];
}

export interface GeminiChapterOutline {
  title: string;
  strands: GeminiStrandOutline[];
}

function buildStrandsFromOutline(matrix: string, outline: GeminiChapterOutline): Strand[] {
  const patterns = parseStrandPatterns(matrix);
  if (outline.strands.length !== patterns.length) {
    throw new Error(
      `Chapter "${outline.title}" has ${outline.strands.length} strands but the syntax matrix requires ${patterns.length}.`,
    );
  }

  return patterns.map((pattern, strandIdx) => {
    const strandOutline = outline.strands[strandIdx]!;
    const chars = pattern.split("") as SAYCode[];
    if (strandOutline.points.length !== chars.length) {
      throw new Error(
        `Chapter "${outline.title}" strand ${strandIdx + 1} has ${strandOutline.points.length} SAY points but pattern ${pattern} requires ${chars.length}.`,
      );
    }
    const points: SAYPoint[] = chars.map((code, pointIdx) => {
      const slot = strandOutline.points[pointIdx]!;
      return {
        code,
        label: labelForCode(code),
        pointTheme: slot.pointTheme.replace(/\s+/g, " ").trim(),
        guidance: slot.guidance.replace(/\s+/g, " ").trim(),
      };
    });
    return {
      index: strandIdx + 1,
      strandThesis: strandOutline.strandThesis.replace(/\s+/g, " ").trim(),
      pattern,
      points,
    };
  });
}

export function assembleDhmFromGeminiOutlines(
  input: GenerateDHMInput,
  outlines: GeminiChapterOutline[],
): DHMResult {
  const planId = normalizePlan(input.plan);
  const { chapters: chapterLimit, revisions } = getPlanLimits(planId);
  const matrixTemplate = normalizeChapterSyntaxMatrix(input.chapterSyntaxMatrix);

  const syntaxOpts: VaryMatrixOptions = {
    varyPerChapter: input.syntaxVaryPerChapter !== false,
    alwaysLeadWithStory: input.syntaxAlwaysLeadWithStory === true,
  };

  const [na, nr, nc] = splitArcChapterCounts(chapterLimit);
  const expected = na + nr + nc;
  if (outlines.length !== expected) {
    throw new Error(`Expected ${expected} chapters for plan ${planId}, received ${outlines.length}.`);
  }

  const awareness: DHMChapter[] = [];
  const resolution: DHMChapter[] = [];
  const callToAction: DHMChapter[] = [];

  let globalNum = 1;
  let globalChapterIndex = 0;

  const push = (bucket: DHMChapter[], outline: GeminiChapterOutline) => {
    const matrix = varyChapterMatrix(matrixTemplate, globalChapterIndex, syntaxOpts);
    const strands = buildStrandsFromOutline(matrix, outline);
    const chapterStoryOfThesis = joinThesisParagraph(strands.map((s) => s.strandThesis), {
      tier: "chapter",
      markerOffset: globalChapterIndex,
    });
    bucket.push({
      num: globalNum++,
      title: outline.title.replace(/\s+/g, " ").trim(),
      chapterStoryOfThesis,
      strands,
      chapterSyntaxMatrix: matrix,
    });
    globalChapterIndex += 1;
  };

  for (let i = 0; i < na; i++) push(awareness, outlines[globalChapterIndex]!);
  for (let i = 0; i < nr; i++) push(resolution, outlines[globalChapterIndex]!);
  for (let i = 0; i < nc; i++) push(callToAction, outlines[globalChapterIndex]!);

  const chapterStoriesOrdered = [
    ...awareness.map((c) => c.chapterStoryOfThesis),
    ...resolution.map((c) => c.chapterStoryOfThesis),
    ...callToAction.map((c) => c.chapterStoryOfThesis),
  ];

  return {
    arc: { awareness, resolution, callToAction } satisfies DHMArc,
    chapterLimit,
    revisionAllowance: revisions,
    plan: planId,
    storyOfThesis: buildStoryOfThesis(chapterStoriesOrdered, chapterStoriesOrdered.length),
    chapterSyntaxMatrix: matrixTemplate,
    dhmEngineVersion: DHM_ENGINE_VERSION,
  };
}
