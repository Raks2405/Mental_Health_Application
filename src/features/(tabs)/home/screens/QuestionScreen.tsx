import React, { useCallback, useEffect, useImperativeHandle, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import LoadingScreen from "@/src/components/LoadingScreen";

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
};

const QuestionScreen = React.forwardRef<QuestionScreenHandle, Props>(
    ({ onCanGoBackChange }, ref) => {
    const [flow, setFlow] = useState<QuestionFlow | null>(null);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [endState, setEndState] = useState<string | null>(null);
    const [textValue, setTextValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const base_url = process.env.EXPO_PUBLIC_API_BASE_URL;

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
            } catch (e: any) {
                setError(e?.message ?? "Failed to load");
            }
        };

        load();
    }, [base_url]);

    const question = flow && currentId ? flow.questions[currentId] : null;
    const isFreeText = question?.type === "free_text" || question?.type === "free_text_or_skip";
    const canSubmit = question?.type !== "free_text" || textValue.trim().length > 0;

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
                    <Text style={s.subtle}>
                        Suggested topic: {flow.endStates[endState]?.resourceTag ?? "general"}
                    </Text>
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
                                        onPress={() => goTo(opt.next, flow)}
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
                                    style={[s.option, !canSubmit && s.optionDisabled]}
                                    onPress={() => {
                                        if (question?.id) {
                                            setAnswers((prev) => ({ ...prev, [question.id]: textValue }));
                                        }
                                        goTo(question.next ?? "END_GENERAL", flow);
                                    }}
                                    disabled={!canSubmit}
                                >
                                    <Text style={s.optionText}>
                                        {question.type === "free_text_or_skip" ? "Continue" : "Submit"}
                                    </Text>
                                </Pressable>
                                {question.type === "free_text_or_skip" ? (
                                    <Pressable
                                        style={s.optionSecondary}
                                        onPress={() => goTo(question.next ?? "END_GENERAL", flow)}
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
});
