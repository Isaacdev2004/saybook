import { apiUrl } from "./apiBase";

export async function submitReview(body: {
  rating: number;
  authorName?: string;
  email?: string;
  review: string;
  website?: string;
}): Promise<void> {
  const res = await fetch(apiUrl("/api/community/reviews"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rating: body.rating,
      authorName: body.authorName?.trim() || undefined,
      email: body.email?.trim() || undefined,
      review: body.review.trim(),
      website: body.website ?? "",
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Request failed (${res.status})`);
  }
}

export async function submitFounderFeedback(body: {
  authorName?: string;
  email?: string;
  writingProblems: string;
  questions: string;
  website?: string;
}): Promise<void> {
  const res = await fetch(apiUrl("/api/community/founder-feedback"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      claimedPlan: "founders" as const,
      authorName: body.authorName?.trim() || undefined,
      email: body.email?.trim() || undefined,
      writingProblems: body.writingProblems.trim(),
      questions: body.questions.trim(),
      website: body.website ?? "",
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Request failed (${res.status})`);
  }
}

export interface ReviewRecordDto {
  id: string;
  createdAt: string;
  rating: number;
  authorName: string | null;
  email: string | null;
  review: string;
}

export interface FounderSuggestionDto {
  id: string;
  createdAt: string;
  authorName: string | null;
  email: string | null;
  writingProblems: string;
  questions: string;
  faqKeywords: string[];
  adminReply: string | null;
  repliedAt: string | null;
}

export async function fetchAdminCommunity(token: string): Promise<{ reviews: ReviewRecordDto[]; founderSuggestions: FounderSuggestionDto[] }> {
  const res = await fetch(apiUrl("/api/admin/community"), {
    headers: { Authorization: `Bearer ${token.trim()}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to load (${res.status})`);
  }
  return res.json() as Promise<{ reviews: ReviewRecordDto[]; founderSuggestions: FounderSuggestionDto[] }>;
}

export async function postAdminFounderReply(token: string, id: string, reply: string): Promise<FounderSuggestionDto> {
  const res = await fetch(apiUrl(`/api/admin/community/founder/${encodeURIComponent(id)}/reply`), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reply: reply.trim() }),
  });
  if (!res.ok) throw new Error(`Save failed (${res.status})`);
  const data = (await res.json()) as { item: FounderSuggestionDto };
  return data.item;
}
