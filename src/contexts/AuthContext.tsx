import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "",
            photoURL: firebaseUser.photoURL || undefined,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log("Attempting Google sign in...");
      console.log("Auth object:", auth);
      console.log("Google provider:", googleProvider);
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Sign in successful:", result);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      console.error("Error code:", (error as any)?.code);
      console.error("Error message:", (error as any)?.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
