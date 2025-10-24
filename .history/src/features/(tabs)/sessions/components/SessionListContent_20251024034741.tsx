import React from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { Session } from "@/src/Session";
import { styles } from "../styles/sessions.styles";

type Props = {
  sessionLists: Session[];
  isLoading: boolean;
  selectedSession: Session | null;
  setSelectedSession: (s: Session | null) => void;
  seenIds: Set<string>;
  markSeen: (id: string) => void;
  isFuture: (s: Session) => boolean;
  userEmail?: string; // to determine Admin in-modal actions
  handleEditButton: (session: Session) => void;
  handleDeleteButton: (session: Session) => void;
};

export default function SessionListContent({
  sessionLists,
  isLoading,
  selectedSession,
  setSelectedSession,
  seenIds,
  markSeen,
  isFuture,
  userEmail,
  handleEditButton,
  handleDeleteButton,
}: Props) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading sessions...</Text>
      </View>
    );
  }

  if (sessionLists.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No sessions added. Please come back later</Text>
      </View>
    );
  }

  const isAdmin = userEmail === "Admin";

  return (
    <>
      <FlatList
        data={sessionLists}
        keyExtractor={(item: Session, idx) => item.docId ?? `${item.title}-${item.date}-${idx}`}
        contentContainerStyle={{ padding: 10, paddingBottom: 28 }}
        renderItem={({ item }) => {
          const future = isFuture(item);
          return (
            <LinearGradient
              colors={["#2ebec9ff", "#94dbe1ff", "#e7e7e7ff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.subCard}
            >
              <Pressable
                style={styles.row}
                onPress={() => {
                  setSelectedSession(item);
                  if (item.docId) markSeen(item.docId);
                }}
              >
                <Text style={styles.title}>{item.title}</Text>
                {!item.docId || !seenIds.has(item.docId) ? (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                ) : null}

                <Text
                  style={[
                    styles.status,
                    future ? styles.statusUpcoming : styles.statusExpired,
                  ]}
                >
                  {future ? "Upcoming" : "Expired"}
                </Text>
              </Pressable>
            </LinearGradient>
          );
        }}
      />

      {/* Detail Modal (unchanged core) */}
      <Modal
        visible={!!selectedSession}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedSession(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
          style={styles.centered}
        >
          <Pressable style={styles.backdrop} onPress={() => setSelectedSession(null)} />

          <LinearGradient
            colors={["#2372a7ff", "#168895ff", "#032527ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalCardGradient}
          >
            {/* Glow */}
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.36)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x
