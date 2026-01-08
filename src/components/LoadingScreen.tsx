import GradientView from "@/src/shared/GradientView";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <GradientView
      colors={['#2372a7ff', '#168895ff', '#032527ff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#22d3ee" />
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.subtitle}>Please wait while we prepare your experience</Text>
      </View>
    </GradientView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  message: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginTop: 4,
  },
});

