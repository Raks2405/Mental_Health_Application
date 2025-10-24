import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@/src/UserContext";
import { authService } from "../services/auth.service";
import { auth } from "@/src/firebase";
import { authStyles as styles } from "../styles/auth.styles";

export const adminEmails = ["admin@uco.edu", "admin2@uco.edu"]; //HARD CODED ADMIN EMAILS

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    let errs: { email?: string; password?: string } = {};
    if (!email) errs.email = "Email required";
    if (!password) errs.password = "Password required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      await authService.signIn(email.trim(), password);
      const resolvedEmail = (auth.currentUser?.email ?? email).trim();
      const isAdmin = adminEmails.includes(resolvedEmail);
      setUser({
        email: isAdmin ? 'Admin' : resolvedEmail,
      });
      router.replace('/(tabs)/home/books');
    } catch (err) {
      Alert.alert("Login failed", "Invalid email or password.");
      setEmail("");
      setPassword("");
    }
  };

  const handleGuest = async () => {
    try {
      await authService.signInGuest();
      setUser({ email: 'Guest' });
      router.replace('/(tabs)/home/books');
    } catch (err) {
      Alert.alert("Guest login failed", "Unexpected error occurred.");
    }
  };

  return (
    <LinearGradient
      colors={['#2372a7ff', '#168895ff', '#032527ff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.bgGradient}
    >
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        style={styles.centeredKV}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.36)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 0.2 }}
          style={styles.bgGlow}
        />

        <View style={styles.formGlass}>
          <Image
            style={styles.image}
            source={require("@/assets/images/image.png")}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="rgba(0,0,0,0.45)"
            value={email}
            onChangeText={setEmail}
            style={styles.inputGlass}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="rgba(0,0,0,0.45)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.inputGlass}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <Pressable
            onPress={handleSubmit}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            style={({ pressed }) => [
              styles.btnPrimaryGlass,
              pressed && styles.loginBtnPressed,
            ]}
          >
            <Text style={styles.btnPrimaryGlassText}>Login</Text>
          </Pressable>

          <Text style={styles.separator}>— OR —</Text>

          <Pressable
            onPress={handleGuest}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            style={({ pressed }) => [
              styles.btnSecondaryGlass,
              pressed && styles.loginBtnPressed,
            ]}
          >
            <Text style={styles.btnSecondaryGlassText}>Login as Guest</Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace({ pathname: '/(auth)/signuppage' })}
            android_ripple={{ color: "rgba(174, 28, 28, 1)" }}
            style={({ pressed }) => [
              styles.btnLink,
              pressed && styles.loginBtnPressed,
            ]}
          >
            <Text style={styles.btnLinkText}>
              Don’t have an account? Sign Up
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
