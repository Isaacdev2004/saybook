import type { RequestHandler } from "express";
import { Router, type IRouter } from "express";
import { z } from "zod";
import { getFullStore, setFounderReply } from "../lib/feedbackStore";

const router: IRouter = Router();

const bearerGuard: RequestHandler = (req, res, next) => {
  const expected = process.env["SAYBOOK_ADMIN_TOKEN"];
  if (!expected || expected.length < 8) {
    res.status(503).json({
      error: "admin_not_configured",
      message: "Set SAYBOOK_ADMIN_TOKEN (min 8 chars) on the API server.",
    });
    return;
  }
  const auth = req.headers.authorization;
  const bearer = auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : undefined;
  if (bearer !== expected) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
};

router.get("/admin/community", bearerGuard, async (_req, res) => {
  try {
    const store = await getFullStore();
    res.json(store);
  } catch {
    res.status(500).json({ error: "store_failed" });
  }
});

const ReplyBodySchema = z.object({
  reply: z.string().min(1).max(12000),
});

router.post("/admin/community/founder/:id/reply", bearerGuard, async (req, res) => {
  const parsed = ReplyBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() });
    return;
  }
  try {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];
    if (!id) {
      res.status(400).json({ error: "invalid_id" });
      return;
    }
    const updated = await setFounderReply(id, parsed.data.reply);
    if (!updated) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ ok: true, item: updated });
  } catch {
    res.status(500).json({ error: "store_failed" });
  }
});

export default router;
