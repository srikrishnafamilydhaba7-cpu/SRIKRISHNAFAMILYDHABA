import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBriF9jeIhAS7bOjP4h4kfcNuVee6Yc6kQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sri-krishna-dhaba-e1010.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sri-krishna-dhaba-e1010",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sri-krishna-dhaba-e1010.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "369854906329",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:369854906329:web:31e4c89d5b3b8a576be3c8",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-Y10BQ3F07L"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
