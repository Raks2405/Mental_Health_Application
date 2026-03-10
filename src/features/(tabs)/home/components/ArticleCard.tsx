import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  source: string;
  url: string;
};

export default function ArticleCard({ title, source, url }: Props) {
  const openArticle = () => {
    Linking.openURL(url);
  };

  return (
    <Pressable style={s.card} onPress={openArticle} accessibilityRole="button">
      <View style={s.corner} />
      <View style={s.accentBar} />
      <View style={s.metaRow}>
        <View style={s.pill}>
          <Text style={s.pillText}>{source}</Text>
        </View>
        <View style={s.readPill}>
          <Text style={s.readPillText}>READ</Text>
        </View>
      </View>

      <Text style={s.title} numberOfLines={3}>
        {title}
      </Text>
      <View style={s.divider} />
      <Text style={s.cta}>Tap to read</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: "#0b2a36",
    padding: 14,
    paddingLeft: 18,
    borderWidth: 1,
    borderColor: "#134b61",
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#22d3ee",
  },
  corner: {
    position: "absolute",
    right: -12,
    top: -12,
    width: 24,
    height: 24,
    backgroundColor: "#134b61",
    transform: [{ rotate: "45deg" }],
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pill: {
    backgroundColor: "#0f3a4c",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#1a6b86",
  },
  readPill: {
    backgroundColor: "#0b2a36",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#1a6b86",
  },
  readPillText: {
    color: "#22d3ee",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  pillText: {
    color: "#b6e1ff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#134b61",
    marginTop: 10,
  },
  cta: {
    color: "#9ccfe6",
    fontSize: 12,
    marginTop: 8,
    fontWeight: "600",
  },
});
