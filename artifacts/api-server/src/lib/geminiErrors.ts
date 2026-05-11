export function geminiErrorStatus(message: string): number {
  if (message.includes("GEMINI_API_KEY")) return 503;
  if (/429|too many requests|quota exceeded|resource_exhausted/i.test(message)) return 429;
  return 502;
}

export function friendlyGeminiMessage(message: string): string {
  if (!/429|too many requests|quota exceeded|resource_exhausted/i.test(message)) {
    return message;
  }

  if (/limit:\s*0|free_tier/i.test(message)) {
    return (
      "This Google AI project has no free-tier quota for the selected Gemini model. " +
      "Set GEMINI_MODEL to a model with free access (for example gemini-2.5-flash), " +
      "or enable billing in Google AI Studio, then restart the API server."
    );
  }

  return (
    "Gemini rate limit reached. Wait about a minute and try again, " +
    "or switch GEMINI_MODEL / enable billing on the API key project."
  );
}
