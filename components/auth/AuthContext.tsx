"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { signInWithGoogle, signOutUser, subscribeToAuthChanges } from "@/lib/firebase/auth";

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  errorMsg: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  errorMsg: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  clearError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Safety fallback timer so loading never hangs
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 600);

    const unsubscribe = subscribeToAuthChanges((authUser) => {
      setUser(authUser);
      setLoading(false);
      clearTimeout(safetyTimer);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Google Sign-In failed:", err);
      if (err?.code === "auth/unauthorized-domain") {
        setErrorMsg("Domain unauthorized! Please add your Vercel domain to Firebase Console -> Authentication -> Settings -> Authorized Domains.");
      } else if (err?.code === "auth/invalid-api-key" || err?.code === "auth/api-key-not-valid") {
        setErrorMsg("Firebase API key missing or invalid. Please set NEXT_PUBLIC_FIREBASE_API_KEY in Vercel.");
      } else if (err?.code === "auth/popup-closed-by-user") {
        // User closed popup, no error needed
      } else {
        setErrorMsg(err?.message || "Google Sign-In failed. Please check Firebase Authentication settings.");
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err: any) {
      console.error("Sign-Out failed:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        errorMsg,
        signInWithGoogle: handleGoogleSignIn,
        signOut: handleSignOut,
        clearError: () => setErrorMsg(null),
      }}
    >
      {children}
      {errorMsg && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md bg-rose-950 border border-rose-500/50 text-rose-200 p-4 rounded-xl shadow-2xl text-xs space-y-2 animate-bounce">
          <div className="flex items-center justify-between font-semibold text-rose-300">
            <span>Firebase Authentication Setup Required</span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">✕</button>
          </div>
          <p className="leading-relaxed">{errorMsg}</p>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
