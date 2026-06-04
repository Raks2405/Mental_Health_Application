import { Link, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BookCard from "../components/BookCard";
import type { BookItem } from "../data/resources";
import { useRecommendation } from "../context/RecommendationContext";
import { CATEGORY_QUERIES } from "../data/resourceQueries";
import { fetchBooksByCategory, getCachedBooks } from "../data/resourceFetch";
import {
  getResourceCategoriesFromFirestore,
  type ResourceCategoryMap,
} from "../data/resourceFirestore";
import type { CategoryKey } from "../context/RecommendationContext";
import { GEMINI_ENDPOINT, GEMINI_SAFETY_SETTINGS, extractJsonArray } from "@/src/utils/gemini";
import { callGroqJsonArray } from "@/src/utils/groq";

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const bookKey = (book: BookItem) =>
  `${normalizeText(book.title)}|${normalizeText(book.author)}`;

const PAGE_SIZE = 7;

const buildRankingPrompt = (
  description: string,
  items: Array<{ id: number; title: string; author: string }>
) => {
  return [
    "You are a recommender. Pick the top 10 books most relevant to the user's description.",
    'Return ONLY a JSON array of book ids, like [1,2,3]. No extra text.',
    `User description: """${description.trim()}"""`,
    "Books:",
    ...items.map((item) => `${item.id}. ${item.title} — ${item.author}`),
  ].join("\n");
};

const isCategoryKey = (value: string | null | undefined): value is CategoryKey =>
  typeof value === "string" && Object.prototype.hasOwnProperty.call(CATEGORY_QUERIES, value);

export default function BooksScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const {
    category: recommendedCategory,
    status,
    message,
    queryText,
    bookRankings,
    setBookRanking,
  } = useRecommendation();
  const rawCategory =
    typeof params.category === "string" ? params.category : recommendedCategory;
  const categoryKey = isCategoryKey(rawCategory) ? rawCategory : null;
  const [remoteBooks, setRemoteBooks] = useState<BookItem[]>([]);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedKeys, setRecommendedKeys] = useState<Set<string>>(new Set());
  const [isRanking, setIsRanking] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [resourceCategories, setResourceCategories] = useState<ResourceCategoryMap | null>(null);

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

  const bookCategories = useMemo(() => {
    return Object.fromEntries(
      Object.entries(resourceCategories ?? {}).map(([key, category]) => [
        key,
        { label: category.label, books: category.books },
      ])
    ) as Record<string, { label: string; books: BookItem[] }>;
  }, [resourceCategories]);

  const allBooks = useMemo(() => {
    const unique = new Map<string, BookItem>();
    Object.values(bookCategories).forEach((category) => {
      category.books.forEach((book) => {
        const key = bookKey(book);
        if (!unique.has(key)) {
          unique.set(key, book);
        }
      });
    });
    return Array.from(unique.values());
  }, [bookCategories]);

  const showUnavailable = status === "unmatched" && !params.category;
  useEffect(() => {
    let isActive = true;
    if (!categoryKey || showUnavailable) {
      setRemoteBooks([]);
      setRemoteError(null);
      return () => {
        isActive = false;
      };
    }
    const query = CATEGORY_QUERIES[categoryKey]?.books ?? categoryKey;
    const cached = getCachedBooks(categoryKey, query);
    if (cached) {
      setRemoteBooks(cached);
      setRemoteError(null);
      setIsLoading(false);
      return () => {
        isActive = false;
      };
    }
    setIsLoading(true);
    setRemoteError(null);
    fetchBooksByCategory(categoryKey, query)
      .then((books) => {
        if (!isActive) return;
        setRemoteBooks(books);
      })
      .catch((err) => {
        if (!isActive) return;
        setRemoteError(err instanceof Error ? err.message : "Failed to load books.");
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [categoryKey, showUnavailable]);

  const categoryLabel = showUnavailable
    ? "No matching category"
    : categoryKey
    ? bookCategories[categoryKey]?.label ?? "General resources"
    : "General resources";
  const books = useMemo(() => {
    if (!categoryKey) return allBooks;
    const base = bookCategories[categoryKey]?.books ?? [];
    const unique = new Map<string, BookItem>();
    [...base, ...remoteBooks].forEach((book) => {
      const key = bookKey(book);
      if (!unique.has(key)) {
        unique.set(key, book);
      }
    });
    return Array.from(unique.values()).slice(0, 100);
  }, [allBooks, bookCategories, categoryKey, remoteBooks]);

  useEffect(() => {
    let isActive = true;
    if (!categoryKey || showUnavailable) {
      setRecommendedKeys(new Set());
      setIsRanking(false);
      return () => {
        isActive = false;
      };
    }

    const rankingText =
      queryText?.trim() || bookCategories[categoryKey]?.label || categoryKey;
    const cached = bookRankings[categoryKey];
    if (cached && cached.queryText === rankingText) {
      setRecommendedKeys(new Set(cached.keys));
      setIsRanking(false);
      return () => {
        isActive = false;
      };
    }

    const fallbackKeys = () => {
      const keys = new Set<string>();
      books.slice(0, 10).forEach((book) => keys.add(bookKey(book)));
      return keys;
    };

    const runRanking = async () => {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      const candidates = books.slice(0, 40).map((book, index) => ({
        id: index + 1,
        title: book.title,
        author: book.author,
      }));

      if (candidates.length === 0) {
        setRecommendedKeys(new Set());
        return;
      }

      setIsRanking(true);
      setGeminiError(null);
      try {
        let ids: number[] | null = null;
        if (apiKey) {
          const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: buildRankingPrompt(rankingText, candidates) }],
                },
              ],
              generationConfig: { temperature: 0.2, topP: 0.8 },
              safetySettings: GEMINI_SAFETY_SETTINGS,
            }),
          });

          const data = await res.json().catch(() => undefined);
          if (!res.ok) {
            throw new Error(data?.error?.message ?? `Gemini request failed (${res.status})`);
          }

          const text = data?.candidates?.[0]?.content?.parts
            ?.map((p: { text?: string }) => p.text ?? "")
            .join("\n")
            .trim();
          ids = extractJsonArray(text ?? "") as number[] | null;
        } else {
          ids = (await callGroqJsonArray(buildRankingPrompt(rankingText, candidates))) as
            | number[]
            | null;
        }

        if (!ids || !Array.isArray(ids)) {
          const groqIds = await callGroqJsonArray(buildRankingPrompt(rankingText, candidates));
          if (!groqIds) {
            const keys = fallbackKeys();
            setRecommendedKeys(keys);
            setBookRanking(categoryKey, rankingText, Array.from(keys));
            return;
          }
          ids = groqIds as number[];
        }

        if (!ids || !Array.isArray(ids)) {
          const keys = fallbackKeys();
          setRecommendedKeys(keys);
          setBookRanking(categoryKey, rankingText, Array.from(keys));
          return;
        }

        const idSet = new Set<number>(
          ids
            .map((value: unknown) => Number(value))
            .filter((value) => Number.isFinite(value))
        );
        const keys = new Set<string>();
        candidates.forEach((candidate, idx) => {
          if (idSet.has(candidate.id)) {
            const book = books[idx];
            if (book) keys.add(bookKey(book));
          }
        });
        if (isActive) {
          const finalKeys = keys.size > 0 ? keys : fallbackKeys();
          setRecommendedKeys(finalKeys);
          setBookRanking(categoryKey, rankingText, Array.from(finalKeys));
        }
      } catch (err) {
        if (isActive) {
          const keys = fallbackKeys();
          setRecommendedKeys(keys);
          setBookRanking(categoryKey, rankingText, Array.from(keys));
        }
      } finally {
        if (isActive) setIsRanking(false);
      }
    };

    runRanking();
    return () => {
      isActive = false;
    };
  }, [bookCategories, bookRankings, books, categoryKey, queryText, setBookRanking, showUnavailable]);

  const orderedBooks = useMemo(() => {
    if (recommendedKeys.size === 0) return books;
    const recommended: typeof books = [];
    const rest: typeof books = [];
    books.forEach((book) => {
      if (recommendedKeys.has(bookKey(book))) {
        recommended.push(book);
      } else {
        rest.push(book);
      }
    });
    return [...recommended, ...rest];
  }, [books, recommendedKeys]);

  const totalPages = Math.max(1, Math.ceil(orderedBooks.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const pagedBooks = useMemo(() => {
    const start = (clampedPage - 1) * PAGE_SIZE;
    return orderedBooks.slice(start, start + PAGE_SIZE);
  }, [clampedPage, orderedBooks]);
  const pagination = !showUnavailable && orderedBooks.length > 0 ? (
    <View style={s.paginationRow}>
      <Pressable
        onPress={() => setPage((prev) => Math.max(1, prev - 1))}
        disabled={clampedPage <= 1}
        style={[s.pageButton, clampedPage <= 1 && s.pageButtonDisabled]}
      >
        <Text style={s.pageButtonText}>Prev</Text>
      </Pressable>
      <Text style={s.pageText}>
        Page {clampedPage} of {totalPages}
      </Text>
      <Pressable
        onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        disabled={clampedPage >= totalPages}
        style={[s.pageButton, clampedPage >= totalPages && s.pageButtonDisabled]}
      >
        <Text style={s.pageButtonText}>Next</Text>
      </Pressable>
    </View>
  ) : null;

  useEffect(() => {
    if (page !== clampedPage) setPage(clampedPage);
  }, [clampedPage, page]);

  useEffect(() => {
    setPage(1);
  }, [categoryKey, showUnavailable]);

  return (
    <View style={s.container}>
      <View style={s.row}>
        <Text style={[s.cell, s.active]}>Books</Text>
        <Link href="/(tabs)/home/articles" asChild>
          <Pressable style={s.cell}>
            <Text style={{ color: "white" }}>Articles</Text>
          </Pressable>
        </Link>
        <Link href="/(tabs)/home/videos" asChild>
          <Pressable style={s.cell}>
            <Text style={{ color: "white" }}>Videos</Text>
          </Pressable>
        </Link>
      </View>

      <ScrollView contentContainerStyle={s.body}>
        <View style={s.headingRow}>
          <Text style={s.headingLabel}>Resources for</Text>
          <View
            style={[
              s.topicBadge,
              showUnavailable
                ? s.topicBadgeWarning
                : !categoryKey
                ? s.topicBadgeNeutral
                : s.topicBadgeActive,
            ]}
          >
            <Text style={s.topicBadgeText}>{categoryLabel}</Text>
          </View>
        </View>
        {!showUnavailable && categoryKey && isLoading ? (
          <Text style={s.loading}>Loading more books...</Text>
        ) : null}
        {!showUnavailable && categoryKey && isRanking ? (
          <Text style={s.loading}>Finding the best matches...</Text>
        ) : null}
        {/* errors hidden */}
        {pagination}
        {showUnavailable ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyTitle}>We don't have the category you are looking for.</Text>
            <Text style={s.emptyText}>{message ?? "We are working on it."}</Text>
          </View>
        ) : (
          pagedBooks.map((book) => (
            <BookCard
              key={`${book.isbn13 ?? "noisbn"}-${book.title}`}
              title={book.title}
              author={book.author}
              isbn13={book.isbn13}
              recommended={recommendedKeys.has(bookKey(book))}
            />
          ))
        )}
        {pagination}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  row: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 15,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
    margin: 3,
    backgroundColor: "#002532ff",
    color: "white",
    textAlign: "center",
    textAlignVertical: "center",
  },
  active: {
    fontWeight: "900",
    borderColor: "#ffffffff",
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 2, height: 2 },
        shadowColor: "#000000ff",
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 8 },
    }),
  },
  body: {
    padding: 16,
    gap: 12,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 2,
  },
  headingLabel: {
    color: "#8fb6c7",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  topicBadge: {
    maxWidth: "70%",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topicBadgeActive: {
    backgroundColor: "#11384a",
    borderColor: "#2b84a9",
  },
  topicBadgeNeutral: {
    backgroundColor: "#0e3040",
    borderColor: "#1f6380",
  },
  topicBadgeWarning: {
    backgroundColor: "#4a2229",
    borderColor: "#9e4a57",
  },
  topicBadgeText: {
    color: "#e9f7ff",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  pageButton: {
    backgroundColor: "#0f3a4c",
    borderWidth: 1,
    borderColor: "#1a6b86",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    color: "#9ccfe6",
    fontWeight: "700",
  },
  pageText: {
    color: "#cbd5db",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: "#0b2a36",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#134b61",
  },
  emptyTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptyText: {
    color: "#9ccfe6",
    fontSize: 13,
    lineHeight: 18,
  },
  loading: {
    color: "#9ccfe6",
    fontSize: 12,
    marginBottom: 6,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 12,
    marginBottom: 6,
  },
});
