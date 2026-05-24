import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ─────────────────────────────────────────────────────────────────────────────
// TODO: Replace these values with your Firebase project config.
// Get them from: Firebase Console → Project Settings → Your Apps → SDK setup
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "TODO_API_KEY",
  authDomain:        "TODO_PROJECT_ID.firebaseapp.com",
  projectId:         "TODO_PROJECT_ID",
  storageBucket:     "TODO_PROJECT_ID.appspot.com",
  messagingSenderId: "TODO_SENDER_ID",
  appId:             "TODO_APP_ID",
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
