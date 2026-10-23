export function getApiErrorMessages(error: unknown): string[] {
  if (!error || typeof error !== "object") return ["The request failed. Please try again."];

  const payload = error as { message?: unknown; errors?: unknown };
  const messages: string[] = [];
  if (typeof payload.message === "string" && payload.message.trim()) {
    messages.push(payload.message.trim());
  }

  if (payload.errors && typeof payload.errors === "object") {
    for (const value of Object.values(payload.errors)) {
      if (Array.isArray(value)) {
        messages.push(...value.filter((item): item is string => typeof item === "string"));
      } else if (typeof value === "string") {
        messages.push(value);
      }
    }
  }

  return [...new Set(messages.length ? messages : ["The request failed. Please try again."])];
}

export function throwApiError(error: unknown): never {
  const message = getApiErrorMessages(error).join(" ");
  throw new Response(message, { status: 502, statusText: message });
}
