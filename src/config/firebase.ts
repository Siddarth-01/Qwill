// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBeBbUuMDgAe-3IG4RKKbZfe78GyZ2bJOQ",
  authDomain: "twill-5656.firebaseapp.com",
  projectId: "twill-5656",
  storageBucket: "twill-5656.firebasestorage.app",
  messagingSenderId: "37751943725",
  appId: "1:37751943725:web:931fc4a9cb709ab0f43ea4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
