import React from "react";
import { Pressable, Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { styles } from "../styles/profile.styles";

type Props = {
  email: string;
  isAdmin: boolean;
  isGuest: boolean;
  onLogout: () => void;
  onChangePwd: () => void;
};

export default function ProfileCard({ email, isAdmin, isGuest, onLogout, onChangePwd }: Props) {
  return (
    <View style={styles.cardGlass}>
      <View style={styles.name_iconContainer}>
        <FontAwesome style={styles.userIcon} name="user-circle" size={100} color={"#1f2937"} />
        <Text style={styles.name}>
          {email} {isAdmin ? "(Admin)" : ""}
        </Text>
      </View>

      <View style={styles.subCardGlass}>
        <Pressable
          style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}
          onPress={onLogout}
        >
          <FontAwesome name="sign-out" size={22} color="#111827" style={{ marginRight: 10 }} />
          <Text style={styles.actionText}>Logout</Text>
        </Pressable>
      </View>

      <View style={[styles.subCardGlass, isGuest && { opacity: 0.6 }]}>
        <Pressable
          disabled={isGuest}
          style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}
          onPress={onChangePwd}
        >
          <FontAwesome name="lock" size={22} color="#111827" style={{ marginRight: 10 }} />
          <Text style={styles.actionText}>Change Password</Text>
        </Pressable>
      </View>
    </View>
  );
}
