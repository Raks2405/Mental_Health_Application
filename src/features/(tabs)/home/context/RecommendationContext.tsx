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
  | "burnout";

type RecommendationStatus = "idle" | "matched" | "unmatched";

type RecommendationState = {
  category: CategoryKey | null;
  status: RecommendationStatus;
  message: string | null;
  setRecommendation: (next: {
    category: CategoryKey | null;
    status: RecommendationStatus;
    message?: string | null;
  }) => void;
  clearRecommendation: () => void;
};

const RecommendationContext = createContext<RecommendationState | null>(null);

export function RecommendationProvider({ children }: { children: React.ReactNode }) {
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [status, setStatus] = useState<RecommendationStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const value = useMemo(
    () => ({
      category,
      status,
      message,
      setRecommendation: (next: {
        category: CategoryKey | null;
        status: RecommendationStatus;
        message?: string | null;
      }) => {
        setCategory(next.category);
        setStatus(next.status);
        setMessage(next.message ?? null);
      },
      clearRecommendation: () => {
        setCategory(null);
        setStatus("idle");
        setMessage(null);
      },
    }),
    [category, message, status]
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
