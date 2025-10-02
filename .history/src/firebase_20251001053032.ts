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
    // Initialize the main app instance
    firebase.initializeApp(firebaseConfig); 
}

// --- Expose Services (FIXED: Moved exports to top-level) ---

// 1. Export Auth: Check if the auth module is available/supported before assigning.
// We assign the module call to the exported variable.
if (auth_module().isSupported) { 
    // This assigns the initialized function call result to a variable visible outside.
    const authInstance = auth_module();
    export { authInstance as auth }; // Use named export for the instance
} else {
    // Fallback or throw error if necessary
    // console.warn("Auth module is not supported in this environment.");
}

// 2. Export Firestore: Check for supported status and assign.
if (firestore_module().isSupported) {
    const firestoreInstance = firestore_module();
    export { firestoreInstance as firestore };
} else {
    // console.warn("Firestore module is not supported in this environment.");
}

// NOTE: A simpler, more common pattern is to just call the functions 
// after initializeApp(), as done in the previous solution. 
// If the functions are called outside a block, they can be exported directly:
/*
export const auth = auth_module();
export const firestore = firestore_module();
*/