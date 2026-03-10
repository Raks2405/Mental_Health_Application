import { Link, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import VideoCard from "../components/VideoCard";
import { VIDEO_CATEGORIES } from "../data/resources";
import { useRecommendation } from "../context/RecommendationContext";

export default function VideosScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const { category: recommendedCategory, status, message } = useRecommendation();
  const categoryKey =
    typeof params.category === "string" && VIDEO_CATEGORIES[params.category]
      ? params.category
      : recommendedCategory;

  const allVideos = useMemo(() => {
    const unique = new Map<string, (typeof VIDEO_CATEGORIES)[string]["videos"][number]>();
    Object.values(VIDEO_CATEGORIES).forEach((category) => {
      category.videos.forEach((video) => {
        if (!unique.has(video.videoId)) {
          unique.set(video.videoId, video);
        }
      });
    });
    return Array.from(unique.values());
  }, []);

  const showUnavailable = status === "unmatched" && !params.category;
  const categoryLabel = showUnavailable
    ? "No matching category"
    : categoryKey
    ? VIDEO_CATEGORIES[categoryKey].label
    : "All resources";
  const videos = categoryKey ? VIDEO_CATEGORIES[categoryKey].videos : allVideos;

  return (
    <View style={s.container}>
      <View style={s.row}>
        <Link href="/(tabs)/home/books" asChild>
          <Pressable style={s.cell}>
            <Text style={{ color: "white" }}>Books</Text>
          </Pressable>
        </Link>

        <Link href="/(tabs)/home/articles" asChild>
          <Pressable style={s.cell}>
            <Text style={{ color: "white" }}>Articles</Text>
          </Pressable>
        </Link>

        <Text style={[s.cell, s.active]}>Videos</Text>
      </View>

      <ScrollView contentContainerStyle={s.body}>
        <Text style={s.categoryLabel}>{categoryLabel}</Text>
        {showUnavailable ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyTitle}>We don't have the category you are looking for.</Text>
            <Text style={s.emptyText}>{message ?? "We are working on it."}</Text>
          </View>
        ) : (
          videos.map((video) => (
            <VideoCard
              key={`${video.videoId}-${video.title}`}
              videoId={video.videoId}
              title={video.title}
              channel={video.channel}
              duration={video.duration}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  row: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 15,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
    margin: 3,
    backgroundColor: "#002532ff",
    color: "white",
    textAlign: "center",
    textAlignVertical: "center",
  },
  active: {
    fontWeight: "900",
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
  body: {
    padding: 16,
    gap: 12,
  },
  categoryLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  emptyCard: {
    backgroundColor: "#0b2a36",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#134b61",
  },
  emptyTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptyText: {
    color: "#9ccfe6",
    fontSize: 13,
    lineHeight: 18,
  },
});
