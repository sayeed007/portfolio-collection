// src/app/(dashboard)/portfolio/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/hooks/useAuth';
import { PortfolioView } from '@/components/portfolio/PortfolioView';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Portfolio } from '@/lib/types/portfolio';
import BackgroundDecoration from '@/components/common/BackgroundDecoration';

export default function PortfolioPage() {
    const params = useParams();
    const { user } = useAuth();
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const portfolioId = params.id as string;

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const portfolioRef = doc(db, 'users', portfolioId, 'portfolio', 'data');
                const portfolioSnap = await getDoc(portfolioRef);

                if (portfolioSnap.exists()) {
                    const portfolioData = portfolioSnap.data() as Portfolio;
                    setPortfolio(portfolioData);

                    // Increment visit count if viewing someone else's portfolio
                    if (user && user.uid !== portfolioId) {
                        await updateDoc(portfolioRef, {
                            visitCount: increment(1)
                        });
                    }
                } else {
                    setError('Portfolio not found');
                }
            } catch (err) {
                console.error('Error fetching portfolio:', err);
                setError('Failed to load portfolio');
            } finally {
                setLoading(false);
            }
        };

        if (portfolioId) {
            fetchPortfolio();
        }
    }, [portfolioId, user]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${portfolio?.designation || 'Professional'} Portfolio`,
                    text: `Check out this professional portfolio`,
                    url: window.location.href,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Not Found</h1>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <Link href="/directory">
                        <Button>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Directory
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!portfolio) {
        return null;
    }

    const isOwner = user?.uid === portfolioId;

    return (
        <div className="container mx-auto px-4 py-8">
            <BackgroundDecoration />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <Link href="/directory">
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Directory
                        </Button>
                    </Link>

                    <div className="flex space-x-3">
                        <Button variant="outline" onClick={handleShare}>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                        {isOwner && (
                            <Link href="/portfolio/edit">
                                <Button>Edit Portfolio</Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Portfolio Content */}
                <PortfolioView
                    portfolio={portfolio}
                    isOwner={isOwner}
                />
            </div>
        </div>
    );
}