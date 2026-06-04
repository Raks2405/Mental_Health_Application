import React, { createContext, useContext, useMemo, useState } from "react";

type CategoryKey =
  | "sad"
  | "stress"
  | "anxiety"
  | "sleep"
  | "reflect"
  | "grief"
  | "loneliness"
  | "anger"
  | "burnout"
  | "happy"
  | "motivation"
  | "selfesteem"
  | "confidence"
  | "relationships"
  | "trauma"
  | "addiction"
  | "focus"
  | "ocd"
  | "ptsd"
  | "mindfulness";

type RecommendationStatus = "idle" | "matched" | "unmatched";

type RecommendationState = {
  category: CategoryKey | null;
  status: RecommendationStatus;
  message: string | null;
  queryText: string | null;
  bookRankings: Record<CategoryKey, { queryText: string; keys: string[] }>;
  articleRankings: Record<CategoryKey, { queryText: string; keys: string[] }>;
  videoRankings: Record<CategoryKey, { queryText: string; keys: string[] }>;
  setRecommendation: (next: {
    category: CategoryKey | null;
    status: RecommendationStatus;
    message?: string | null;
    queryText?: string | null;
  }) => void;
  setBookRanking: (category: CategoryKey, queryText: string, keys: string[]) => void;
  setArticleRanking: (category: CategoryKey, queryText: string, keys: string[]) => void;
  setVideoRanking: (category: CategoryKey, queryText: string, keys: string[]) => void;
  clearRecommendation: () => void;
};

const RecommendationContext = createContext<RecommendationState | null>(null);

export function RecommendationProvider({ children }: { children: React.ReactNode }) {
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [status, setStatus] = useState<RecommendationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [queryText, setQueryText] = useState<string | null>(null);
  const [bookRankings, setBookRankings] = useState<
    Record<CategoryKey, { queryText: string; keys: string[] }>
  >({} as Record<CategoryKey, { queryText: string; keys: string[] }>);
  const [articleRankings, setArticleRankings] = useState<
    Record<CategoryKey, { queryText: string; keys: string[] }>
  >({} as Record<CategoryKey, { queryText: string; keys: string[] }>);
  const [videoRankings, setVideoRankings] = useState<
    Record<CategoryKey, { queryText: string; keys: string[] }>
  >({} as Record<CategoryKey, { queryText: string; keys: string[] }>);
  const value = useMemo(
    () => ({
      category,
      status,
      message,
      queryText,
      bookRankings,
      articleRankings,
      videoRankings,
      setRecommendation: (next: {
        category: CategoryKey | null;
        status: RecommendationStatus;
        message?: string | null;
        queryText?: string | null;
      }) => {
        setCategory(next.category);
        setStatus(next.status);
        setMessage(next.message ?? null);
        setQueryText(next.queryText ?? null);
      },
      setBookRanking: (key: CategoryKey, text: string, keys: string[]) => {
        setBookRankings((prev) => ({ ...prev, [key]: { queryText: text, keys } }));
      },
      setArticleRanking: (key: CategoryKey, text: string, keys: string[]) => {
        setArticleRankings((prev) => ({ ...prev, [key]: { queryText: text, keys } }));
      },
      setVideoRanking: (key: CategoryKey, text: string, keys: string[]) => {
        setVideoRankings((prev) => ({ ...prev, [key]: { queryText: text, keys } }));
      },
      clearRecommendation: () => {
        setCategory(null);
        setStatus("idle");
        setMessage(null);
        setQueryText(null);
        setBookRankings({} as Record<CategoryKey, { queryText: string; keys: string[] }>);
        setArticleRankings({} as Record<CategoryKey, { queryText: string; keys: string[] }>);
        setVideoRankings({} as Record<CategoryKey, { queryText: string; keys: string[] }>);
      },
    }),
    [articleRankings, bookRankings, category, message, queryText, status, videoRankings]
  );

  return <RecommendationContext.Provider value={value}>{children}</RecommendationContext.Provider>;
}

export function useRecommendation() {
  const ctx = useContext(RecommendationContext);
  if (!ctx) {
    throw new Error("useRecommendation must be used within RecommendationProvider");
  }
  return ctx;
}

export type { CategoryKey, RecommendationStatus };
