import firebase from '@react-native-firebase/app';
import auth_module from '@react-native-firebase/auth'; // Import the auth module
import firestore_module from '@react-native-firebase/firestore'; // Import the firestore module


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
    firebase.initializeApp(firebaseConfig); 
}

// --- Expose Services (FIXED: Unconditional Top-Level Exports) ---

// We export the results of the module calls directly. 
// These calls rely on firebase.initializeApp() running successfully above.
export const auth = auth_module(); 
export const firestore = firestore_module(); 