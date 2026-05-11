import express, { type Express } from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "./lib/logger";

function resolveSaybookStaticRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "../../saybook-app/dist/public");
}

export function shouldServeSaybookStatic(): boolean {
  const flag = process.env["SERVE_STATIC"]?.trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes";
}

export function attachSaybookStatic(app: Express): void {
  const staticRoot = resolveSaybookStaticRoot();
  if (!existsSync(staticRoot)) {
    logger.warn({ staticRoot }, "SERVE_STATIC enabled but Saybook build output is missing");
    return;
  }

  app.use(express.static(staticRoot, { index: false }));

  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.status(405).json({
        error: "method_not_allowed",
        message: "This host serves the SAYBOOK UI for GET requests only. Use POST /api/... on this service.",
      });
      return;
    }
    res.sendFile(path.join(staticRoot, "index.html"), (err) => {
      if (err) next(err);
    });
  });

  logger.info({ staticRoot }, "Serving Saybook static assets");
}
