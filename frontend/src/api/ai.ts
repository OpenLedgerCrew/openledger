export interface AiSummaryResponse {
  summary: string;
  source: "ai" | "fallback";
  generated_at: string;
}

export interface ChatResponse {
  reply: string;
  source: "ai" | "fallback";
}

export async function fetchAiSummary(programmeId: string): Promise<AiSummaryResponse> {
  const res = await fetch(`/api/programmes/${programmeId}/ai-summary`);
  if (!res.ok) throw new Error(`AI summary request failed (${res.status})`);
  return res.json();
}

export async function sendChatMessage(message: string, programmeId?: string): Promise<ChatResponse> {
  const res = await fetch(`/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, programmeId }),
  });
  if (!res.ok) throw new Error(`Chat request failed (${res.status})`);
  return res.json();
}
