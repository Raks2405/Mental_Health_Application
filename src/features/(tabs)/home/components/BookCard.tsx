import React, { useState } from "react";
import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  author: string;
  isbn13: string;
};

export default function BookCard({ title, author, isbn13 }: Props) {
  const [coverError, setCoverError] = useState(false);
  const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg?default=false`;
  const openUrl = `https://openlibrary.org/isbn/${isbn13}`;

  const openBook = () => {
    Linking.openURL(openUrl);
  };

  return (
    <Pressable style={s.card} onPress={openBook} accessibilityRole="button">
      <View style={s.coverWrap}>
        {!coverError ? (
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
