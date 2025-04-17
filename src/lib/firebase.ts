
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // IMPORTANT: Replace these values with your actual Firebase config values
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcd1234",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ABCD1234"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Helper functions to debug Firebase connection
const isEmulator = window.location.hostname === "localhost";

// Display connection status in development mode
if (import.meta.env.DEV) {
  console.log("Firebase initialized with config:", 
    Object.keys(firebaseConfig).reduce((acc, key) => {
      // Mask actual values but show which keys are set
      acc[key] = firebaseConfig[key] ? "[SET]" : "[NOT SET]";
      return acc;
    }, {} as Record<string, string>)
  );
  
  if (isEmulator) {
    console.log("Running in local environment. Using Firebase emulators if configured.");
    // Uncomment these lines to use Firebase emulators
    // connectAuthEmulator(auth, "http://localhost:9099");
    // connectFirestoreEmulator(firestore, "localhost", 8080);
    // connectStorageEmulator(storage, "localhost", 9199);
  }
}

// Create a simple test function to check if Firebase is working
export const testFirebaseConnection = async () => {
  try {
    const testCollection = collection(firestore, "_connection_test_");
    await addDoc(testCollection, { timestamp: new Date() });
    console.log("✅ Firebase connection successful!");
    return true;
  } catch (error) {
    console.error("❌ Firebase connection failed:", error);
    return false;
  }
};

// Missing imports for the test function
import { collection, addDoc } from "firebase/firestore";
