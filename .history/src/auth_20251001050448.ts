import { auth } from "./firebase"; // Import RNFB Auth instance
import authNative from '@react-native-firebase/auth';
import { User } from '@react-native-firebase/auth'; // Import RNFB User type

// NOTE: RNFB methods are slightly different and are accessed directly from the auth instance.

export const signUp = (email: string, password: string) =>
  authNative().createUserWithEmailAndPassword(email, password);

export const signIn = (email: string, password: string) =>
  authNative().signInWithEmailAndPassword(email, password);

export const signInGuest = () => authNative().signInAnonymously();

export const logOut = () => authNative().signOut();

export const subscribeToAuth = (cb: (user: User | null) => void) =>
  authNative().onAuthStateChanged(cb);

// The original 'auth' import from './firebase' is not strictly needed for these functions,
// but ensures the Firebase module is loaded. We use authNative() (the exposed function) for calls.