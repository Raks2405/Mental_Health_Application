import type { CategoryKey } from "../context/RecommendationContext";
import type { ArticleItem, BookItem, VideoItem } from "./resources";

const MAX_RESULTS = 100;
const OPEN_LIBRARY_ENDPOINT = "https://openlibrary.org/search.json";
const SEMANTIC_SCHOLAR_ENDPOINT = "https://api.semanticscholar.org/graph/v1/paper/search";
const OPENALEX_ENDPOINT = "https://api.openalex.org/works";
const INVIDIOUS_INSTANCES = [
  "https://yewtu.be",
  "https://invidious.fdn.fr",
  "https://inv.nadeko.net",
  "https://invidious.nerdvpn.de",
  "https://invidious.slipfox.xyz",
];

let activeInvidious: string | null = null;

const bookCache = new Map<string, BookItem[]>();
const articleCache = new Map<string, ArticleItem[]>();
const videoCache = new Map<string, VideoItem[]>();

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const getCachedBooks = (category: CategoryKey, query: string) =>
  bookCache.get(`${category}:${query}`) ?? null;

export const getCachedArticles = (category: CategoryKey, query: string) =>
  articleCache.get(`${category}:${query}`) ?? null;

export const getCachedVideos = (category: CategoryKey, query: string) =>
  videoCache.get(`${category}:${query}`) ?? null;

const pickIsbn = (list: unknown): string | undefined => {
  if (!Array.isArray(list)) return undefined;
  const isbn13 = list.find((isbn) => typeof isbn === "string" && isbn.length === 13) as
    | string
    | undefined;
  const fallback = list.find((isbn) => typeof isbn === "string") as string | undefined;
  return isbn13 ?? fallback;
};

const formatDuration = (seconds: number | undefined) => {
  if (!seconds || seconds <= 0) return undefined;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const pad = (value: number) => value.toString().padStart(2, "0");
  return hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${mins}:${pad(secs)}`;
};

export async function fetchBooksByCategory(category: CategoryKey, query: string) {
  const cacheKey = `${category}:${query}`;
  const cached = bookCache.get(cacheKey);
  if (cached) return cached;

  const url = `${OPEN_LIBRARY_ENDPOINT}?q=${encodeURIComponent(query)}&fields=title,author_name,isbn&limit=${MAX_RESULTS}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "MentalHealthApplication",
    },
  });
  if (!res.ok) throw new Error(`Open Library request failed (${res.status})`);
  const data = await res.json().catch(() => undefined);
  const docs = Array.isArray(data?.docs) ? data.docs : [];

  const unique = new Map<string, BookItem>();
  docs.forEach((doc: any) => {
    const title = typeof doc?.title === "string" ? doc.title.trim() : "";
    const author = Array.isArray(doc?.author_name) ? doc.author_name[0] : "";
    if (!title || !author) return;
    const isbn13 = pickIsbn(doc?.isbn);
    const key = `${normalizeText(title)}|${normalizeText(author)}`;
    const existing = unique.get(key);
    if (existing) {
      if (!existing.isbn13 && isbn13) {
        unique.set(key, { title, author, isbn13 });
      }
      return;
    }
    unique.set(key, { title, author, isbn13 });
  });

  const result = Array.from(unique.values()).slice(0, MAX_RESULTS);
  bookCache.set(cacheKey, result);
  return result;
}

export async function fetchArticlesByCategory(category: CategoryKey, query: string) {
  const cacheKey = `${category}:${query}`;
  const cached = articleCache.get(cacheKey);
  if (cached) return cached;

  const unique = new Map<string, ArticleItem>();

  const fetchFromSemanticScholar = async () => {
    const url = `${SEMANTIC_SCHOLAR_ENDPOINT}?query=${encodeURIComponent(query)}&limit=${MAX_RESULTS}&fields=title,url,authors`;
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "MentalHealthApplication",
      },
    });
    if (!res.ok) throw new Error(`Semantic Scholar request failed (${res.status})`);
    const data = await res.json().catch(() => undefined);
    const papers = Array.isArray(data?.data) ? data.data : [];
    papers.forEach((paper: any) => {
      const title = typeof paper?.title === "string" ? paper.title.trim() : "";
      const urlValue = typeof paper?.url === "string" ? paper.url : "";
      if (!title || !urlValue) return;
      const authorName =
        Array.isArray(paper?.authors) && paper.authors[0]?.name
          ? `${paper.authors[0].name} et al.`
          : "Semantic Scholar";
      const key = normalizeText(title);
      if (!unique.has(key)) {
        unique.set(key, { title, source: authorName, url: urlValue });
      }
    });
  };

  const fetchFromOpenAlex = async () => {
    const url = `${OPENALEX_ENDPOINT}?search=${encodeURIComponent(query)}&per-page=${MAX_RESULTS}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "MentalHealthApplication",
      },
    });
    if (!res.ok) throw new Error(`OpenAlex request failed (${res.status})`);
    const data = await res.json().catch(() => undefined);
    const results = Array.isArray(data?.results) ? data.results : [];
    results.forEach((paper: any) => {
      const title = typeof paper?.title === "string" ? paper.title.trim() : "";
      const urlValue =
        (typeof paper?.primary_location?.landing_page_url === "string" &&
          paper.primary_location.landing_page_url) ||
        (typeof paper?.best_oa_location?.landing_page_url === "string" &&
          paper.best_oa_location.landing_page_url) ||
        (typeof paper?.doi === "string" ? `https://doi.org/${paper.doi.replace(/^https?:\/\/doi\.org\//, "")}` : "");
      if (!title || !urlValue) return;
      const authorName =
        Array.isArray(paper?.authorships) && paper.authorships[0]?.author?.display_name
          ? `${paper.authorships[0].author.display_name} et al.`
          : "OpenAlex";
      const key = normalizeText(title);
      if (!unique.has(key)) {
        unique.set(key, { title, source: authorName, url: urlValue });
      }
    });
  };

  try {
    await fetchFromSemanticScholar();
  } catch {
    await fetchFromOpenAlex();
  }

  const result = Array.from(unique.values()).slice(0, MAX_RESULTS);
  articleCache.set(cacheKey, result);
  return result;
}

async function fetchVideoPage(query: string, page: number) {
  const path = `/api/v1/search?q=${encodeURIComponent(query)}&page=${page}`;
  const tried = new Set<string>();

  const candidates = activeInvidious
    ? [activeInvidious, ...INVIDIOUS_INSTANCES]
    : INVIDIOUS_INSTANCES;

  for (const base of candidates) {
    if (tried.has(base)) continue;
    tried.add(base);
    try {
      const res = await fetch(`${base}${path}`);
      if (!res.ok) continue;
      const data = await res.json().catch(() => undefined);
      if (Array.isArray(data)) {
        activeInvidious = base;
        return data;
      }
    } catch {
      // try next instance
    }
  }

  return null;
}

export async function fetchVideosByCategory(category: CategoryKey, query: string) {
  const cacheKey = `${category}:${query}`;
  const cached = videoCache.get(cacheKey);
  if (cached) return cached;

  const unique = new Map<string, VideoItem>();
  let page = 1;
  let failedPages = 0;

  while (unique.size < MAX_RESULTS && page <= 8) {
    const items = await fetchVideoPage(query, page);
    if (!items) {
      failedPages += 1;
      if (failedPages >= 2) break;
      page += 1;
      continue;
    }
    if (!items.length) break;

    items.forEach((item: any) => {
      if (item?.type !== "video") return;
      const videoId = typeof item?.videoId === "string" ? item.videoId : "";
      const title = typeof item?.title === "string" ? item.title : "";
      const channel = typeof item?.author === "string" ? item.author : "";
      const duration = formatDuration(
        typeof item?.lengthSeconds === "number"
          ? item.lengthSeconds
          : Number(item?.lengthSeconds)
      );
      if (!videoId || !title || !channel) return;
      if (!unique.has(videoId)) {
        unique.set(videoId, { videoId, title, channel, duration: duration ?? "" });
      }
    });

    page += 1;
  }

  const result = Array.from(unique.values()).slice(0, MAX_RESULTS);
  videoCache.set(cacheKey, result);
  return result;
}
