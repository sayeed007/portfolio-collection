// src/app/(dashboard)/portfolio/edit/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePortfolio } from '@/lib/hooks/usePortfolio';
import { MultiStepForm } from '@/components/portfolio/MultiStepForm';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function EditPortfolioPage() {
    const { user } = useAuth();
    const { portfolio, loading } = usePortfolio();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !portfolio) {
            router.push('/portfolio/create');
        }
    }, [portfolio, loading, router]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!portfolio) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Edit Your Portfolio
                    </h1>
                    <p className="text-gray-600">
                        Update your professional information
                    </p>
                </div>

                <Card className="p-8">
                    <MultiStepForm initialData={portfolio} isEditing={true} />
                </Card>
            </div>
        </div>
    );
}