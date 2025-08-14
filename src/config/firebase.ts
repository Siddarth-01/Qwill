// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Using environment variables for security
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyBeBbUuMDgAe-3IG4RKKbZfe78GyZ2bJOQ",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "twill-5656.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "twill-5656",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "twill-5656.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "37751943725",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:37751943725:web:931fc4a9cb709ab0f43ea4",
};

// Debug: Log Firebase config (only in development)
if (import.meta.env.DEV) {
  console.log("Firebase config:", firebaseConfig);
  console.log("Environment variables:", {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? "Set" : "Using fallback",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
      ? "Set"
      : "Using fallback",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
      ? "Set"
      : "Using fallback",
  });
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
