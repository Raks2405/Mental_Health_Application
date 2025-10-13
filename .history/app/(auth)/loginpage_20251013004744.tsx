import { LinearGradient } from 'expo-linear-gradient';
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
      {/* glow accent */}
      <LinearGradient
        colors={['rgba(255,255,255,0.36)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 0.2 }}
        style={styles.bgGlow}
      />

      {/* glass card */}
      <View style={styles.formGlass}>
        <Image
          style={styles.image}
          source={require("../../assets/images/image.png")}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="rgba(0,0,0,0.45)"
          value={email}
          onChangeText={setEmail}
          style={styles.inputGlass}
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="rgba(0,0,0,0.45)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.inputGlass}
        />
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        {/* primary button */}
        <Pressable
          onPress={() => { handleSubmit(); console.log(email); }}
          android_ripple={{ color: "rgba(255,255,255,0.2)" }}
          style={({ pressed }) => [
            styles.btnPrimaryGlass,
            pressed && styles.loginBtnPressed,
          ]}
        >
          <Text style={styles.btnPrimaryGlassText}>Login</Text>
        </Pressable>

        <Text style={styles.separator}>—  OR  —</Text>

        {/* secondary button */}
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
          onPress={() =>
            router.replace({ pathname: '/(auth)/signuppage' })
          }
          android_ripple={{ color: "rgba(174, 28, 28, 1)" }}
          style={({ pressed }) => [
            styles.btnLink,
            pressed && styles.loginBtnPressed,
          ]}
        >
          <Text style={styles.btnLinkText}>Don’t have an account? Sign Up</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  </LinearGradient>
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
    backgroundColor: "#005472ff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  loginText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  input: {
    height: 40,
    borderColor: "#ddddddff",
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 3,
  },

  bgGradient: {
    flex: 1,
  },
  centeredKV: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  bgGlow: {
    position: 'absolute',
    top: 60,
    left: -20,
    width: 250,
    height: 170,
    borderRadius: 100,
    opacity: 0.85,
  },

  // GLASS CARD
  formGlass: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  image: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 26,
  },

  // LABELS / ERRORS
  label: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: "800",
    color: '#000',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  errorText: {
    color: "#b91c1c",
    marginTop: -6,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: '600',
  },

  // GLASS INPUTS
  inputGlass: {
    height: 44,
    borderColor: 'rgba(0,0,0,0.15)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    color: '#000',
    fontSize: 14,
  },

  // BUTTONS
  btnPrimaryGlass: {
    backgroundColor: 'rgba(16, 185, 129, 0.98)', // emerald
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  btnPrimaryGlassText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  btnSecondaryGlass: {
    backgroundColor: 'rgba(37, 99, 235, 0.98)', // blue
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  btnSecondaryGlassText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  btnLink: {
    marginTop: 15,
    backgroundColor: 'transparent',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnLinkText: {
    color: '#0ea5aaff', // teal accent
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  loginBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },

  separator: {
    textAlign: "center",
    justifyContent: "center",
    marginVertical: 18,
    color: 'rgba(0,0,0,0.65)',
    fontWeight: '700',
    letterSpacing: 1,
  },
});
