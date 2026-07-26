import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBriF9jeIhAS7bOjP4h4kfcNuVee6Yc6kQ",
  authDomain: "sri-krishna-dhaba-e1010.firebaseapp.com",
  projectId: "sri-krishna-dhaba-e1010",
  storageBucket: "sri-krishna-dhaba-e1010.firebasestorage.app",
  messagingSenderId: "369854906329",
  appId: "1:369854906329:web:31e4c89d5b3b8a576be3c8",
  measurementId: "G-Y10BQ3F07L"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
