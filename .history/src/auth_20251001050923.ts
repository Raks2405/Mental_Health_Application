import { auth } from "./firebase";
import authNative, { FirebaseAuthTypes } from '@react-native-firebase/auth'; // Import RNFB types and functions

// Note: You must remove all imports from 'firebase/auth' if they were causing conflict
// The RNFB SDK uses FirebaseAuthTypes.User for its User object.

export const signUp = (email: string, password: string) =>
  authNative().createUserWithEmailAndPassword(email, password);

export const signIn = (email: string, password: string) =>
  authNative().signInWithEmailAndPassword(email, password);

export const signInGuest = () => authNative().signInAnonymously();

export const logOut = () => authNative().signOut();

// FIX: Use the correct RNFB type for the callback function
export const subscribeToAuth = (cb: (user: FirebaseAuthTypes.User | null) => void) =>
  authNative().onAuthStateChanged(cb);