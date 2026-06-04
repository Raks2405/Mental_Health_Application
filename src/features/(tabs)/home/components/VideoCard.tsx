import React from "react";
import { Image, Pressable, StyleSheet, Text, View, Linking } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

type Props = {
  videoId: string;
  title: string;
  channel?: string;
  duration?: string;
  recommended?: boolean;
};

export default function VideoCard({ videoId, title, channel, duration, recommended }: Props) {
  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const webUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const appUrl = `vnd.youtube://${videoId}`;

  const openVideo = async () => {
    const canOpenApp = await Linking.canOpenURL(appUrl);
    Linking.openURL(canOpenApp ? appUrl : webUrl);
  };

  return (
    <Pressable style={s.card} onPress={openVideo}>
      <View style={s.thumbWrap}>
        <Image source={{ uri: thumbnail }} style={s.thumb} />
        {duration && (
          <View style={s.duration}>
            <Text style={s.durationText}>{duration}</Text>
          </View>
        )}
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
        {channel && <Text style={s.sub}>{channel}</Text>}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { marginBottom: 18 },
  thumbWrap: { borderRadius: 14, overflow: "hidden", backgroundColor: "#111" },
  thumb: { width: "100%", height: 200 },
  duration: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: { color: "white", fontSize: 12, fontWeight: "700" },
  infoCard: {
    backgroundColor: "#0b2a36",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#134b61",
    marginTop: 10,
  },
  recoPill: {
    alignSelf: "flex-start",
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
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  sub: {
    color: "#9ccfe6",
    fontSize: 13,
    marginTop: 6,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
