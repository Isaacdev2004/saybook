export interface BookContext {
  audienceLabel: string;
  promise: string;
  partnerLabel: string;
  isBusiness: boolean;
  useAiPartnerArc: boolean;
}

function collapse(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function shorten(text: string, max: number): string {
  const t = collapse(text);
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function paraphraseAudience(audience: string): string {
  const a = collapse(audience);
  if (!a) return "your readers";
  const lower = a.toLowerCase();
  if (lower.includes("entrepreneur") || lower.includes("founder")) return "founders building lean companies";
  if (lower.includes("leader") || lower.includes("executive")) return "operators leading growing teams";
  if (lower.includes("creator") || lower.includes("writer")) return "creators shipping work under deadline";
  return shorten(a, 72);
}

function paraphrasePromise(goal: string): string {
  const g = collapse(goal);
  if (!g) return "the change the book argues for";
  const lower = g.toLowerCase();
  if (lower.includes("assistant") || lower.includes("partner")) {
    return "treating intelligent software as a dependable business partner, not a novelty search box";
  }
  if (lower.includes("prove") || lower.includes("show")) {
    return shorten(g.replace(/^(to\s+)?(prove|show)\s+that\s+/i, ""), 96);
  }
  return shorten(g, 96);
}

function partnerLabel(title: string, goal: string): string {
  const blob = `${title} ${goal}`.toLowerCase();
  if (blob.includes("machine") || blob.includes("partner")) return "machine partner";
  if (blob.includes("assistant")) return "business assistant";
  if (blob.includes("agent")) return "agent stack";
  if (blob.includes("ai") || blob.includes("artificial intelligence")) return "AI partner";
  return "intelligent system";
}

function detectAiPartnerArc(title: string, goal: string, genre: string): boolean {
  const blob = `${title} ${goal} ${genre}`.toLowerCase();
  return (
    /\b(ai|artificial intelligence|machine|assistant|agent|automation|llm)\b/.test(blob) ||
    blob.includes("partner")
  );
}

export function buildBookContext(input: {
  title: string;
  audience: string;
  goal: string;
  genre?: string;
}): BookContext {
  const genre = collapse(input.genre ?? "non-fiction").toLowerCase();
  const isBusiness =
    genre.includes("business") ||
    genre.includes("entrepreneur") ||
    genre.includes("self") ||
    /\b(founder|startup|operator|executive)\b/i.test(input.audience);

  return {
    audienceLabel: paraphraseAudience(input.audience),
    promise: paraphrasePromise(input.goal),
    partnerLabel: partnerLabel(input.title, input.goal),
    isBusiness,
    useAiPartnerArc: detectAiPartnerArc(input.title, input.goal, genre),
  };
}
