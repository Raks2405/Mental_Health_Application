import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Chats() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Chat Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(215, 228, 226, 0.96)", // ← same as Profile
  },
  text: { color: "#111", fontSize: 16 },
});
