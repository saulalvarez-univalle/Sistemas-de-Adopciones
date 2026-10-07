import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Los valores por defecto permiten que el proyecto funcione al clonarlo,
// sin tener que crear un archivo .env. Si existe un .env local, sus valores
// tienen prioridad.
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyCOsu67-4BO7HbRh2rjeSLUgbiafP6ChYI",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "sistema-de-adopciones-e8cf4.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    "sistema-de-adopciones-e8cf4",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "sistema-de-adopciones-e8cf4.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "401599702322",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:401599702322:web:14f3fa61c5ff03a479e32b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
