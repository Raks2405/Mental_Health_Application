import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { useRouter } from "expo-router";
import { signIn, signInGuest } from "../../src/auth";
import { auth } from "../../src/firebase";


import { useUser } from "@/src/UserContext";
import React, { useState } from "react";

export const adminEmails = ["admin@uco.edu", "admin2@uco.edu"];

export default function LoginPage() {
  const router = useRouter();

  const { setUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});



  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      await signIn(email.trim(), password);
      const resolvedEmail = (auth.currentUser?.email ?? email).trim();
      const isAdmin = adminEmails.includes(resolvedEmail);
      //get which admin is logging in

      setUser({
        email: isAdmin ? 'Admin' : resolvedEmail,
      });
      router.replace('/(tabs)/home/books')
    } catch (err: any) {
      Alert.alert("Login failed", 'Invalid email or password.');
      setEmail("");
      setPassword("");
    }
  };

  const handleGuest = async () => {
    try {
      await signInGuest();
      setUser({ email: 'Guest' });
      router.replace('/(tabs)/home/books');
    } catch (err: any) {
      Alert.alert("Guest login failed", 'Unexpected error occurred. Please try again.');
    }
  };

  const validateForm = () => {
    let errors: { email?: string; password?: string } = {};
    if (!email) errors.email = "Email required";
    if (!password) errors.password = "Password required";
    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.form}>
        <Image
          style={styles.image}
          source={require("../../assets/images/image.png")}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        {
          errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null
        }

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        {
          errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null
        }

        <Pressable
          onPress={() => { handleSubmit(); console.log(email); }}
          android_ripple={{ color: "rgba(255,255,255,0.2)" }}   // Android ripple
          style={({ pressed }) => [
            styles.loginBtn,
            pressed && styles.loginBtnPressed,                   // iOS/Android feedback
          ]}
        >
          <Text style={styles.loginText}>Login</Text>
        </Pressable>

        <Text style={{ textAlign: "center", justifyContent: "center", margin: 20 }}>----------- OR -----------</Text>

        <Pressable
          onPress={handleGuest}
          android_ripple={{ color: "rgba(255,255,255,0.2)" }}   // Android ripple
          style={({ pressed }) => [
            styles.loginBtn,
            pressed && styles.loginBtnPressed,                   // iOS/Android feedback
          ]}
        >
          <Text style={styles.loginText}>Login as Guest</Text>
        </Pressable>


        <Pressable
          onPress={() =>
            router.replace({
              pathname: '/(auth)/signuppage'
            })
          }
          android_ripple={{ color: "rgba(174, 28, 28, 1)" }}   // Android ripple
          style={({ pressed }) => [
            styles.loginBtn,
            pressed && styles.loginBtnPressed,
            { margin: 15 }                  // iOS/Android feedback
          ]}
        >
          <Text style={styles.loginText}>Dont have an account? Sign Up</Text>
        </Pressable>



      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#003d53ff",
  },
  form: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  loginBtn: {
    backgroundColor: "#003d53ff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  loginBtnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  loginText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  image: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 30,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },

  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 3,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
});
