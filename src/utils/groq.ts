export const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? "";
export const GROQ_MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL ?? "llama-3.1-8b-instant";
export const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export const callGroqChat = async (params: {
  messages: GroqMessage[];
  maxTokens?: number;
  temperature?: number;
}) => {
  const { messages, maxTokens = 512, temperature = 0.7 } = params;
  if (!GROQ_API_KEY) {
    throw new Error("Missing EXPO_PUBLIC_GROQ_API_KEY");
  }
  const res = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });
  const data = await res.json().catch(() => undefined);
  if (!res.ok) {
    const msg = data?.error?.message ?? `Groq request failed (${res.status})`;
    throw new Error(msg);
  }
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Groq returned an empty response.");
  return text;
};

export const callGroqJsonArray = async (prompt: string, maxTokens = 256, temperature = 0.2) => {
  const text = await callGroqChat({
    messages: [{ role: "user", content: prompt }],
    maxTokens,
    temperature,
  });
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};
