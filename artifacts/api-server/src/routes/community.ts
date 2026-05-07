import { Router, type IRouter } from "express";
import { z } from "zod";
import { appendFounderSuggestion, appendReview } from "../lib/feedbackStore";

const router: IRouter = Router();

const optionalEmail = z.union([z.string().email().max(320), z.literal(""), z.null()]).optional();

const ReviewBodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  authorName: z.string().max(120).optional().nullable(),
  email: optionalEmail,
  review: z.string().min(10).max(8000),
  website: z.string().optional(),
});

const FounderBodySchema = z.object({
  claimedPlan: z.literal("founders"),
  authorName: z.string().max(120).optional().nullable(),
  email: optionalEmail,
  writingProblems: z.string().min(10).max(12000),
  questions: z.string().min(10).max(12000),
  website: z.string().optional(),
});

router.post("/community/reviews", async (req, res) => {
  const parsed = ReviewBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() });
    return;
  }
  const body = parsed.data;
  if (body.website?.trim()) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  try {
    const row = await appendReview({
      rating: body.rating,
      authorName: body.authorName,
      email: body.email || null,
      review: body.review,
    });
    res.status(201).json({ ok: true, id: row.id });
  } catch {
    res.status(500).json({ error: "store_failed" });
  }
});

router.post("/community/founder-feedback", async (req, res) => {
  const parsed = FounderBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() });
    return;
  }
  const body = parsed.data;
  if (body.website?.trim()) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  try {
    const row = await appendFounderSuggestion({
      authorName: body.authorName,
      email: body.email || null,
      writingProblems: body.writingProblems,
      questions: body.questions,
    });
    res.status(201).json({ ok: true, id: row.id });
  } catch {
    res.status(500).json({ error: "store_failed" });
  }
});

export default router;
