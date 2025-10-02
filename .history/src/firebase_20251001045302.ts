import { initializeApp, getApps, getApp } from "@react-native-firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';


import AsyncStorage from "@react-native-async-storage/async-storage";

// --- your config ---
const firebaseConfig = {
  apiKey: "AIzaSyBpydVPi0O0Xn28Fh87b6Dx9vantx7x7i4",
  authDomain: "mental-health-app-49ba8.firebaseapp.com",
  projectId: "mental-health-app-49ba8",
  storageBucket: "mental-health-app-49ba8.appspot.com",
  messagingSenderId: "67971626781",
  appId: "1:67971626781:web:d04aed222283f87efa93f4",
  measurementId: "G-DK6DB61FQP",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Try to use RN persistence if available; otherwise fall back (works in Expo Go)
type GetRNP = (storage: any) => any;
let getRNP: GetRNP | undefined;
try { getRNP = require("firebase/auth/react-native").getReactNativePersistence; } catch {}
if (!getRNP) {
  try { getRNP = require("firebase/auth").getReactNativePersistence; } catch {}
}

let existingAuth;
try { existingAuth = getAuth(app); } catch {}

export const auth =
  existingAuth ??
  initializeAuth(app, getRNP ? { persistence: getRNP(AsyncStorage) } : {});
