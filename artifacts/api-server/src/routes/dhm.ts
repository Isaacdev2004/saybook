import { Router, type IRouter } from "express";
import { z } from "zod";
import { generateDHM } from "@workspace/dhm-engine";

const GenerateDHMBodySchema = z.object({
  title: z.string().min(2),
  audience: z.string().min(2),
  goal: z.string().min(10),
  genre: z.string().optional(),
  plan: z.string().min(1),
});

const router: IRouter = Router();

/** Mock DHM endpoint — same logic as the SAYBOOK client; ready for AI swap later. */
router.post("/dhm", (req, res) => {
  const parsed = GenerateDHMBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "invalid_body",
      details: parsed.error.flatten(),
    });
    return;
  }

  const body = parsed.data;
  const result = generateDHM({
    title: body.title,
    audience: body.audience,
    goal: body.goal,
    genre: body.genre,
    plan: body.plan,
  });

  res.json(result);
});

export default router;
