// src/components/common/ProtectedRoute.tsx
'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { redirect } from 'next/navigation';
import { RootState } from '@/lib/redux/store';
import { PageLoader } from './LoadingSpinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireAdmin?: boolean;
    redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAuth = true,
    requireAdmin = false,
    redirectTo = '/login'
}) => {
    const { user, isLoading } = useSelector((state: RootState) => state.auth);

    // Show loading while checking authentication
    if (isLoading) {
        return <PageLoader text="Checking authentication..." />;
    }

    // Redirect if authentication is required but user is not logged in
    if (requireAuth && !user) {
        redirect(redirectTo);
    }

    // Redirect if admin access is required but user is not admin
    if (requireAdmin && (!user || !user.isAdmin)) {
        redirect('/dashboard');
    }

    // If user is logged in but trying to access auth pages, redirect to dashboard
    if (!requireAuth && user && (
        window.location.pathname.includes('/auth/') ||
        window.location.pathname === '/'
    )) {
        redirect('/dashboard');
    }

    return <>{children}</>;
};

// Higher-order component version
export const withAuth = <P extends object>(
    Component: React.ComponentType<P>,
    options: {
        requireAuth?: boolean;
        requireAdmin?: boolean;
        redirectTo?: string;
    } = {}
) => {
    const AuthenticatedComponent = (props: P) => {
        return (
            <ProtectedRoute {...options}>
                <Component {...props} />
            </ProtectedRoute>
        );
    };

    AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
    return AuthenticatedComponent;
};
