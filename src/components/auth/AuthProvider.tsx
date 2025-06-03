// src/components/auth/AuthProvider.tsx
'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { setUser, setLoading, clearAuth } from '@/lib/redux/slices/authSlice'; // Changed clearUser to clearAuth
import { RootState } from '@/lib/redux/store';
import { User } from '@/lib/types/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const dispatch = useDispatch();
    const { user, loading } = useSelector((state: RootState) => state.auth);

    // Check if user is admin
    const isAdmin = user?.isAdmin || false;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            dispatch(setLoading(true));

            if (firebaseUser) {
                // Check if user is admin
                const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
                const isUserAdmin = adminEmails.includes(firebaseUser.email || '');

                const userData: User = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    displayName: firebaseUser.displayName || '',
                    photoURL: firebaseUser.photoURL || '',
                    isAdmin: isUserAdmin,
                    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
                };

                dispatch(setUser(userData));
            } else {
                dispatch(clearAuth()); // Changed clearUser() to clearAuth()
            }

            dispatch(setLoading(false));
        });

        return () => unsubscribe();
    }, [dispatch]);

    const value: AuthContextType = {
        user,
        loading,
        isAdmin,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}