/* eslint-disable react-hooks/exhaustive-deps */
// src/app/(dashboard)/directory/page.tsx
'use client';

import { PortfolioDirectory } from '@/components/portfolio/PortfolioDirectory';
import { usePortfolio } from '@/lib/hooks/usePortfolio';
import { useEffect } from 'react';

export default function DirectoryPage() {
    const {
        portfolios, // This should contain all public portfolios
        loading,
        error,
        fetchPortfolios, // Function to fetch all public portfolios
        // filters,
    } = usePortfolio();

    // Fetch all public portfolios when component mounts
    useEffect(() => {
        fetchPortfolios();
    }, []);

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

            <PortfolioDirectory
                portfolios={portfolios || []} // Pass all portfolios, not just current user's
                loading={loading}
                error={!!error}
                onPDFExport={(portfolio) => {
                    // Implement PDF export functionality
                    console.log('Exporting PDF for:', portfolio.employeeCode);
                }}
            />
        </div>
    );
}