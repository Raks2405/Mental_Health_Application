import React, { useState } from "react";
import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

type Props = {
  title: string;
  author: string;
  isbn13?: string;
  recommended?: boolean;
};

export default function BookCard({ title, author, isbn13, recommended }: Props) {
  const [coverError, setCoverError] = useState(false);
  const hasCover = Boolean(isbn13);
  const coverUrl = hasCover
    ? `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg?default=false`
    : "";
  const openUrl = hasCover
    ? `https://openlibrary.org/isbn/${isbn13}`
    : title?.trim()
    ? `https://openlibrary.org/search?q=${encodeURIComponent(title)}`
    : "https://openlibrary.org";

  const openBook = () => {
    Linking.openURL(openUrl);
  };

  return (
    <Pressable style={s.card} onPress={openBook} accessibilityRole="button">
      <View style={s.coverWrap}>
        {hasCover && !coverError ? (
          <Image
            source={{ uri: coverUrl }}
            style={s.cover}
            resizeMode="contain"
            onError={() => setCoverError(true)}
          />
        ) : (
          <View style={s.coverFallback}>
            <Text style={s.coverFallbackText}>No cover available</Text>
            {!title?.trim() ? (
              <Text style={s.coverFallbackSub}>No title available</Text>
            ) : null}
          </View>
        )}
      </View>

      <View style={s.connectorWrap}>
        <View style={s.connectorDot} />
        <View style={s.connectorLine} />
        <View style={s.connectorDot} />
      </View>
      <View style={s.infoCard}>
        {recommended ? (
          <View style={s.recoPill}>
            <FontAwesome name="magic" size={12} color="#02131a" style={s.aiIcon} />
            <Text style={s.recoPillText}>AI RECOMMENDED</Text>
          </View>
        ) : null}
        <Text style={s.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={s.author} numberOfLines={1}>
          {author}
        </Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { marginBottom: 18 },
  coverWrap: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#0b2a36",
    borderWidth: 1,
    borderColor: "#133f4f",
    padding: 10,
  },
  cover: { width: "100%", height: 240 },
  coverFallback: {
    width: "100%",
    height: 240,
    backgroundColor: "#0b2a36",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  coverFallbackText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  coverFallbackSub: {
    color: "#9ccfe6",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "600",
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#0b2a36",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#134b61",
    alignItems: "center",
  },
  recoPill: {
    backgroundColor: "#22d3ee",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  recoPillText: {
    color: "#02131a",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  aiIcon: {
    marginRight: 6,
  },
  connectorWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  connectorLine: {
    height: 1,
    width: "55%",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#1a6b86",
  },
  connectorDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#134b61",
    borderWidth: 1,
    borderColor: "#1a6b86",
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  author: {
    color: "#9ccfe6",
    fontSize: 13,
    marginTop: 6,
    fontWeight: "600",
    letterSpacing: 0.2,
    textAlign: "center",
  },
});
