// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "REMOVED_API_KEY",
  authDomain: "swipeitgame.firebaseapp.com",
  projectId: "swipeitgame",
  storageBucket: "swipeitgame.appspot.com",
  messagingSenderId: "1032537765241",
  appId: "1:1032537765241:web:1e37b7978498cefa842ba8",
  measurementId: "G-NFZ34GGF8K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };