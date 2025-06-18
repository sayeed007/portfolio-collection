// src/lib/firebase/auth.ts
import {
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { User } from "../types";
import { auth, db } from "./config";

// Create user profile in Firestore
export const createUserProfile = async (
  firebaseUser: FirebaseUser
): Promise<User> => {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const firestoreData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Data to return to Redux (serializable)
    const userData: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userRef, firestoreData);
    return userData;
  }

  // Convert Firestore timestamps to strings when reading
  const data = userSnap.data();
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    emailVerified: data.emailVerified,
    createdAt: data.createdAt?.toDate().toISOString() || null,
    updatedAt: data.updatedAt?.toDate().toISOString() || null,
  } as User;
};

// Register with email and password
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update the user's display name
    await updateProfile(user, { displayName });

    // Send email verification
    await sendEmailVerification(user);

    // Create user profile in Firestore
    const userProfile = await createUserProfile(user);

    return userProfile;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Sign in with email and password
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return await createUserProfile(user);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");

    const { user } = await signInWithPopup(auth, provider);
    return await createUserProfile(user);
  } catch (error: any) {
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in was cancelled");
    }
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error(error);
    throw new Error("Failed to sign out");
  }
};

// Send password reset email
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Update user profile
export const updateUserProfile = async (updates: {
  displayName?: string;
  photoURL?: string;
}): Promise<void> => {
  try {
    if (!auth.currentUser) {
      throw new Error("No authenticated user");
    }

    await updateProfile(auth.currentUser, updates);

    // Update Firestore document
    const userRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(
      userRef,
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error: any) {
    console.error(error);
    throw new Error("Failed to update profile");
  }
};

// Get user error messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/user-not-found":
      return "No account found with this email address";
    case "auth/wrong-password":
      return "Incorrect password";
    case "auth/email-already-in-use":
      return "An account with this email already exists";
    case "auth/weak-password":
      return "Password is too weak. Please choose a stronger password";
    case "auth/invalid-email":
      return "Invalid email address";
    case "auth/user-disabled":
      return "This account has been disabled";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later";
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again";
    case "auth/invalid-credential":
      return "Invalid email or password";
    case "auth/requires-recent-login":
      return "Please log in again to perform this action";
    default:
      return "An unexpected error occurred. Please try again";
  }
};
