import { initializeApp, getApps, getApp,  } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth/react-native";

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

// IMPORTANT: Do NOT call getAuth(app) on native before this.
// Create the RN Auth instance with AsyncStorage persistence:
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});