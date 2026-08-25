import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "./config";
import { syncUserToFirestore } from "./firestore";

export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      syncUserToFirestore(user).catch(console.error);
    }
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    // Instantly notify AuthProvider so loading spinner never hangs
    callback(user);
    if (user) {
      syncUserToFirestore(user).catch((err) => {
        console.warn("Background Firestore user sync warning:", err);
      });
    }
  });
}
