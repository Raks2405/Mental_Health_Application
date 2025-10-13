import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { FirebaseError } from 'firebase/app';
import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { signUp } from '../../src/auth';

export default function SignUpPage() {
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
    } else if ((RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(newEmail) === false) || newEmail.length === 0) {
      alert('Please enter a valid email address');
      return;
    } else {
      try {
        await signUp(newEmail.trim(), newPassword);
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

          {/* Submit */}
          <Pressable
            onPress={handleSignUp}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            style={({ pressed }) => [
              styles.btnPrimaryGlass,
              pressed && styles.btnPressed,
            ]}
          >
            <Text style={styles.btnPrimaryGlassText}>Submit</Text>
          </Pressable>

          {/* Back to Login */}
          <Pressable
            onPress={() => router.push({ pathname: '/(auth)/loginpage' })}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            style={({ pressed }) => [
              styles.btnSecondaryGlass,
              { marginTop: 14 },
              pressed && styles.btnPressed,
            ]}
          >
            <Text style={styles.btnSecondaryGlassText}>Back to Login Page</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // gradient background
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

  // glass card
  formGlass: {
    backgroundColor: 'rgba(242, 242, 242, 0.72)',
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

  // labels
  label: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: "800",
    color: '#000',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  // inputs
  inputGlass: {
    height: 44,
    borderColor: 'rgba(0,0,0,0.15)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    color: '#000',
    fontSize: 14,
  },

  // buttons
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

  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
});
