import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCpeiQV_CuObk10y1fEmBLqVMduImYwXqM",
  authDomain: "sri-krishna-dhaba.firebaseapp.com",
  projectId: "sri-krishna-dhaba",
  storageBucket: "sri-krishna-dhaba.firebasestorage.app",
  messagingSenderId: "137293256337",
  appId: "1:137293256337:web:b5c0d85dc55efdec3e9130",
  measurementId: "G-1R36T1LPX2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
