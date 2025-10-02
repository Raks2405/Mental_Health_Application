import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';

// --- Your Configuration Details (Used as a safeguard) ---
// NOTE: These fields should match what's in your GoogleService-Info.plist/google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyBpydVPi0O0Xn28Fh87b6Dx9vantx7x7i4",
  authDomain: "mental-health-app-49ba8.firebaseapp.com",
  projectId: "mental-health-app-49ba8",
  storageBucket: "mental-health-app-49ba8.appspot.com",
  messagingSenderId: "67971626781",
  appId: "1:67971626781:web:d04aed222283f87efa93f4",
  measurementId: "G-DK6DB61FQP",
};

// --- Core Initialization for RNFB ---
// FIX: Ensure the app is initialized only once using the RNFB core module.
if (!firebase.apps.length) {
    // This activates the native modules (RNFB) needed for Firestore and Auth.
    firebase.initializeApp(firebaseConfig); 
}

// --- Expose Services ---

// 1. Export the RNFB Firestore service (Used by your controllers)
export const firestore = firebase.firestore();

// 2. Export the RNFB Auth service 
export const auth = firebase.auth();