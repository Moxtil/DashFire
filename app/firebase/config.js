// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBuff2wvYfxfQqYeaSf-2S6vp5xGhu6kkY",
  authDomain: "facebook-64c62.firebaseapp.com",
  projectId: "facebook-64c62",
  storageBucket: "facebook-64c62.firebasestorage.app",
  messagingSenderId: "244547980518",
  appId: "1:244547980518:web:cc287bf1fa14d9a0fcbf27",
  measurementId: "G-3N3NHZ4F2H",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
