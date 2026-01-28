import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View
} from "react-native";
import { FirebaseError } from "firebase/app";
import { authService } from "../services/auth.service";
import { authStyles as styles } from "../styles/auth.styles";
import { LinearGradient } from "expo-linear-gradient";

export default function SignupScreen() {
  const router = useRouter();
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (newPassword.length < 6) {
      alert('Password should be at least 6 characters long');
      return;
    } else if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      await authService.signUp(newEmail.trim(), newPassword);
      alert('User registered successfully');
      setNewEmail('');
      setNewPassword('');
      setConfirmPassword('');
      router.replace({ pathname: '/(auth)/loginpage' });
    } catch (err) {
      const code = (err as FirebaseError)?.code;
      if (code === 'auth/email-already-in-use') {
        alert('User already exists with this mail id');
      } else {
        alert('Registration failed');
      }
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

        <View style={styles.formGlass}>
          <Image
            style={styles.image}
            source={require("@/assets/images/image.png")}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="rgba(0,0,0,0.45)"
            value={newEmail}
            onChangeText={setNewEmail}
            style={styles.inputGlass}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="rgba(0,0,0,0.45)"
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.inputGlass}
            secureTextEntry
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            placeholder="Confirm your password"
            placeholderTextColor="rgba(0,0,0,0.45)"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.inputGlass}
            secureTextEntry
          />

          <Pressable
            onPress={handleSignUp}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            style={({ pressed }) => [
              styles.btnPrimaryGlass,
              pressed && styles.loginBtnPressed,
            ]}
          >
            <Text style={styles.btnPrimaryGlassText}>Submit</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push({ pathname: '/(auth)/loginpage' })}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            style={({ pressed }) => [
              styles.btnSecondaryGlass,
              { marginTop: 14 },
              pressed && styles.loginBtnPressed,
            ]}
          >
            <Text style={styles.btnSecondaryGlassText}>Back to Login Page</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
