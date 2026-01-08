import ThemeBackground from "@/src/shared/ThemeBackground";
import React, { useEffect, useRef } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  ListRenderItemInfo,
  Platform,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import ChatInput from "../components/ChatInput";
import { useChat } from "../hooks/useChat";
import { ChatMessage } from "../hooks/useGemini";
import { chatStyles as styles } from "../styles/chats.styles";

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

export default function ChatsScreen() {
  const { messages, sendMessage, isLoading, error } = useChat();
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderItem = ({ item }: ListRenderItemInfo<ChatMessage>) => {
    const isUser = item.role === "user";
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
        <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
      </View>
    );
  };

  return (
    <ThemeBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0} // start with 0; adjust later ONLY if you have a header
      >
        <SafeAreaView style={{ flex: 1 }}>
          <FlatList
            ref={listRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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

          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemeBackground>
  );
}
