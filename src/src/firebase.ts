// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDEGiY5Lse1PfKmL9PUxwIHHiwUlquTT_E",
  authDomain: "affinitycrm-95a76.firebaseapp.com",
  projectId: "affinitycrm-95a76",
  storageBucket: "affinitycrm-95a76.firebasestorage.app",
  messagingSenderId: "622048574238",
  appId: "1:622048574238:web:daf5958f1033a5394f670f",
  measurementId: "G-FV7JN8K2FY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

