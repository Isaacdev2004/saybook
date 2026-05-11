import type { DHMResult } from "@workspace/dhm-engine";
import { apiUrl } from "./apiBase";

export interface RequestDhmPayload {
  title: string;
  audience: string;
  goal: string;
  genre?: string;
  plan: string;
  chapterSyntaxMatrix?: string;
  syntaxVaryPerChapter?: boolean;
  syntaxAlwaysLeadWithStory?: boolean;
}

async function readJsonBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(
      `The server returned an empty response (HTTP ${res.status}). ` +
        "Start the API server locally, or set VITE_API_BASE_URL to your API host (not the static Saybook site URL).",
    );
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    const preview = text.replace(/\s+/g, " ").trim().slice(0, 120);
    throw new Error(
      `The server did not return JSON (HTTP ${res.status}). ` +
        `Check VITE_API_BASE_URL points at the API service. Response started with: ${preview}`,
    );
  }
}

export async function requestDhmGeneration(payload: RequestDhmPayload): Promise<DHMResult> {
  const url = apiUrl("/api/dhm");
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      `Could not reach the DHM API at ${url}. Start the API server (PORT in .env) or fix VITE_API_BASE_URL.`,
    );
  }

  const data = await readJsonBody(res);

  if (!res.ok) {
    const body = data as { message?: string; error?: string };
    const message =
      body.message ||
      body.error ||
      `Outline generation failed (HTTP ${res.status}).`;
    throw new Error(message);
  }

  return data as DHMResult;
}
