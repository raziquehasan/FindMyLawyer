import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "findmylawyer-15c0b.firebaseapp.com",
  projectId: "findmylawyer-15c0b",
  storageBucket: "findmylawyer-15c0b.firebasestorage.app",
  messagingSenderId: "567921185146",
  appId: "1:567921185146:web:f67b1e4038898e41e046c3",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });