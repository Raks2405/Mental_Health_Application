import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatMessage, useGemini } from "./useGemini";
import { useRecommendation } from "../../home/context/RecommendationContext";
import {
  getResourceCategoriesFromFirestore,
  type ResourceCategoryMap,
} from "../../home/data/resourceFirestore";

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const initialAssistantMessage: ChatMessage = {
  id: createId(),
  role: "assistant",
  text: "Hi, I'm your mental health companion. Share what's on your mind, and I'll respond with supportive, evidence-based guidance.",
  createdAt: Date.now(),
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialAssistantMessage]);
  const {
    generateReply,
    checkTopicAllowed,
    checkGeneralMentalHealth,
    isLoading,
    error,
    resetError,
  } = useGemini();
  const { category, status, queryText, message: recommendationMessage } = useRecommendation();
  const [resourceCategories, setResourceCategories] = useState<ResourceCategoryMap | null>(null);
  const lastTopicRef = useRef<string | null>(null);
  const lastGeneralRef = useRef<string | null>(null);
  const safetyNotice =
    "I can’t respond to that directly here. If you’re in the U.S., you can call or text 988 " +
    "(Suicide & Crisis Lifeline, 24/7) or chat at 988lifeline.org. If you’re in immediate danger, call 911. " +
    "If you’re outside the U.S., tell me your country and I’ll find the right local number.";

  const isTopicActive = status === "matched" && !!category;
  const topicKey = isTopicActive ? `${category}|${queryText ?? ""}` : null;

  useEffect(() => {
    let isActive = true;
    getResourceCategoriesFromFirestore()
      .then((categories) => {
        if (isActive) setResourceCategories(categories);
      })
      .catch(() => {
        if (isActive) setResourceCategories(null);
      });
    return () => {
      isActive = false;
    };
  }, []);

  const topicLabel = useMemo(() => {
    if (!category) return null;
    return resourceCategories?.[category]?.label ?? category;
  }, [category, resourceCategories]);

  const isCrisisText = (text: string) =>
    /(suicide|kill myself|end it|self harm|self-harm|can't go on|die)/i.test(text);

  useEffect(() => {
    if (!isTopicActive || !topicKey || topicKey === lastTopicRef.current) return;
    lastTopicRef.current = topicKey;
    const intro = topicLabel
      ? `I see you selected (${topicLabel.toLowerCase()}). Want to talk more about that? I'm here to help`
      : "I see you’re dealing with some concerns. Want to talk more about that?";
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        role: "assistant",
        text: intro,
        createdAt: Date.now(),
      },
    ]);
  }, [isTopicActive, topicKey, topicLabel]);

  useEffect(() => {
    const shouldShowGeneralNotice =
      status === "matched" && !category && !!recommendationMessage?.trim();
    if (!shouldShowGeneralNotice) return;
    const noticeKey = `${status}|${recommendationMessage}`;
    if (lastGeneralRef.current === noticeKey) return;
    lastGeneralRef.current = noticeKey;
    setMessages((prev) => [
      ...prev,
      {
        id: createId(),
        role: "assistant",
        text:
          `${recommendationMessage} ` +
          "Share a little more about what you're feeling so I can guide you better.",
        createdAt: Date.now(),
      },
    ]);
  }, [category, recommendationMessage, status]);

  const resetChat = useCallback(() => {
    lastTopicRef.current = null;
    lastGeneralRef.current = null;
    setMessages([initialAssistantMessage]);
  }, []);

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

      setMessages((prev) => [...prev, userMessage]);

      if (isCrisisText(text)) {
        setMessages((prev) => [
          ...prev,
          { id: createId(), role: "assistant", text: safetyNotice, createdAt: Date.now() },
        ]);
        return;
      }

      if (isTopicActive) {
        const isAllowed = await checkTopicAllowed(
          text,
          topicLabel ?? category ?? "selected topic",
          queryText
        );
        if (!isAllowed) {
          const guard = topicLabel
            ? `In Quick Questions you mentioned ${topicLabel.toLowerCase()}. Please talk about that here. ` +
              "If you want to discuss something else, answer Quick Questions again first. " +
              "For general chat, use the Clear Questions button."
            : "Please talk about the topic you selected in Quick Questions. " +
              "If you want to discuss something else, answer Quick Questions again. " +
              "For general chat, use the Clear Questions button.";
          setMessages((prev) => [
            ...prev,
            { id: createId(), role: "assistant", text: guard, createdAt: Date.now() },
          ]);
          return;
        }
      }
      if (!isTopicActive) {
        const isAllowed = await checkGeneralMentalHealth(text);
        if (!isAllowed) {
          const redirect =
            "I’m here to help with mental health and emotional wellbeing. " +
            "If you want to talk about stress, anxiety, mood, relationships, or coping, I’m listening.";
          setMessages((prev) => [
            ...prev,
            { id: createId(), role: "assistant", text: redirect, createdAt: Date.now() },
          ]);
          return;
        }
      }

      const thinkingMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        text: "Thinking...",
        createdAt: Date.now(),
      };

      const conversationForModel: ChatMessage[] = [...messages, userMessage];
      setMessages((prev) => [...prev, thinkingMessage]);

      try {
        const topicContext = isTopicActive
          ? `${topicLabel ?? category}. User description: ${queryText ?? "none"}`
          : undefined;
        const reply = await generateReply(conversationForModel, topicContext);
        setMessages((prev) => {
          const withoutThinking = prev.filter((m) => m.id !== thinkingMessage.id);
          const next: ChatMessage[] = [
            ...withoutThinking,
            {
              id: createId(),
              role: "assistant",
              text: reply.text,
              source: reply.source,
              createdAt: Date.now(),
            },
          ];
          return next;
        });
      } catch (err) {
        const raw =
          err instanceof Error ? err.message : "Sorry, I couldn't get a reply right now.";
        if (/SAFETY_BLOCK/i.test(raw)) {
          setMessages((prev) => {
            const withoutThinking = prev.filter((m) => m.id !== thinkingMessage.id);
            const next: ChatMessage[] = [
              ...withoutThinking,
              {
                id: createId(),
                role: "assistant",
                text: safetyNotice,
                createdAt: Date.now(),
              },
            ];
            return next;
          });
          return;
        }
        const isBusy = /high demand|rate limit|resource exhausted|quota|temporar|429|503/i.test(raw);
        const errorText = isBusy
          ? "I'm having trouble reaching the assistant right now. Please try again in a moment."
          : raw;
        setMessages((prev) => {
          const withoutThinking = prev.filter((m) => m.id !== thinkingMessage.id);
          const next: ChatMessage[] = [
            ...withoutThinking,
            {
              id: createId(),
              role: "assistant",
              text: errorText,
              createdAt: Date.now(),
            },
          ];
          return next;
        });
      }
    },
    [
      messages,
      error,
      generateReply,
      checkTopicAllowed,
      checkGeneralMentalHealth,
      resetError,
      isTopicActive,
      safetyNotice,
      topicLabel,
      queryText,
      category,
    ]
  );

  return { messages, isLoading, error, sendMessage, resetChat, isTopicActive };
}
