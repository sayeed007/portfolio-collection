// src/app/(dashboard)/portfolio/create/page.tsx
'use client';

import { MultiStepForm } from '@/components/portfolio/MultiStepForm';

export default function CreatePortfolioPage() {
    return (
        <>
            <MultiStepForm
                mode={'create'}
            />
        </>

    );
}