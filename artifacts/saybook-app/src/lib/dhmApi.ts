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

export async function requestDhmGeneration(payload: RequestDhmPayload): Promise<DHMResult> {
  const res = await fetch(apiUrl("/api/dhm"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = `Outline generation failed (${res.status}).`;
    try {
      const data = (await res.json()) as { message?: string; error?: string };
      if (data.message) message = data.message;
      else if (data.error) message = data.error;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return (await res.json()) as DHMResult;
}
