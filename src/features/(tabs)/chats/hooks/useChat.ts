import { useCallback, useState } from "react";
import { ChatMessage, useGemini } from "./useGemini";

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const initialAssistantMessage: ChatMessage = {
  id: createId(),
  role: "assistant",
  text: "Hi, I'm your mental health companion. Share what's on your mind, and I'll respond with supportive, evidence-based guidance.",
  createdAt: Date.now(),
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialAssistantMessage]);
  const { generateReply, isLoading, error, resetError } = useGemini();

  const sendMessage = useCallback(
    async (input: string) => {
      const text = input.trim();
      if (!text) return;

      if (error) resetError();

      const userMessage: ChatMessage = {
        id: createId(),
        role: "user",
        text,
        createdAt: Date.now(),
      };

      const thinkingMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        text: "Thinking...",
        createdAt: Date.now(),
      };

      const conversationForModel: ChatMessage[] = [...messages, userMessage];
      setMessages([...conversationForModel, thinkingMessage]);

      try {
        const reply = await generateReply(conversationForModel);
        setMessages((prev) => {
          const withoutThinking = prev.filter((m) => m.id !== thinkingMessage.id);
          const next: ChatMessage[] = [
            ...withoutThinking,
            {
              id: createId(),
              role: "assistant",
              text: reply,
              createdAt: Date.now(),
            },
          ];
          return next;
        });
      } catch (err) {
        const errorText =
          err instanceof Error ? err.message : "Sorry, I couldn't get a reply right now.";
        setMessages((prev) => {
          const withoutThinking = prev.filter((m) => m.id !== thinkingMessage.id);
          const next: ChatMessage[] = [
            ...withoutThinking,
            {
              id: createId(),
              role: "assistant",
              text: `I ran into a problem: ${errorText}`,
              createdAt: Date.now(),
            },
          ];
          return next;
        });
      }
    },
    [messages, error, generateReply, resetError]
  );

  return { messages, isLoading, error, sendMessage };
}
