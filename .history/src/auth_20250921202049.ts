import { auth } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  User,
} from "firebase/auth";

export const signUp = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signInGuest = () => signInAnonymously(auth); // enable Anonymous in Firebase console if you use this

export const logOut = () => signOut(auth);

export const subscribeToAuth = (cb: (user: User | null) => void) =>
  onAuthStateChanged(auth, cb);
