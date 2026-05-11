import { Router, type IRouter } from "express";
import { z } from "zod";
import { friendlyGeminiMessage, geminiErrorStatus } from "../lib/geminiErrors";
import { generateDhmWithGemini } from "../services/geminiDhm";

const GenerateDHMBodySchema = z.object({
  title: z.string().min(2),
  audience: z.string().min(2),
  goal: z.string().min(10),
  genre: z.string().optional(),
  plan: z.string().min(1),
  chapterSyntaxMatrix: z.string().optional(),
  syntaxVaryPerChapter: z.boolean().optional(),
  syntaxAlwaysLeadWithStory: z.boolean().optional(),
});

const router: IRouter = Router();

router.post("/dhm", async (req, res) => {
  const parsed = GenerateDHMBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "invalid_body",
      details: parsed.error.flatten(),
    });
    return;
  }

  const body = parsed.data;

  try {
    const result = await generateDhmWithGemini({
      title: body.title,
      audience: body.audience,
      goal: body.goal,
      genre: body.genre,
      plan: body.plan,
      chapterSyntaxMatrix: body.chapterSyntaxMatrix,
      syntaxVaryPerChapter: body.syntaxVaryPerChapter,
      syntaxAlwaysLeadWithStory: body.syntaxAlwaysLeadWithStory,
    });
    res.json(result);
  } catch (err) {
    const raw = err instanceof Error ? err.message : "DHM generation failed.";
    const message = friendlyGeminiMessage(raw);
    res.status(geminiErrorStatus(raw)).json({ error: "dhm_generation_failed", message });
  }
});

export default router;
