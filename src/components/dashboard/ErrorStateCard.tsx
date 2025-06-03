// components/dashboard/ErrorStateCard.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Plus, Home, Search } from 'lucide-react';
import Link from 'next/link';
import BackgroundDecoration from '../common/BackgroundDecoration';

interface ErrorStateCardProps {
    type: 'error' | 'not-found';
    title: string;
    message: string;
    onRetry?: () => void;
    loading?: boolean;
}

const ErrorStateCard: React.FC<ErrorStateCardProps> = ({
    type,
    title,
    message,
    onRetry,
    loading
}) => {
    const isNotFound = type === 'not-found';

    return (
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Background decoration - matching homepage */}
            <BackgroundDecoration />

            <div className="relative z-10 flex items-center justify-center py-4">
                <div className="container mx-auto px-4">
                    <Card className="p-6 lg:p-8 max-w-2xl mx-auto text-center border-0 bg-white/80 backdrop-blur shadow-2xl hover:shadow-3xl transition-all duration-300">
                        {/* Status badge */}
                        <div className={`inline-flex items-center px-4 py-2 backdrop-blur rounded-full border mb-8 ${isNotFound
                            ? 'bg-yellow-50/80 border-yellow-200'
                            : 'bg-red-50/80 border-red-200'
                            }`}>
                            <AlertCircle className={`w-4 h-4 mr-2 ${isNotFound ? 'text-yellow-500' : 'text-red-500'
                                }`} />
                            <span className={`text-sm font-medium ${isNotFound ? 'text-yellow-700' : 'text-red-700'
                                }`}>
                                {isNotFound ? 'Portfolio Not Found' : 'Something Went Wrong'}
                            </span>
                        </div>

                        {/* Large icon */}
                        {/* <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8 ${isNotFound
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-red-100 text-red-600'
                            }`}>
                            <AlertCircle className="w-12 h-12" />
                        </div> */}

                        {/* Title */}
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                            {title}
                        </h1>

                        {/* Message */}
                        <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed mb-12 max-w-xl mx-auto">
                            {message}
                        </p>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                            {isNotFound ? (
                                <>
                                    <Link href="/portfolio/create">
                                        <Button
                                            size="lg"
                                            className="h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                        >
                                            <Plus className="mr-2 w-5 h-5" />
                                            Create Your Portfolio
                                        </Button>
                                    </Link>
                                    <Link href="/directory">
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="h-14 px-8 text-lg border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 backdrop-blur bg-white/80"
                                        >
                                            <Search className="mr-2 w-5 h-5" />
                                            Browse Portfolios
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    {onRetry && (
                                        <Button
                                            onClick={onRetry}
                                            disabled={loading}
                                            size="lg"
                                            className="h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            <RefreshCw className={`mr-2 w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                            {loading ? 'Retrying...' : 'Try Again'}
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => window.location.reload()}
                                        className="h-14 px-8 text-lg border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 backdrop-blur bg-white/80"
                                    >
                                        <RefreshCw className="mr-2 w-5 h-5" />
                                        Refresh Page
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Back to home link */}
                        <div className="pt-8 border-t border-gray-200">
                            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors duration-300 font-medium">
                                <Home className="w-4 h-4 mr-2" />
                                Back to Home
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>

            {/* CSS animations - matching homepage */}
            <style jsx>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animation-delay-6000 {
                    animation-delay: 6s;
                }
            `}</style>
        </div>
    );
};

export default ErrorStateCard;