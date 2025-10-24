import React from "react";
import { View, Text } from "react-native";
import LottieView from "lottie-react-native";
import lock from "@/assets/animations/locked_icon.json";
import { styles } from "../styles/sessions.styles";

export default function GuestLockScreen() {
  return (
    <View style={styles.centeredTransparent}>
      <LottieView source={lock} autoPlay style={{ width: 280, height: 280 }} />
      <Text style={styles.text}>Please login to access Sessions</Text>
    </View>
  );
}
