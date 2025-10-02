import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';

// --- Your Configuration Details (FIXED) ---
const firebaseConfig = {
  apiKey: "AIzaSyBpydVPi0O0Xn28Fh87b6Dx9vantx7x7i4",
  authDomain: "mental-health-app-49ba8.firebaseapp.com",
  projectId: "mental-health-app-49ba8",
  storageBucket: "mental-health-app-49ba8.appspot.com",
  messagingSenderId: "67971626781",
  appId: "1:67971626781:web:d04aed222283f87efa93f4",
  measurementId: "G-DK6DB61FQP",
  
  // FIX: Added the required databaseURL property
  databaseURL: "https://mental-health-app-49ba8-default-rtdb.firebaseio.com", 
};

// --- Core Initialization for RNFB ---
if (!firebase.apps.length) {
    // This should now succeed with the complete config object.
    firebase.initializeApp(firebaseConfig); 
}

// --- Expose Services ---
export const firestore = firebase.firestore();
export const auth = firebase.auth();