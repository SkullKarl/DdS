// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBu5j3izIQDglHom9OyBWevWfG5Y_2NxWc",
  authDomain: "softwaredesign-9025c.firebaseapp.com",
  projectId: "softwaredesign-9025c",
  storageBucket: "softwaredesign-9025c.firebasestorage.app",
  messagingSenderId: "780784228827",
  appId: "1:780784228827:web:32e240ea3254265d5b2ffe"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;