import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBNFCS1ivwPhOJqxAcUKvCBT5Lm6y-mL2U",
  authDomain: "real-time-chat-b7bae.firebaseapp.com",
  projectId: "real-time-chat-b7bae",
  storageBucket: "real-time-chat-b7bae.firebasestorage.app",
  messagingSenderId: "402124716625",
  appId: "1:402124716625:web:41c915e0076ab7e5d05670",
  measurementId: "G-QN98Q2VTZV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
