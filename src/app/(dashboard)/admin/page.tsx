// src/app/(dashboard)/admin/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function AdminPage() {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            router.push('/dashboard');
        }
    }, [user, isAdmin, loading, router]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user || !isAdmin) {
        return null;
    }

    return <AdminPanel />;
}