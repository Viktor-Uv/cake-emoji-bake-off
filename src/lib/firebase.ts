
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For demo purposes, we'll use a mock config. In a real app, you'd use real config values.
const firebaseConfig = {
  apiKey: "AIzaSyAurME5Ue2NrYnogKGdzp2iKWY6graFqIw",
  authDomain: "cake-off.firebaseapp.com",
  projectId: "cake-off",
  storageBucket: "cake-off.firebasestorage.app",
  messagingSenderId: "97609739783",
  appId: "1:97609739783:web:320ed939547c9de44384a2",
  measurementId: "G-VMHEH0QS6G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// In real implementation, replace with your actual Firebase config
// and implement proper error handling for authentication
console.log("Note: This is using mock Firebase configuration for demonstration purposes.");
