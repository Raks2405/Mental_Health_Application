import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';

// --- Your Configuration Details ---
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
// FIX: Use RNFB's check and initialization
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig); 
}

// --- Expose Services ---
export const firestore = firebase.firestore();
export const auth = firebase.auth(); // Exported for use in auth.ts