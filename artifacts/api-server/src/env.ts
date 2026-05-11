import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(here, "../../..");

config({ path: path.join(workspaceRoot, ".env") });
config({ path: path.join(workspaceRoot, ".env.local"), override: true });

export function getGeminiApiKey(): string {
  const key = process.env["GEMINI_API_KEY"]?.trim();
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set on the API server.");
  }
  return key;
}

export function getGeminiModel(): string {
  return process.env["GEMINI_MODEL"]?.trim() || "gemini-2.0-flash";
}
