import { Timestamp } from "firebase/firestore";

// src/lib/types/auth.ts
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  isAdmin?: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
