import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { isUsingEmulators, getEmulatorHost } from "@/utils/firebase-utils";

// Your web app's Firebase configuration
// Values should be provided using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Connect to emulators when detected
if (isUsingEmulators()) {
  // Auth emulator
  connectAuthEmulator(auth, getEmulatorHost('auth'), { disableWarnings: true });
  
  // Firestore emulator - parse URL to get host and port
  const firestoreUrl = new URL(getEmulatorHost('firestore'));
  connectFirestoreEmulator(firestore, firestoreUrl.hostname, parseInt(firestoreUrl.port));
  
  // Storage emulator - parse URL to get host and port
  const storageUrl = new URL(getEmulatorHost('storage'));
  connectStorageEmulator(storage, storageUrl.hostname, parseInt(storageUrl.port));

  console.log("%cUsing Firebase Emulators", "color: red;");
}
