import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import {
  assembleDhmFromGeminiOutlines,
  buildChapterMatrixPlan,
  type GenerateDHMInput,
  type DHMResult,
} from "@workspace/dhm-engine";
import { getGeminiApiKey, getGeminiModel } from "../env";

const GeminiPointSchema = z.object({
  pointTheme: z.string().min(8),
  guidance: z.string().min(8),
});

const GeminiStrandSchema = z.object({
  strandThesis: z.string().min(8),
  points: z.array(GeminiPointSchema).min(1),
});

const GeminiChapterSchema = z.object({
  title: z.string().min(2),
  strands: z.array(GeminiStrandSchema).min(1),
});

const GeminiOutlineSchema = z.object({
  chapters: z.array(GeminiChapterSchema).min(1),
});

function buildPrompt(input: GenerateDHMInput): string {
  const plan = buildChapterMatrixPlan(input);
  const chapterSpecs = plan.matrices
    .map((matrix, idx) => {
      const section = plan.arcSections[idx]!;
      const arc =
        section === "callToAction" ? "CALL TO ACTION" : section.toUpperCase();
      const strands = matrix.split("/");
      const strandLines = strands
        .map((pattern, sIdx) => {
          const letters = pattern.split("").join(", ");
          return `    Strand ${sIdx + 1} pattern ${pattern} (${letters}) — exactly ${pattern.length} points in order`;
        })
        .join("\n");
      return `Chapter ${idx + 1} [${arc}] matrix ${matrix}:\n${strandLines}`;
    })
    .join("\n\n");

  return `You are SAYBOOK's Double Helix Map (DHM) architect.

Book context (for reasoning only — do not paste these strings verbatim into themes or guidance):
- Working title: ${input.title}
- Audience: ${input.audience}
- Main goal / message: ${input.goal}
- Genre: ${input.genre ?? "non-fiction"}

Write ${plan.chapterCount} distinct chapters that progress the argument for this book. Each chapter must feel new; never reuse the same scene, thesis, or advice.

DHM rules:
- Each chapter has strands; each strand has one crisp strand thesis (SOT line) plus one SAY block per letter in the strand pattern.
- S = Storytelling (lived scene), Y = Yielded Evidence (proof, data, cases), A = Advice (clear moves).
- Use simple, concrete English. Themes are content pours (what to write), not meta instructions like "write 400 words".
- Do not repeat the book title, chapter title, audience label, or main goal as boilerplate in every point.
- Strand thesis lines are woven later into chapter Story of Thesis; write them as complete thesis sentences.
- Story lock: when the first strand of a chapter begins with S, open that chapter with Story in strand 1 only.

Chapter syntax (points per strand must match pattern length exactly):
${chapterSpecs}

Return JSON only:
{
  "chapters": [
    {
      "title": "Chapter title",
      "strands": [
        {
          "strandThesis": "One thesis sentence for this strand.",
          "points": [
            { "pointTheme": "...", "guidance": "..." }
          ]
        }
      ]
    }
  ]
}`;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return JSON.parse(fenced[1].trim());
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
  throw new Error("Gemini response did not contain JSON.");
}

export async function generateDhmWithGemini(input: GenerateDHMInput): Promise<DHMResult> {
  const apiKey = getGeminiApiKey();
  const modelName = getGeminiModel();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.75,
      responseMimeType: "application/json",
    },
  });

  const prompt = buildPrompt(input);
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  if (!text?.trim()) {
    throw new Error("Gemini returned an empty outline.");
  }

  const parsed = GeminiOutlineSchema.parse(extractJson(text));
  return assembleDhmFromGeminiOutlines(input, parsed.chapters);
}
