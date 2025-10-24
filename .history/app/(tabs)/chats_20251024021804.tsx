import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ThemeBackground from "../../src/shared/ThemeBackground";

export default function Chats() {
  return (
    <ThemeBackground>
      <View style={styles.center}>
        <Text style={styles.text}>Chat Screen</Text>
      </View>
    </ThemeBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  text: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
