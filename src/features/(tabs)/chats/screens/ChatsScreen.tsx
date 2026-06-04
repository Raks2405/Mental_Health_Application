import ThemeBackground from "@/src/shared/ThemeBackground";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  ListRenderItemInfo,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import ChatInput from "../components/ChatInput";
import { useChat } from "../hooks/useChat";
import { ChatMessage } from "../hooks/useGemini";
import { chatStyles as styles } from "../styles/chats.styles";
import { useRecommendation } from "../../home/context/RecommendationContext";

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const ChatBubble = React.memo(function ChatBubble({ item }: { item: ChatMessage }) {
  const isUser = item.role === "user";
  const timestamp = useMemo(() => formatTime(item.createdAt), [item.createdAt]);
  const renderSourceBadge = (source?: "gemini" | "groq") => {
    if (!source) return null;
    return (
      <View style={styles.sourcePill}>
        <Text style={styles.sourceText}>{source.toUpperCase()}</Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.bubble,
        isUser ? styles.bubbleUser : styles.bubbleAssistant,
      ]}
    >
      <Text style={styles.bubbleLabel}>{isUser ? "You" : "Companion"}</Text>
      <Text
        style={[
          styles.bubbleText,
          item.text === "Thinking..." && styles.thinking,
        ]}
      >
        {item.text}
      </Text>
      <View style={styles.metaRow}>
        {renderSourceBadge(item.source)}
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>
    </View>
  );
});

export default function ChatsScreen() {
  const { messages, sendMessage, isLoading, error, resetChat, isTopicActive } = useChat();
  const { clearRecommendation } = useRecommendation();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();
  const androidKeyboardNudge = 8;
  const effectiveKeyboardHeight =
    Platform.OS === "android"
      ? Math.max(0, keyboardHeight - tabBarHeight + androidKeyboardNudge)
      : 0;
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: false });
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: false });
      }, 0);
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: false });
      }, 80);
    });
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const onShow = (event: { endCoordinates?: { height?: number } }) => {
      const height = event?.endCoordinates?.height ?? 0;
      setKeyboardHeight(height);
      scrollToBottom();
    };
    const onHide = () => {
      setKeyboardHeight(0);
      scrollToBottom();
    };
    const showSub = Keyboard.addListener("keyboardDidShow", onShow);
    const hideSub = Keyboard.addListener("keyboardDidHide", onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [scrollToBottom]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChatMessage>) => <ChatBubble item={item} />,
    []
  );
  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);
  const handleSend = useCallback(
    (text: string) => {
      sendMessage(text);
      scrollToBottom();
    },
    [scrollToBottom, sendMessage]
  );
  const handleContentSizeChange = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [effectiveKeyboardHeight, inputHeight, scrollToBottom]);

  return (
    <ThemeBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <FlatList
            ref={listRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={[
              styles.listContent,
              {
                paddingBottom:
                  inputHeight +
                  16 +
                  (Platform.OS === "android" ? effectiveKeyboardHeight : 0),
              },
            ]}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={handleContentSizeChange}
            initialNumToRender={10}
            maxToRenderPerBatch={12}
            windowSize={7}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={Platform.OS === "android"}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Start a conversation</Text>
                <Text style={styles.emptyText}>
                  Share a feeling or ask for advice. The chatbot is trained to
                  give concise, calming responses.
                </Text>
              </View>
            }
          />

          <View
            onLayout={(event) => {
              const height = event.nativeEvent.layout.height;
              if (height && height !== inputHeight) setInputHeight(height);
            }}
            style={{
              transform:
                Platform.OS === "android"
                  ? [{ translateY: -effectiveKeyboardHeight }]
                  : undefined,
            }}
          >
            <ChatInput
              onSend={handleSend}
              disabled={isLoading}
              keyboardOpen={keyboardHeight > 0}
              showClear={isTopicActive}
              onClear={() => setShowClearConfirm(true)}
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      <Modal
        visible={showClearConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClearConfirm(false)}
      >
        <View style={m.modalBackdrop}>
          <View style={m.modalCard}>
            <Text style={m.modalTitle}>Clear Quick Questions?</Text>
            <Text style={m.modalBody}>
              This will clear your answers and reset recommendations, books, articles, videos, and
              the chatbot context.
            </Text>
            <View style={m.modalRow}>
              <Pressable
                onPress={() => setShowClearConfirm(false)}
                style={[m.modalButton, m.cancelButton]}
              >
                <Text style={m.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  clearRecommendation();
                  resetChat();
                  setShowClearConfirm(false);
                }}
                style={[m.modalButton, m.clearButton]}
              >
                <Text style={m.clearText}>Clear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ThemeBackground>
  );
}

const m = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "90%",
    maxWidth: 420,
    backgroundColor: "#0b3040",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#134b61",
    padding: 16,
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  modalBody: {
    color: "#cbd5db",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 14,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#0f3a4c",
    borderWidth: 1,
    borderColor: "#1a6b86",
  },
  clearButton: {
    backgroundColor: "#22d3ee",
  },
  cancelText: {
    color: "#9ccfe6",
    fontWeight: "700",
  },
  clearText: {
    color: "#02131a",
    fontWeight: "800",
  },
});
