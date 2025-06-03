// src/app/(dashboard)/admin/requests/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { RequestApproval } from '@/components/admin/RequestApproval';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function AdminRequestsPage() {
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

    return (
        <div className="container mx-auto px-4 py-8">
            <RequestApproval />
        </div>
    );
}