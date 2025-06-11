// src/app/(dashboard)/portfolio/edit/page.tsx
'use client';

import { MultiStepForm } from '@/components/portfolio/MultiStepForm';

export default function EditPortfolioPage() {
    return (
        <MultiStepForm
            mode={'edit'}
        />
    );
}