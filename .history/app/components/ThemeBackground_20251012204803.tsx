import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function ThemeBackground({ children, style }: ViewProps) {
  return (
    <View style={[styles.fill, style]}>
      <LinearGradient
        colors={["#0b2941", "#0d3f55", "#003d53"]} // same vibe as entry page theme
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
