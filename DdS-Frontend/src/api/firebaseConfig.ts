import {
  REACT_APP_FIREBASE_API_KEY,
  REACT_APP_FIREBASE_APP_ID,
  REACT_APP_FIREBASE_AUTH_DOMAIN,
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  REACT_APP_FIREBASE_PROJECT_ID,
  REACT_APP_FIREBASE_STORAGE_BUCKET
} from '@env';
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyBu5j3izIQDglHom9OyBWevWfG5Y_2NxWc",
  authDomain: "softwaredesign-9025c.firebaseapp.com",
  projectId: "softwaredesign-9025c",
  storageBucket: "softwaredesign-9025c.firebasestorage.app",
  messagingSenderId: "780784228827",
  appId: "1:780784228827:web:32e240ea3254265d5b2ffe"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
