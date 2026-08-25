import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";
import { dbFirestore } from "./config";

export interface FirestoreKnowledgeItem {
  id: string;
  userId: string;
  title: string;
  rawContent: string;
  summary?: string;
  contentType: string;
  status: string;
  source: string;
  categoryName?: string;
  tags?: string[];
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Sync user profile to Firestore `users` collection
 */
export async function syncUserToFirestore(user: FirebaseUser): Promise<void> {
  if (!user) return;
  const userRef = doc(dbFirestore, "users", user.uid);
  await setDoc(
    userRef,
    {
      uid: user.uid,
      displayName: user.displayName || "User",
      email: user.email,
      photoURL: user.photoURL,
      lastLoginAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Save or update Knowledge Item in Firestore `knowledgeItems` collection
 */
export async function saveKnowledgeItemToFirestore(item: FirestoreKnowledgeItem): Promise<void> {
  const itemRef = doc(dbFirestore, "knowledgeItems", item.id);
  await setDoc(
    itemRef,
    {
      ...item,
      updatedAt: serverTimestamp(),
      createdAt: item.createdAt || serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Get Knowledge Items from Firestore for active user
 */
export async function getKnowledgeItemsFromFirestore(userId: string): Promise<FirestoreKnowledgeItem[]> {
  try {
    const q = query(
      collection(dbFirestore, "knowledgeItems"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    const items: FirestoreKnowledgeItem[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as FirestoreKnowledgeItem);
    });
    return items;
  } catch (error) {
    console.error("Error fetching Firestore items:", error);
    return [];
  }
}

/**
 * Delete item from Firestore
 */
export async function deleteKnowledgeItemFromFirestore(itemId: string): Promise<void> {
  const itemRef = doc(dbFirestore, "knowledgeItems", itemId);
  await deleteDoc(itemRef);
}
