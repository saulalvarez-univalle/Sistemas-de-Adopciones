import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCOsu67-4BO7HbRh2rjeSLUgbiafP6ChYI",
  authDomain: "sistema-de-adopciones-e8cf4.firebaseapp.com",
  projectId: "sistema-de-adopciones-e8cf4",
  storageBucket: "sistema-de-adopciones-e8cf4.firebasestorage.app",
  messagingSenderId: "401599702322",
  appId: "1:401599702322:web:14f3fa61c5ff03a479e32b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);