import { useCallback, useState } from "react";
import { GEMINI_ENDPOINT, GEMINI_SAFETY_SETTINGS } from "@/src/utils/gemini";
import { callGroqChat, GroqMessage } from "@/src/utils/groq";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
  source?: "gemini" | "groq";
};

type GeminiContent = {
  role: "user" | "model";
  parts: { text: string }[];
};

const RESPONSE_STYLE_HINT =
  "You are a mental health support assistant. Respond in 3-6 sentences. " +
  "Be supportive, avoid long lists, and finish the thought. " +
  "If the user asks about non-mental-health topics, politely redirect to mental health support.";
const MAX_OUTPUT_TOKENS = 800;
const MAX_RETRIES = 2;
const TOPIC_MATCH_TOKENS = 48;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const isRetryableError = (status: number | undefined, message: string) => {
  if (status && [429, 500, 502, 503, 504].includes(status)) return true;
  return /high demand|rate limit|resource exhausted|quota|temporar/i.test(message);
};
const isSafetyBlocked = (data: any) => {
  const promptBlock = data?.promptFeedback?.blockReason;
  const finishReason = data?.candidates?.[0]?.finishReason;
  return promptBlock || finishReason === "SAFETY";
};
const isSafetyErrorMessage = (message: string) =>
  /safety|blocked|harm|self-harm|suicide|policy/i.test(message);

export function useGemini() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callGroqReply = useCallback(
    async (history: ChatMessage[], topicContext?: string) => {
      const systemLines = [
        "You are a supportive mental health companion.",
        "If the user asks about non-mental-health topics, politely redirect to mental health support.",
        RESPONSE_STYLE_HINT,
      ];
      if (topicContext) systemLines.push(`Topic focus: ${topicContext}`);
      const historyMessages: GroqMessage[] = history.map((item) => ({
        role: item.role === "assistant" ? "assistant" : "user",
        content: item.text,
      }));
      const messages: GroqMessage[] = [
        { role: "system", content: systemLines.join(" ") },
        ...historyMessages,
      ];
      return callGroqChat({ messages, maxTokens: MAX_OUTPUT_TOKENS, temperature: 0.7 });
    },
    []
  );

  const callGroqClassifier = useCallback(
    async (prompt: string, key: "related" | "offTopic") => {
      const messages: GroqMessage[] = [{ role: "user", content: prompt }];
      const text = await callGroqChat({
        messages,
        maxTokens: TOPIC_MATCH_TOKENS,
        temperature: 0.1,
      });
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (typeof parsed?.[key] === "boolean") return parsed[key] as boolean;
      }
      const lowered = text.toLowerCase();
      if (key === "related") {
        if (/\btrue\b/.test(lowered)) return true;
        if (/\bfalse\b/.test(lowered)) return false;
      }
      if (key === "offTopic") {
        if (/\btrue\b/.test(lowered)) return true;
        if (/\bfalse\b/.test(lowered)) return false;
      }
      return null;
    },
    []
  );

  const checkTopicMatch = useCallback(
    async (message: string, topicLabel: string, topicDescription?: string | null) => {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        try {
          const strictPrompt = [
            "Decide if the user's message is related to the selected topic.",
            "Be strict. Only return true if the message is clearly about the selected topic or very closely related.",
            "If you are unsure, return false.",
            "General mental health talk is NOT enough when a specific topic is selected.",
            "Treat short acknowledgements or follow-ups (e.g., yes/ok/thanks/tell me more) as related.",
            'Return ONLY {"related":true} or {"related":false}.',
            `Selected topic: "${topicLabel}"`,
            topicDescription ? `User description: """${topicDescription.trim()}"""` : "",
            `User message: """${message.trim()}"""`,
            "Examples:",
            'Selected topic: "sleep" | Message: "I want to laugh loud." -> {"related":false}',
            'Selected topic: "sleep" | Message: "I keep waking up at night." -> {"related":true}',
            'Selected topic: "anxiety" | Message: "I failed exams and feel worried." -> {"related":true}',
            'Selected topic: "anxiety" | Message: "I feel great and optimistic." -> {"related":false}',
          ]
            .filter(Boolean)
            .join("\n");
          const strict = await callGroqClassifier(strictPrompt, "related");
          if (strict === true) return true;
          const offTopicPrompt = [
            "Decide if the user's message is clearly unrelated to the selected topic.",
            "Return true only when the message is clearly about a different topic.",
            "If you are unsure, return false.",
            "Short acknowledgements or follow-ups should be treated as NOT off-topic.",
            'Return ONLY {"offTopic":true} or {"offTopic":false}.',
            `Selected topic: "${topicLabel}"`,
            topicDescription ? `User description: """${topicDescription.trim()}"""` : "",
            `User message: """${message.trim()}"""`,
          ]
            .filter(Boolean)
            .join("\n");
          const offTopic = await callGroqClassifier(offTopicPrompt, "offTopic");
          if (offTopic === true) return false;
          if (offTopic === false) return true;
          return false;
        } catch {
          return false;
        }
      }
      const prompt = [
        "You are a classifier. Decide if the user's message is related to the selected topic.",
        "Be strict. Only return true if the message is clearly about the selected topic or very closely related.",
        "If you are unsure, return false.",
        "General mental health talk is NOT enough when a specific topic is selected.",
        "If the selected topic is mental health or wellbeing, only allow mental-health-related messages.",
        "Treat short acknowledgements or follow-ups (e.g., yes/ok/thanks/tell me more) as related.",
        "Return ONLY a JSON object like {\"related\":true} or {\"related\":false}.",
        `Selected topic: "${topicLabel}"`,
        topicDescription ? `User description: """${topicDescription.trim()}"""` : "",
        `User message: """${message.trim()}"""`,
        "Examples:",
        'Selected topic: "sleep" | Message: "I want to laugh loud." -> {"related":false}',
        'Selected topic: "sleep" | Message: "I keep waking up at night." -> {"related":true}',
        'Selected topic: "anxiety" | Message: "I failed exams and feel worried." -> {"related":true}',
        'Selected topic: "anxiety" | Message: "I feel great and optimistic." -> {"related":false}',
      ]
        .filter(Boolean)
        .join("\n");

      try {
        const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, topP: 0.5, maxOutputTokens: TOPIC_MATCH_TOKENS },
            safetySettings: GEMINI_SAFETY_SETTINGS,
          }),
        });
        const data = await res.json().catch(() => undefined);
        if (!res.ok || isSafetyBlocked(data)) {
          return false;
        }
        const text = data?.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text ?? "")
          .join("\n")
          .trim();
        if (!text) return false;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (typeof parsed?.related === "boolean") {
            if (parsed.related) return true;
          }
        } else if (/\btrue\b/i.test(text)) {
          return true;
        } else if (/\bfalse\b/i.test(text)) {
          return false;
        }

        const offTopicPrompt = [
          "Decide if the user's message is clearly unrelated to the selected topic.",
          "Return true only when the message is clearly about a different topic.",
          "If you are unsure, return false.",
          "Short acknowledgements or follow-ups should be treated as NOT off-topic.",
          'Return ONLY {"offTopic":true} or {"offTopic":false}.',
          `Selected topic: "${topicLabel}"`,
          topicDescription ? `User description: """${topicDescription.trim()}"""` : "",
          `User message: """${message.trim()}"""`,
        ]
          .filter(Boolean)
          .join("\n");
        const offTopicRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: offTopicPrompt }] }],
            generationConfig: { temperature: 0.1, topP: 0.5, maxOutputTokens: TOPIC_MATCH_TOKENS },
            safetySettings: GEMINI_SAFETY_SETTINGS,
          }),
        });
        const offTopicData = await offTopicRes.json().catch(() => undefined);
        if (!offTopicRes.ok || isSafetyBlocked(offTopicData)) return false;
        const offTopicText = offTopicData?.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text ?? "")
          .join("\n")
          .trim();
        if (!offTopicText) return false;
        const offTopicJson = offTopicText.match(/\{[\s\S]*\}/);
        if (offTopicJson) {
          const parsed = JSON.parse(offTopicJson[0]);
          if (typeof parsed?.offTopic === "boolean") return !parsed.offTopic;
        } else if (/\btrue\b/i.test(offTopicText)) {
          return false;
        } else if (/\bfalse\b/i.test(offTopicText)) {
          return true;
        }

        return false;
      } catch {
        try {
          const strictPrompt = [
            "Decide if the user's message is related to the selected topic.",
            "Be strict. Only return true if the message is clearly about the selected topic or very closely related.",
            "If you are unsure, return false.",
            "General mental health talk is NOT enough when a specific topic is selected.",
            "Treat short acknowledgements or follow-ups (e.g., yes/ok/thanks/tell me more) as related.",
            'Return ONLY {"related":true} or {"related":false}.',
            `Selected topic: "${topicLabel}"`,
            topicDescription ? `User description: """${topicDescription.trim()}"""` : "",
            `User message: """${message.trim()}"""`,
          ]
            .filter(Boolean)
            .join("\n");
          const strict = await callGroqClassifier(strictPrompt, "related");
          if (strict === true) return true;
          const offTopicPrompt = [
            "Decide if the user's message is clearly unrelated to the selected topic.",
            "Return true only when the message is clearly about a different topic.",
            "If you are unsure, return false.",
            "Short acknowledgements or follow-ups should be treated as NOT off-topic.",
            'Return ONLY {"offTopic":true} or {"offTopic":false}.',
            `Selected topic: "${topicLabel}"`,
            topicDescription ? `User description: """${topicDescription.trim()}"""` : "",
            `User message: """${message.trim()}"""`,
          ]
            .filter(Boolean)
            .join("\n");
          const offTopic = await callGroqClassifier(offTopicPrompt, "offTopic");
          if (offTopic === true) return false;
          if (offTopic === false) return true;
          return false;
        } catch {
          return false;
        }
      }
    },
    [callGroqClassifier]
  );

  const checkTopicAllowed = useCallback(
    async (message: string, topicLabel: string, topicDescription?: string | null) => {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      const prompt = [
        "Decide if the user's message is clearly unrelated to the selected topic.",
        "Return true only when the message is clearly about a different topic.",
        "When a specific topic is selected, allow the message only if it explicitly connects to that topic, emotions, symptoms, causes, coping, or support.",
        "If the message is a generic activity or unrelated statement without a mental-health link, treat it as off-topic.",
        "Do not assume a connection unless it is stated or strongly implied in the message.",
        "Require an explicit link to the topic (feelings, symptoms, coping, consequences, support, or triggers).",
        "If the message is neutral, casual, or about plans/activities without emotional context, treat it as off-topic.",
        "If the message is a short acknowledgment (yes/ok/thanks/tell me more), treat it as NOT off-topic.",
        "If you are unsure, return false.",
        "Short acknowledgements or follow-ups should be treated as NOT off-topic.",
        'Return ONLY {"offTopic":true} or {"offTopic":false}.',
        `Selected topic: "${topicLabel}"`,
        topicDescription ? `User description: """${topicDescription.trim()}"""` : "",
        `User message: """${message.trim()}"""`,
      ]
        .filter(Boolean)
        .join("\n");

      const runGroq = async () => {
        const offTopic = await callGroqClassifier(prompt, "offTopic");
        if (offTopic === true) return false;
        if (offTopic === false) return true;
        return true;
      };

      if (!apiKey) {
        try {
          return await runGroq();
        } catch {
          return true;
        }
      }

      try {
        const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, topP: 0.5, maxOutputTokens: TOPIC_MATCH_TOKENS },
            safetySettings: GEMINI_SAFETY_SETTINGS,
          }),
        });
        const data = await res.json().catch(() => undefined);
        if (!res.ok || isSafetyBlocked(data)) return true;
        const text = data?.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text ?? "")
          .join("\n")
          .trim();
        if (!text) return true;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (typeof parsed?.offTopic === "boolean") return !parsed.offTopic;
        } else if (/\btrue\b/i.test(text)) {
          return false;
        } else if (/\bfalse\b/i.test(text)) {
          return true;
        }
        return true;
      } catch {
        try {
          return await runGroq();
        } catch {
          return true;
        }
      }
    },
    [callGroqClassifier]
  );

  const checkGeneralMentalHealth = useCallback(
    async (message: string) => {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      const prompt = [
        "Decide if the user's message is clearly unrelated to mental health, emotional wellbeing, stress, anxiety, mood, relationships, or coping.",
        "Return true only when the message is clearly about a different non-mental-health topic.",
        "If you are unsure, return false.",
        'Return ONLY {"offTopic":true} or {"offTopic":false}.',
        `User message: """${message.trim()}"""`,
      ].join("\n");

      const runGroq = async () => {
        const offTopic = await callGroqClassifier(prompt, "offTopic");
        if (offTopic === true) return false;
        if (offTopic === false) return true;
        return true;
      };

      if (!apiKey) {
        try {
          return await runGroq();
        } catch {
          return true;
        }
      }

      try {
        const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, topP: 0.5, maxOutputTokens: TOPIC_MATCH_TOKENS },
            safetySettings: GEMINI_SAFETY_SETTINGS,
          }),
        });
        const data = await res.json().catch(() => undefined);
        if (!res.ok || isSafetyBlocked(data)) return true;
        const text = data?.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text ?? "")
          .join("\n")
          .trim();
        if (!text) return true;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (typeof parsed?.offTopic === "boolean") return !parsed.offTopic;
        } else if (/\btrue\b/i.test(text)) {
          return false;
        } else if (/\bfalse\b/i.test(text)) {
          return true;
        }
        return true;
      } catch {
        try {
          return await runGroq();
        } catch {
          return true;
        }
      }
    },
    [callGroqClassifier]
  );

  const generateReply = useCallback(
    async (
      history: ChatMessage[],
      topicContext?: string
    ): Promise<{ text: string; source: "gemini" | "groq" }> => {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      setIsLoading(true);
      setError(null);

      if (!apiKey) {
        const groqReply = await callGroqReply(history, topicContext);
        setIsLoading(false);
        return { text: groqReply, source: "groq" as const };
      }

      try {
        const recent = history.slice(-12);
        const contents: GeminiContent[] = recent.map((item, index) => {
          const isLastUser = item.role === "user" && index === recent.length - 1;
          const topicLine = topicContext ? `\n\nTopic focus: ${topicContext}` : "";
          const text = isLastUser
            ? `${item.text}${topicLine}\n\n${RESPONSE_STYLE_HINT}`
            : item.text;
          return {
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text }],
          };
        });

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
          const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents,
              generationConfig: { temperature: 0.7, topP: 0.8, maxOutputTokens: MAX_OUTPUT_TOKENS },
              safetySettings: GEMINI_SAFETY_SETTINGS,
            }),
          });

          const data = await res.json().catch(() => undefined);
          if (!res.ok) {
            const msg = data?.error?.message ?? `Gemini request failed (${res.status})`;
            if (isSafetyErrorMessage(msg)) {
              throw new Error("SAFETY_BLOCK");
            }
            if (attempt < MAX_RETRIES && isRetryableError(res.status, msg)) {
              await sleep(600 * (attempt + 1));
              continue;
            }
            throw new Error(msg);
          }

          if (isSafetyBlocked(data)) {
            throw new Error("SAFETY_BLOCK");
          }

          const finishReason = data?.candidates?.[0]?.finishReason;
          const text = data?.candidates?.[0]?.content?.parts
            ?.map((p: { text?: string }) => p.text ?? "")
            .join("\n")
            .trim();

          if (!text) {
            throw new Error("The chatbot returned an empty response.");
          }

          const looksCutOff = text.length > 80 && !/[.!?]$/.test(text.trim());
          if (finishReason === "MAX_TOKENS" || looksCutOff) {
            const continuationContents: GeminiContent[] = [
              ...contents,
              { role: "model", parts: [{ text }] },
              {
                role: "user",
                parts: [{ text: "Please finish the response in 1-2 short sentences." }],
              },
            ];
            const contRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: continuationContents,
                generationConfig: {
                  temperature: 0.7,
                  topP: 0.8,
                  maxOutputTokens: Math.min(256, MAX_OUTPUT_TOKENS),
                },
                safetySettings: GEMINI_SAFETY_SETTINGS,
              }),
            });
            const contData = await contRes.json().catch(() => undefined);
            if (contRes.ok) {
              const contText = contData?.candidates?.[0]?.content?.parts
                ?.map((p: { text?: string }) => p.text ?? "")
                .join("\n")
                .trim();
              if (contText) {
                return { text: `${text}\n\n${contText}`, source: "gemini" as const };
              }
            }
          }

          return { text, source: "gemini" as const };
        }

        throw new Error("The chatbot is temporarily unavailable. Please try again.");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error from the chatbot.";
        setError(message);
        try {
          const groqReply = await callGroqReply(history, topicContext);
          return { text: groqReply, source: "groq" as const };
        } catch {
          throw err instanceof Error ? err : new Error(message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [callGroqReply]
  );

  return {
    generateReply,
    checkTopicMatch,
    checkTopicAllowed,
    checkGeneralMentalHealth,
    isLoading,
    error,
    resetError: () => setError(null),
  };
}
