import { Link } from "expo-router";
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import LoadingScreen from "@/src/components/LoadingScreen";
import ArticleCard from "../components/ArticleCard";
import BookCard from "../components/BookCard";
import VideoCard from "../components/VideoCard";
import { ARTICLE_CATEGORIES, BOOK_CATEGORIES, VIDEO_CATEGORIES } from "../data/resources";
import type { CategoryKey, RecommendationStatus } from "../context/RecommendationContext";

type QuestionOption = {
    id: string;
    label: string;
    next: string;
    resourceTag?: string;
};

type QuestionNode = {
    id: string;
    type: "single_choice" | "free_text" | "free_text_or_skip";
    prompt: string;
    options?: QuestionOption[];
    next?: string;
};

type QuestionFlow = {
    id: string;
    version: number;
    maxSteps: number;
    startQuestionId: string;
    questions: Record<string, QuestionNode>;
    endStates: Record<string, { resourceTag: string }>;
};

export type QuestionScreenHandle = {
    goBack: () => void;
};

type Props = {
    onCanGoBackChange?: (canGoBack: boolean) => void;
    onComplete?: (result: {
        category: CategoryKey | null;
        status: RecommendationStatus;
        message?: string | null;
    }) => void;
};

const CATEGORY_KEYS = [
    "sad",
    "stress",
    "anxiety",
    "sleep",
    "reflect",
    "grief",
    "loneliness",
    "anger",
    "burnout",
] as const;

const TAG_ALIASES: Record<string, CategoryKey> = {
    depressed: "sad",
    depression: "sad",
    low: "sad",
    down: "sad",
    stressed: "stress",
    overwhelm: "stress",
    overwhelmed: "stress",
    panic: "anxiety",
    worried: "anxiety",
    worry: "anxiety",
    anxious: "anxiety",
    insomnia: "sleep",
    sleepless: "sleep",
    tired: "sleep",
    exhausted: "sleep",
    lonely: "loneliness",
    alone: "loneliness",
    isolated: "loneliness",
    disconnect: "loneliness",
    angry: "anger",
    irritable: "anger",
    rage: "anger",
    loss: "grief",
    grieving: "grief",
    bereavement: "grief",
    burnedout: "burnout",
    burnout: "burnout",
    unmotivated: "burnout",
    drained: "burnout",
    reflect: "reflect",
    meaning: "reflect",
    talk: "reflect",
};

const normalizeTag = (tag: string) => tag.trim().toLowerCase();

const mapTagToCategory = (tag: string | null | undefined): CategoryKey | null => {
    if (!tag) return null;
    const normalized = normalizeTag(tag);
    if ((CATEGORY_KEYS as readonly string[]).includes(normalized)) {
        return normalized as CategoryKey;
    }
    return TAG_ALIASES[normalized] ?? null;
};

const extractTagsFromText = (text: string): CategoryKey[] => {
    if (!text) return [];
    const lower = text.toLowerCase();
    const matches: CategoryKey[] = [];

    const rules: Array<[CategoryKey, RegExp]> = [
        ["sad", /(sad|down|depress|hopeless|low mood)/i],
        ["stress", /(stress|overwhelm|pressure)/i],
        ["anxiety", /(anxiety|anxious|worry|panic|nervous)/i],
        ["sleep", /(sleep|insomnia|night|tired|exhausted)/i],
        ["reflect", /(reflect|talk|meaning|overthink|ruminate)/i],
        ["grief", /(grief|loss|bereav)/i],
        ["loneliness", /(lonely|alone|isolat|disconnected)/i],
        ["anger", /(anger|angry|irritable|rage)/i],
        ["burnout", /(burnout|burned out|unmotivated|drained)/i],
    ];

    rules.forEach(([key, rule]) => {
        if (rule.test(lower)) {
            matches.push(key);
        }
    });

    return Array.from(new Set(matches));
};

const pickCategory = (tags: CategoryKey[], fallback: CategoryKey): CategoryKey => {
    if (tags.length === 0) return fallback;
    const counts = new Map<CategoryKey, number>();
    tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
    let best: CategoryKey = tags[0];
    let bestCount = -1;
    counts.forEach((count, tag) => {
        if (count > bestCount) {
            best = tag;
            bestCount = count;
        }
    });
    return best;
};

const normalizeGeminiValue = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z]+/g, " ");

const parseGeminiCategory = (raw: string): CategoryKey | null => {
    if (!raw) return null;
    let candidate = raw.trim();
    const jsonMatch = candidate.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (typeof parsed?.category === "string") {
                candidate = parsed.category;
            }
        } catch {
            // fall back to raw string
        }
    }
    const normalized = normalizeGeminiValue(candidate);
    if (!normalized || normalized.includes("none") || normalized.includes("unknown")) {
        return null;
    }
    return mapTagToCategory(normalized.replace(/\s+/g, ""));
};

const buildGeminiPrompt = (description: string) => {
    return [
        "You are a classifier. Map the user's description to one of these categories:",
        "sad, stress, anxiety, sleep, reflect, grief, loneliness, anger, burnout.",
        'If none fit, respond with {"category":"none"}.',
        'Respond with ONLY a JSON object like {"category":"sad"} and nothing else.',
        `User description: """${description.trim()}"""`,
    ].join("\n");
};

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const QuestionScreen = React.forwardRef<QuestionScreenHandle, Props>(
    ({ onCanGoBackChange, onComplete }, ref) => {
    const [flow, setFlow] = useState<QuestionFlow | null>(null);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [endState, setEndState] = useState<string | null>(null);
    const [textValue, setTextValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [answerTags, setAnswerTags] = useState<Record<string, string[]>>({});
    const [aiCategory, setAiCategory] = useState<CategoryKey | null>(null);
    const [aiStatus, setAiStatus] = useState<RecommendationStatus>("idle");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const base_url = process.env.EXPO_PUBLIC_API_BASE_URL;
    const completedRef = useRef(false);

    const goTo = useCallback((nextId: string, flowData: QuestionFlow) => {
        if (currentId) {
            setHistory((prev) => [...prev, currentId]);
        }
        if (nextId?.startsWith("END_") || !flowData.questions[nextId]) {
            setEndState(nextId);
            setCurrentId(null);
            return;
        }
        setEndState(null);
        setCurrentId(nextId);
        setTextValue(answers[nextId] ?? "");
    }, [answers, currentId]);

    const handleStartOver = useCallback(() => {
        if (!flow) return;
        setHistory([]);
        setAnswers({});
        setAnswerTags({});
        setAiCategory(null);
        setAiStatus("idle");
        setEndState(null);
        setCurrentId(flow.startQuestionId);
        setTextValue("");
    }, [flow]);

    const goBack = useCallback(() => {
        setEndState(null);
        setHistory((prev) => {
            if (prev.length === 0) return prev;
            const prevId = prev[prev.length - 1];
            setCurrentId(prevId);
            setTextValue(answers[prevId] ?? "");
            return prev.slice(0, -1);
        });
    }, [answers]);

    const canGoBack = history.length > 0 || !!endState;

    useImperativeHandle(ref, () => ({ goBack }), [goBack]);

    useEffect(() => {
        onCanGoBackChange?.(canGoBack);
    }, [canGoBack, onCanGoBackChange]);

    useEffect(() => {
        if (!base_url) {
            setError("Missing EXPO_PUBLIC_API_BASE_URL");
            return;
        }

        const load = async () => {
            try {
                const res = await fetch(`${base_url}/questions`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setFlow(data);
                setCurrentId(data.startQuestionId);
                setEndState(null);
                setTextValue("");
                setHistory([]);
                setAnswers({});
                setAnswerTags({});
                setAiCategory(null);
                setAiStatus("idle");
            } catch (e: any) {
                setError(e?.message ?? "Failed to load");
            }
        };

        load();
    }, [base_url]);

    const question = flow && currentId ? flow.questions[currentId] : null;
    const isFreeText = question?.type === "free_text" || question?.type === "free_text_or_skip";
    const canSubmit = question?.type !== "free_text" || textValue.trim().length > 0;

    const recommendedCategoryKey = useMemo(() => {
        const collected: CategoryKey[] = [];

        if (endState && flow?.endStates[endState]?.resourceTag) {
            const mapped = mapTagToCategory(flow.endStates[endState]?.resourceTag);
            if (mapped) collected.push(mapped);
        }

        Object.values(answerTags).forEach((tags) => {
            tags.forEach((tag) => {
                const mapped = mapTagToCategory(tag);
                if (mapped) collected.push(mapped);
            });
        });

        return pickCategory(collected, "sad");
    }, [answerTags, endState, flow]);

    const finalCategoryKey =
        aiStatus === "matched" && aiCategory ? aiCategory : recommendedCategoryKey;

    useEffect(() => {
        if (!endState) {
            completedRef.current = false;
            return;
        }
        if (completedRef.current) return;
        completedRef.current = true;
        if (aiStatus === "unmatched") {
            onComplete?.({
                category: null,
                status: "unmatched",
                message: "We don't have the category you are looking for yet. We are working on it.",
            });
        } else {
            onComplete?.({
                category: finalCategoryKey,
                status: "matched",
            });
        }
        handleStartOver();
    }, [aiStatus, endState, finalCategoryKey, handleStartOver, onComplete, recommendedCategoryKey]);

    const classifyDescription = useCallback(
        async (description: string) => {
            const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY for category analysis.");
            }

            const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: buildGeminiPrompt(description) }] }],
                    generationConfig: { temperature: 0.2, topP: 0.8 },
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    ],
                }),
            });

            const data = await res.json().catch(() => undefined);
            if (!res.ok) {
                const msg = data?.error?.message ?? `Gemini request failed (${res.status})`;
                throw new Error(msg);
            }

            const text = data?.candidates?.[0]?.content?.parts
                ?.map((p: { text?: string }) => p.text ?? "")
                .join("\n")
                .trim();

            return parseGeminiCategory(text ?? "");
        },
        []
    );

    const recommendedLabel = BOOK_CATEGORIES[finalCategoryKey]?.label ?? "Recommended resources";
    const recommendedBooks = BOOK_CATEGORIES[finalCategoryKey]?.books ?? [];
    const recommendedArticles = ARTICLE_CATEGORIES[finalCategoryKey]?.articles ?? [];
    const recommendedVideos = VIDEO_CATEGORIES[finalCategoryKey]?.videos ?? [];

    const handleSelectOption = useCallback(
        (opt: QuestionOption) => {
            if (!flow || !question) return;
            if (question.id) {
                setAnswers((prev) => ({ ...prev, [question.id]: opt.label }));
                setAnswerTags((prev) => ({
                    ...prev,
                    [question.id]: opt.resourceTag ? [opt.resourceTag] : [],
                }));
            }
            goTo(opt.next, flow);
        },
        [flow, goTo, question]
    );

    return (
        <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            keyboardShouldPersistTaps="handled"
        >
            {error ? (
                <Text style={{ color: "red" }}>Error: {error}</Text>
            ) : !flow ? (
                <LoadingScreen />
            ) : endState ? (
                <View style={s.card}>
                    <Text style={s.question}>Thanks for sharing.</Text>
                    {aiStatus === "unmatched" ? (
                        <Text style={s.subtle}>
                            We don't have the category you are looking for yet. We are working on it.
                        </Text>
                    ) : (
                        <>
                            <Text style={s.subtle}>Suggested topic: {recommendedLabel}</Text>

                            <View style={s.section}>
                                <View style={s.sectionHeader}>
                                    <Text style={s.sectionTitle}>Books</Text>
                                    <Link
                                        href={{
                                            pathname: "/(tabs)/home/books",
                                            params: { category: finalCategoryKey },
                                        }}
                                        asChild
                                    >
                                        <Pressable style={s.sectionLink}>
                                            <Text style={s.sectionLinkText}>View all</Text>
                                        </Pressable>
                                    </Link>
                                </View>
                                {recommendedBooks.slice(0, 2).map((book) => (
                                    <BookCard
                                        key={`${book.isbn13}-${book.title}`}
                                        title={book.title}
                                        author={book.author}
                                        isbn13={book.isbn13}
                                    />
                                ))}
                            </View>

                            <View style={s.section}>
                                <View style={s.sectionHeader}>
                                    <Text style={s.sectionTitle}>Articles</Text>
                                    <Link
                                        href={{
                                            pathname: "/(tabs)/home/articles",
                                            params: { category: finalCategoryKey },
                                        }}
                                        asChild
                                    >
                                        <Pressable style={s.sectionLink}>
                                            <Text style={s.sectionLinkText}>View all</Text>
                                        </Pressable>
                                    </Link>
                                </View>
                                {recommendedArticles.slice(0, 2).map((article) => (
                                    <ArticleCard
                                        key={`${article.url}-${article.title}`}
                                        title={article.title}
                                        source={article.source}
                                        url={article.url}
                                    />
                                ))}
                            </View>

                            <View style={s.section}>
                                <View style={s.sectionHeader}>
                                    <Text style={s.sectionTitle}>Videos</Text>
                                    <Link
                                        href={{
                                            pathname: "/(tabs)/home/videos",
                                            params: { category: finalCategoryKey },
                                        }}
                                        asChild
                                    >
                                        <Pressable style={s.sectionLink}>
                                            <Text style={s.sectionLinkText}>View all</Text>
                                        </Pressable>
                                    </Link>
                                </View>
                                {recommendedVideos.slice(0, 2).map((video) => (
                                    <VideoCard
                                        key={`${video.videoId}-${video.title}`}
                                        videoId={video.videoId}
                                        title={video.title}
                                        channel={video.channel}
                                        duration={video.duration}
                                    />
                                ))}
                            </View>
                        </>
                    )}

                    <Pressable style={s.option} onPress={handleStartOver}>
                        <Text style={s.optionText}>Start over</Text>
                    </Pressable>
                </View>
            ) : !question ? (
                <Text>Loading questions...</Text>
            ) : (
                <View style={{ padding: 16 }}>
                    <View style={s.card}>
                        <Text style={s.question}>{question.prompt}</Text>
                        {question.type === "single_choice" ? (
                            <View style={{ marginTop: 12 }}>
                                {question.options?.map((opt) => (
                                    <Pressable
                                        key={opt.id}
                                        style={s.option}
                                        onPress={() => handleSelectOption(opt)}
                                    >
                                        <Text style={s.optionText}>{opt.label}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        ) : isFreeText ? (
                            <View style={{ marginTop: 12 }}>
                                <TextInput
                                    style={s.input}
                                    value={textValue}
                                    onChangeText={setTextValue}
                                    placeholder="Type here..."
                                    placeholderTextColor="#7ea0ad"
                                    multiline
                                />
                                <Pressable
                                    style={[
                                        s.option,
                                        (!canSubmit || isAnalyzing) && s.optionDisabled,
                                    ]}
                                    onPress={async () => {
                                        if (!flow || !question) return;
                                        const trimmed = textValue.trim();
                                        if (question?.id) {
                                            setAnswers((prev) => ({ ...prev, [question.id]: textValue }));
                                        }

                                        if (!trimmed) {
                                            if (question?.id) {
                                                setAnswerTags((prev) => ({ ...prev, [question.id]: [] }));
                                            }
                                            goTo(question.next ?? "END_GENERAL", flow);
                                            return;
                                        }

                                        setIsAnalyzing(true);
                                        try {
                                            const aiMatch = await classifyDescription(trimmed);
                                            if (aiMatch) {
                                                setAiCategory(aiMatch);
                                                setAiStatus("matched");
                                            } else {
                                                setAiCategory(null);
                                                setAiStatus("unmatched");
                                            }
                                        } catch {
                                            const fallbackTags = extractTagsFromText(trimmed);
                                            if (fallbackTags.length > 0) {
                                                setAiCategory(fallbackTags[0]);
                                                setAiStatus("matched");
                                            } else {
                                                setAiCategory(null);
                                                setAiStatus("unmatched");
                                            }
                                        } finally {
                                            setIsAnalyzing(false);
                                        }

                                        if (question?.id) {
                                            setAnswerTags((prev) => ({
                                                ...prev,
                                                [question.id]: extractTagsFromText(trimmed),
                                            }));
                                        }
                                        goTo(question.next ?? "END_GENERAL", flow);
                                    }}
                                    disabled={!canSubmit || isAnalyzing}
                                >
                                    <Text style={s.optionText}>
                                        {isAnalyzing
                                            ? "Analyzing..."
                                            : question.type === "free_text_or_skip"
                                            ? "Continue"
                                            : "Submit"}
                                    </Text>
                                </Pressable>
                                {question.type === "free_text_or_skip" ? (
                                    <Pressable
                                        style={s.optionSecondary}
                                        onPress={() => {
                                            if (question?.id) {
                                                setAnswerTags((prev) => ({ ...prev, [question.id]: [] }));
                                            }
                                            setAiCategory(null);
                                            setAiStatus("idle");
                                            goTo(question.next ?? "END_GENERAL", flow);
                                        }}
                                    >
                                        <Text style={s.optionTextSecondary}>Skip</Text>
                                    </Pressable>
                                ) : null}
                            </View>
                        ) : null}
                    </View>
                </View>
            )}
        </ScrollView>

    );
});

QuestionScreen.displayName = "QuestionScreen";

export default QuestionScreen;

const s = StyleSheet.create({
    container: { flex: 1 },
    row: { flexDirection: "row", width: "100%", paddingHorizontal: 20, marginTop: 15 },
    cell: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 8,
        borderRadius: 8,
        margin: 3,
        backgroundColor: "#002532ff",
    },
    active: {
        textAlign: "center",
        fontWeight: "900",
        color: "white",
        backgroundColor: "#002532ff",
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
    scroll: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingBottom: 24 },
    card: {
        backgroundColor: "#0b3040",
        margin: 12,
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#134b61",
    },
    question: { color: "white", fontSize: 16, fontWeight: "600" },
    subtle: { color: "#cbd5db", marginTop: 8 },
    option: {
        backgroundColor: "#134b61",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    optionDisabled: { opacity: 0.6 },
    optionText: { color: "white", fontWeight: "600" },
    optionSecondary: {
        backgroundColor: "transparent",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 6,
        borderWidth: 1,
        borderColor: "#134b61",
    },
    optionTextSecondary: { color: "#b7c7cf", fontWeight: "600" },
    input: {
        backgroundColor: "#0f3a4c",
        color: "white",
        borderRadius: 8,
        padding: 10,
        minHeight: 90,
        textAlignVertical: "top",
        borderWidth: 1,
        borderColor: "#134b61",
    },
    section: {
        marginTop: 16,
        gap: 12,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    sectionTitle: {
        color: "white",
        fontSize: 15,
        fontWeight: "700",
    },
    sectionLink: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#1a6b86",
        backgroundColor: "#0f3a4c",
    },
    sectionLinkText: {
        color: "#9ccfe6",
        fontWeight: "700",
        fontSize: 12,
    },
});
