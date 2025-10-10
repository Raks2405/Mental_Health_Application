import { useRouter } from 'expo-router';
import { FirebaseError } from 'firebase/app';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
        }else if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        } else if ((RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(newEmail) === false) || newEmail.length === 0) {
            alert('Please enter a valid email address');
            return;
        }
        else {
            try {
                await signUp(newEmail.trim(), newPassword);
                alert('User registered successfully');
                setNewEmail('');
                setNewPassword('');
                setConfirmPassword('');
                router.replace({
                    pathname: '/(auth)/loginpage',
                })
            } catch (err) {
                const code = (err as FirebaseError)?.code;
                if (code === 'auth/email-already-in-use') {
                    alert('User already exists with this mail id');
                } else {
                    alert('Registration failed');
                }
            }
        }
    }

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
                <Text>Email</Text>
                <TextInput
                    placeholder='Enter your Email'
                    value={newEmail}
                    onChangeText={setNewEmail}
                    style={styles.input}

                />
                <Text>Password</Text>
                <TextInput
                    placeholder='Enter your Password'
                    value={newPassword}
                    onChangeText={setNewPassword}
                    style={styles.input}
                />

                <Text>Confirm Password</Text>
                <TextInput
                    placeholder='Confirm your Password'
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={styles.input}
                />
                <Pressable
                    onPress={handleSignUp}
                    android_ripple={{ color: "rgba(255,255,255,0.2)" }}   // Android ripple
                    style={({ pressed }) => [
                        styles.loginBtn,
                        pressed && styles.loginBtnPressed,                   // iOS/Android feedback
                    ]}
                >
                    <Text style={styles.loginText}>Submit</Text>

                </Pressable>

                 <Pressable
                    onPress={() => 
                        router.push({
                            pathname: '/(auth)/loginpage',
                        })
                    }
                    android_ripple={{ color: "rgba(5, 239, 55, 0.2)" }}   // Android ripple
                    style={({ pressed }) => [
                        styles.loginBtn,
                        pressed && styles.loginBtnPressed, 
                        {margin: 15}                  // iOS/Android feedback
                    ]}
                >
                    <Text style={styles.loginText}>Back to Login Page</Text>

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

    input: {
        height: 40,
        borderColor: "#ddd",
        borderWidth: 1,
        marginBottom: 15,
        padding: 10,
        borderRadius: 3,
    },

    loginText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },

    loginBtn: {
        backgroundColor: "#005472ff",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    loginBtnPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },

    image: {
        width: 100,
        height: 100,
        alignSelf: "center",
        marginBottom: 30,
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
})
