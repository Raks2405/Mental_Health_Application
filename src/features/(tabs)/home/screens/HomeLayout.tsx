import ThemeBackground from "@/src/shared/ThemeBackground";
import { Slot } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function HomeLayout() {
  return (
    <ThemeBackground>
      <View style={styles.container}>
        <Slot />
      </View>
    </ThemeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
});
