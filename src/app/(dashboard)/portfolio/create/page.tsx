// src/app/(dashboard)/portfolio/create/page.tsx
'use client';

import { MultiStepForm } from '@/components/portfolio/MultiStepForm';
import { Card } from '@/components/ui/card';

export default function CreatePortfolioPage() {
    return (
        <>
            <MultiStepForm />

            {/* <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Create Your Portfolio
                        </h1>
                        <p className="text-gray-600">
                            Build your professional portfolio in just a few steps
                        </p>
                    </div>

                    <Card className="p-8">
                        <MultiStepForm />
                    </Card>
                </div>
            </div> */}
        </>

    );
}