// src/lib/hooks/useAuth.ts
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createUserProfile,
  registerWithEmail,
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
} from "../firebase/auth";
import { auth } from "../firebase/config";
import { setError, setLoading, setUser } from "../redux/slices/authSlice";
import { AppDispatch, RootState } from "../redux/store";

// Admin emails list - should match your Firestore security rules
const ADMIN_EMAILS = [
  'admin@portfolio-collection.com',
];

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);
  const [loading, setLocalLoading] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if current user is admin
  const isAdmin = authState.user?.email ? ADMIN_EMAILS.includes(authState.user.email) : false;

  useEffect(() => {
    dispatch(setLoading(true));

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const user = await createUserProfile(firebaseUser);
          dispatch(setUser(user));
        } else {
          dispatch(setUser(null));
        }
      } catch (error) {
        console.error("Error creating user profile:", error);
        dispatch(setError("Failed to load user profile"));
        dispatch(setUser(null));
      } finally {
        dispatch(setLoading(false));
        setIsInitialized(true); // Mark as initialized
      }
    });

    // Fallback: if onAuthStateChanged doesn't fire within 5 seconds, set loading to false
    const fallbackTimer = setTimeout(() => {
      if (!isInitialized) {
        console.warn("Auth state change timeout - setting loading to false");
        dispatch(setLoading(false));
        setIsInitialized(true);
      }
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, [dispatch, isInitialized]);

  const register = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<void> => {
    try {
      setLocalLoading(true);
      setLocalError(null);
      dispatch(setError(null));

      const user = await registerWithEmail(email, password, displayName);
      dispatch(setUser(user));
    } catch (error: any) {
      const errorMessage = error.message || "Registration failed";
      setLocalError(errorMessage);
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      setLocalLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLocalLoading(true);
      setLocalError(null);
      dispatch(setError(null));

      const user = await signInWithEmail(email, password);
      dispatch(setUser(user));
    } catch (error: any) {
      const errorMessage = error.message || "Login failed";
      setLocalError(errorMessage);
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      setLocalLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      setLocalLoading(true);
      setLocalError(null);
      dispatch(setError(null));

      const user = await signInWithGoogle();
      dispatch(setUser(user));
    } catch (error: any) {
      const errorMessage = error.message || "Google login failed";
      setLocalError(errorMessage);
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      setLocalLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLocalLoading(true);
      setLocalError(null);
      dispatch(setError(null));

      await signOutUser();
      dispatch(setUser(null));
    } catch (error: any) {
      const errorMessage = error.message || "Logout failed";
      setLocalError(errorMessage);
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      setLocalLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLocalLoading(true);
      setLocalError(null);
      dispatch(setError(null));

      await sendPasswordReset(email);
    } catch (error: any) {
      const errorMessage = error.message || "Password reset failed";
      setLocalError(errorMessage);
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      setLocalLoading(false);
    }
  };

  const clearError = () => {
    setLocalError(null);
    dispatch(setError(null));
  };

  return {
    ...authState,
    loading: authState.loading || loading,
    error: authState.error || error,
    isAdmin,
    isInitialized, // Expose initialization state
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    clearError,
  };
};