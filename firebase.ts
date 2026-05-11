import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBGT6XDtbw5KnwbFq8wJMetsUGmqpfhSQE",
  authDomain: "fitness-app-d1691.firebaseapp.com",
  projectId: "fitness-app-d1691",
  storageBucket: "fitness-app-d1691.firebasestorage.app",
  messagingSenderId: "396122415971",
  appId: "1:396122415971:web:2b94356eecac9d8a6b6956",
  measurementId: "G-YEVC691RJ0",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
