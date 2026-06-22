import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;

export const isMissingConfig = !apiKey;

// Fallback so the module loads even without env vars — React will show the error UI
const firebaseConfig = {
  apiKey: apiKey ?? 'missing',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'missing',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'missing',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'missing',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? 'missing',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? 'missing',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
