import type { CategoryKey } from "../context/RecommendationContext";

export const CATEGORY_QUERIES: Record<
  CategoryKey,
  {
    books: string;
    articles: string;
    videos: string;
  }
> = {
  sad: {
    books: "depression mood therapy",
    articles: "depression treatment support",
    videos: "depression coping skills",
  },
  stress: {
    books: "stress management relaxation",
    articles: "stress management mental health",
    videos: "stress relief techniques",
  },
  anxiety: {
    books: "anxiety cognitive behavioral therapy",
    articles: "anxiety disorder coping",
    videos: "anxiety relief breathing",
  },
  sleep: {
    books: "insomnia sleep hygiene",
    articles: "insomnia sleep health",
    videos: "sleep meditation insomnia",
  },
  reflect: {
    books: "self reflection journaling mindfulness",
    articles: "self reflection mental health",
    videos: "self reflection mindfulness",
  },
  grief: {
    books: "grief loss bereavement",
    articles: "grief loss coping",
    videos: "grief counseling support",
  },
  loneliness: {
    books: "loneliness social connection",
    articles: "loneliness social isolation",
    videos: "loneliness coping",
  },
  anger: {
    books: "anger management",
    articles: "anger management tips",
    videos: "anger management techniques",
  },
  burnout: {
    books: "burnout recovery work stress",
    articles: "burnout workplace stress",
    videos: "burnout recovery",
  },
  happy: {
    books: "positive psychology happiness",
    articles: "happiness well-being positive psychology",
    videos: "happiness positive psychology",
  },
  motivation: {
    books: "motivation habits productivity",
    articles: "motivation goal setting",
    videos: "motivation habits",
  },
  selfesteem: {
    books: "self esteem self worth",
    articles: "self esteem confidence",
    videos: "self esteem confidence",
  },
  confidence: {
    books: "confidence self efficacy",
    articles: "build confidence self efficacy",
    videos: "build confidence",
  },
  relationships: {
    books: "healthy relationships communication",
    articles: "relationship communication skills",
    videos: "relationship communication",
  },
  trauma: {
    books: "trauma recovery healing",
    articles: "trauma recovery",
    videos: "trauma recovery therapy",
  },
  addiction: {
    books: "addiction recovery",
    articles: "addiction recovery support",
    videos: "addiction recovery",
  },
  focus: {
    books: "focus concentration attention",
    articles: "focus attention concentration",
    videos: "focus concentration",
  },
  ocd: {
    books: "obsessive compulsive disorder",
    articles: "obsessive compulsive disorder treatment",
    videos: "ocd treatment",
  },
  ptsd: {
    books: "ptsd trauma recovery",
    articles: "ptsd treatment",
    videos: "ptsd recovery",
  },
  mindfulness: {
    books: "mindfulness meditation",
    articles: "mindfulness meditation",
    videos: "mindfulness meditation",
  },
};
