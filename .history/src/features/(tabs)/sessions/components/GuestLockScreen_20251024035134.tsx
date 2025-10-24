import React from "react";
import { View, Text, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

// NOTE: adjust this require path if your assets live elsewhere
// This mirrors your original usage.
const lockAnim = require("../../../../../assets/animations/locked_icon.json");

export default function GuestLockScreen() {
  return (
    <View style={s.centeredTransparent}>
      <LottieView source={lockAnim} autoPlay style={{ width: 280, height: 280 }} />
      <Text style={s.text}>Please login to access Sessions</Text>
    </View>
  );
}

const s = StyleSheet.create({
  centeredTransparent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  text: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffffff",
  },
});
