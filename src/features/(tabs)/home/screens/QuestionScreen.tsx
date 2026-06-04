import { Link } from "expo-router";
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import LoadingScreen from "@/src/components/LoadingScreen";
import ArticleCard from "../components/ArticleCard";
import BookCard from "../components/BookCard";
import VideoCard from "../components/VideoCard";
import type { CategoryKey, RecommendationStatus } from "../context/RecommendationContext";
import {
    getResourceCategoriesFromFirestore,
    type ResourceCategoryMap,
} from "../data/resourceFirestore";
import { GEMINI_ENDPOINT, GEMINI_SAFETY_SETTINGS } from "@/src/utils/gemini";
import { callGroqChat } from "@/src/utils/groq";

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
        queryText?: string | null;
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
    "happy",
    "motivation",
    "selfesteem",
    "confidence",
    "relationships",
    "trauma",
    "addiction",
    "focus",
    "ocd",
    "ptsd",
    "mindfulness",
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
    "burned out": "burnout",
    burnout: "burnout",
    unmotivated: "burnout",
    drained: "burnout",
    reflect: "reflect",
    meaning: "reflect",
    talk: "reflect",
    happy: "happy",
    happiness: "happy",
    joyful: "happy",
    optimistic: "happy",
    motivation: "motivation",
    motivated: "motivation",
    drive: "motivation",
    selfesteem: "selfesteem",
    "self-esteem": "selfesteem",
    "self esteem": "selfesteem",
    "self worth": "selfesteem",
    "self-worth": "selfesteem",
    confidence: "confidence",
    relationships: "relationships",
    relationship: "relationships",
    breakup: "relationships",
    trauma: "trauma",
    addiction: "addiction",
    addicted: "addiction",
    focus: "focus",
    attention: "focus",
    adhd: "focus",
    ocd: "ocd",
    ptsd: "ptsd",
    mindfulness: "mindfulness",
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

const hasNegatedHappy = (text: string) =>
    /\b(not|never|no)\s+(happy|optimistic|positive|joyful|joy)\b/i.test(text) ||
    /\bunhappy\b/i.test(text);

const hasNegatedSad = (text: string) =>
    /\b(not|never|no)\s+(sad|down|depressed|depress|hopeless|low mood)\b/i.test(text);

const hasFamilyIssue = (text: string) =>
    /\bfamily\b|\bparents?\b|\bmother\b|\bfather\b|\bspouse\b|\bpartner\b|\bmarriage\b|\bdivorce\b/i.test(
        text
    );

const hasAcademicIssue = (text: string) =>
    /\bstudies\b|\bstudy\b|\bschool\b|\bcollege\b|\buniversity\b|\bexam(s)?\b|\bhomework\b|\bassignments?\b|\bgrades?\b|\bcoursework\b/i.test(
        text
    );

const extractTagsFromText = (text: string): CategoryKey[] => {
    if (!text) return [];
    const lower = text.toLowerCase();
    const matches: CategoryKey[] = [];
    const negatedHappy = hasNegatedHappy(lower);
    const negatedSad = hasNegatedSad(lower);
    const familyIssue = hasFamilyIssue(lower);
    const academicIssue = hasAcademicIssue(lower);

    const rules: Array<[CategoryKey, RegExp]> = [
        ["sad", /(sad|down|depress|hopeless|low mood|unhappy|empty|numb|cry)/i],
        ["stress", /(stress|overwhelm|pressure|deadline|work|job|boss|money|finance|bills|exam|school|college|university|grades|coursework)/i],
        ["anxiety", /(anxiety|anxious|worry|panic|nervous|fear|racing thoughts)/i],
        ["sleep", /(sleep|insomnia|nightmare|tired|exhausted|can't sleep)/i],
        ["reflect", /(reflect|talk|meaning|overthink|ruminate|thinking a lot)/i],
        ["grief", /(grief|loss|bereav|mourning)/i],
        ["loneliness", /(lonely|alone|isolat|disconnected)/i],
        ["anger", /(anger|angry|irritable|rage|frustrat)/i],
        ["burnout", /(burnout|burned out|unmotivated|drained|no energy)/i],
        ["happy", /(happy|happiness|joy|optimistic|positive|grateful|content)/i],
        ["motivation", /(motivation|motivated|drive|procrastin|stuck|can't start)/i],
        ["selfesteem", /(self esteem|self-worth|self worth|insecure|worthless|self hate|not good enough)/i],
        ["confidence", /(confidence|self-confidence|self confidence|fear of failure|doubt myself)/i],
        ["relationships", /(relationship|breakup|partner|communication|family conflict|family|parents|mother|father|spouse|marriage|divorce)/i],
        ["trauma", /(trauma|flashback|abuse|assault)/i],
        ["addiction", /(addiction|substance|alcohol|drug use|craving)/i],
        ["focus", /(focus|concentration|attention|adhd|study|studies|homework|assignment|distract)/i],
        ["ocd", /(ocd|obsessive|compulsive|intrusive)/i],
        ["ptsd", /(ptsd|post[- ]traumatic|trigger|hypervigil)/i],
        ["mindfulness", /(mindful|mindfulness|meditation|breathing|grounding|calm)/i],
    ];

    rules.forEach(([key, rule]) => {
        if (key === "happy" && negatedHappy) return;
        if (key === "sad" && negatedSad) return;
        if (rule.test(lower)) {
            matches.push(key);
        }
    });

    if (negatedHappy) {
        matches.push("sad");
    }
    if (familyIssue) {
        matches.push("relationships");
        matches.push("relationships");
    }
    if (academicIssue) {
        matches.push("focus");
        matches.push("stress");
    }

    return Array.from(new Set(matches));
};

const refineCategoryWithText = (description: string, candidate: CategoryKey | null) => {
    if (!description) return candidate;
    const negatedHappy = hasNegatedHappy(description);
    const negatedSad = hasNegatedSad(description);
    const familyIssue = hasFamilyIssue(description);
    const academicIssue = hasAcademicIssue(description);
    if (candidate === "happy" && negatedHappy) return "sad";
    if (candidate === "sad" && negatedSad) return null;
    if (candidate === "happy" && familyIssue) return "relationships";
    if (!candidate && familyIssue) return "relationships";
    if (!candidate && academicIssue) return "focus";
    return candidate;
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
        "You are a classifier. Read the FULL sentence(s) and infer the single best category.",
        "Handle negations and context (e.g., 'not happy' is NOT happy; 'not sad' is NOT sad).",
        "If family/relationship conflict is mentioned, choose relationships.",
        "If school/work/finance pressure is mentioned, choose stress (or focus if it is mainly about concentration).",
        "If multiple categories apply, choose the MOST dominant theme.",
        "Categories:",
        "sad, stress, anxiety, sleep, reflect, grief, loneliness, anger, burnout, happy, motivation, selfesteem, confidence, relationships, trauma, addiction, focus, ocd, ptsd, mindfulness.",
        "Category guidance:",
        "- sad: low mood, hopeless, depressed, crying, empty, numb",
        "- stress: overwhelmed, pressure, deadlines, work/school/finance burdens",
        "- anxiety: worry, panic, nervous, fear, racing thoughts",
        "- sleep: insomnia, poor sleep, tired/exhausted, nightmares",
        "- reflect: wants to talk/think, meaning, rumination, self-reflection",
        "- grief: loss, bereavement, mourning",
        "- loneliness: lonely, isolated, disconnected",
        "- anger: angry, irritable, rage",
        "- burnout: drained, exhausted by work, no energy, chronic overload",
        "- happy: positive, grateful, joyful, optimistic (not negated)",
        "- motivation: unmotivated, procrastination, stuck",
        "- selfesteem: self-worth, insecure, self-hate, not good enough",
        "- confidence: self-confidence, fear of failure, doubt in abilities",
        "- relationships: family, partner, breakup, conflict, communication issues",
        "- trauma: trauma, abuse, flashbacks",
        "- addiction: substance use, alcohol, drugs, cravings",
        "- focus: concentration, attention, ADHD, study focus",
        "- ocd: intrusive thoughts, compulsions, obsessions",
        "- ptsd: PTSD, triggers, hypervigilance",
        "- mindfulness: meditation, breathing, calm, grounding",
        'If none fit, respond with {"category":"none"}.',
        'Respond with ONLY a JSON object like {"category":"sad"} and nothing else.',
        "Examples:",
        'Input: "I am not happy and I have problems with my family." -> {"category":"relationships"}',
        'Input: "I am not sad, just tired." -> {"category":"sleep"}',
        'Input: "I am not able to cope with my studies." -> {"category":"stress"}',
        'Input: "I feel lonely and sad." -> {"category":"loneliness"}',
        'Input: "I cannot sleep and I feel exhausted." -> {"category":"sleep"}',
        'Input: "I feel overwhelmed with work and bills." -> {"category":"stress"}',
        'Input: "I cannot concentrate on my assignments." -> {"category":"focus"}',
        `User description: """${description.trim()}"""`,
    ].join("\n");
};

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
    const [lastDescription, setLastDescription] = useState<string | null>(null);
    const [resourceCategories, setResourceCategories] = useState<ResourceCategoryMap | null>(null);
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
        setLastDescription(null);
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

    const question = flow && currentId ? flow.questions[currentId] : null;
    const isFreeText = question?.type === "free_text" || question?.type === "free_text_or_skip";
    const canSubmit = question?.type !== "free_text" || textValue.trim().length > 0;

    const collectedCategories = useMemo(() => {
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

        return collected;
    }, [answerTags, endState, flow]);

    const recommendedCategoryKey = useMemo(
        () => pickCategory(collectedCategories, "reflect"),
        [collectedCategories]
    );

    const finalCategoryKey =
        aiStatus === "matched" && aiCategory ? aiCategory : recommendedCategoryKey;

    const hasDescription = !!lastDescription?.trim();
    const isGeneralLowInfoResult =
        !hasDescription &&
        aiStatus === "idle" &&
        (collectedCategories.length === 0 ||
            collectedCategories.every((category) => category === "reflect"));

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
                queryText: lastDescription,
            });
        } else if (isGeneralLowInfoResult) {
            onComplete?.({
                category: null,
                status: "matched",
                message:
                    "You did not enter enough information for personalized recommendations. Showing general resources for now.",
                queryText: null,
            });
        } else {
            onComplete?.({
                category: finalCategoryKey,
                status: "matched",
                queryText: lastDescription,
            });
        }
        handleStartOver();
    }, [
        aiStatus,
        endState,
        finalCategoryKey,
        handleStartOver,
        isGeneralLowInfoResult,
        lastDescription,
        onComplete,
    ]);

    const classifyDescription = useCallback(
        async (description: string) => {
            const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
            if (!apiKey) {
                const groqText = await callGroqChat({
                    messages: [{ role: "user", content: buildGeminiPrompt(description) }],
                    maxTokens: 64,
                    temperature: 0.2,
                });
                const candidate = parseGeminiCategory(groqText ?? "");
                const refined = refineCategoryWithText(description, candidate);
                if (refined) return refined;
                const fallbackTags = extractTagsFromText(description);
                if (fallbackTags.length > 0) return pickCategory(fallbackTags, "reflect");
                return "reflect";
            }

            const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: buildGeminiPrompt(description) }] }],
                    generationConfig: { temperature: 0.2, topP: 0.8 },
                    safetySettings: GEMINI_SAFETY_SETTINGS,
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

            const candidate = parseGeminiCategory(text ?? "");
            const refined = refineCategoryWithText(description, candidate);
            if (refined) return refined;
            const fallbackTags = extractTagsFromText(description);
            if (fallbackTags.length > 0) return pickCategory(fallbackTags, "reflect");
            return "reflect";
        },
        []
    );

    const recommendedResources = resourceCategories?.[finalCategoryKey];
    const recommendedLabel = recommendedResources?.label ?? "Recommended resources";
    const recommendedBooks = recommendedResources?.books ?? [];
    const recommendedArticles = recommendedResources?.articles ?? [];
    const recommendedVideos = recommendedResources?.videos ?? [];

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
                                        key={`${book.isbn13 ?? "noisbn"}-${book.title}`}
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
                                            setLastDescription(null);
                                            goTo(question.next ?? "END_GENERAL", flow);
                                            return;
                                        }

                                        setLastDescription(trimmed);
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
                try {
                    const groqText = await callGroqChat({
                        messages: [{ role: "user", content: buildGeminiPrompt(trimmed) }],
                        maxTokens: 64,
                        temperature: 0.2,
                    });
                    const candidate = parseGeminiCategory(groqText ?? "");
                    const refined = refineCategoryWithText(trimmed, candidate);
                    if (refined) {
                        setAiCategory(refined);
                        setAiStatus("matched");
                    } else {
                        setAiCategory(null);
                        setAiStatus("unmatched");
                    }
                } catch {
                    setAiCategory(null);
                    setAiStatus("unmatched");
                }
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
                                            setLastDescription(null);
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
