// src/app/(dashboard)/directory/page.tsx
'use client';

import { PortfolioDirectory } from '@/components/portfolio/PortfolioDirectory';

export default function DirectoryPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Portfolio Directory
                </h1>
                <p className="text-gray-600">
                    Discover and connect with professionals from around the world
                </p>
            </div>

            <PortfolioDirectory />
        </div>
    );
}