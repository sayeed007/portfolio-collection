// components/dashboard/PortfolioManagementCard.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Eye, Edit, Plus } from 'lucide-react';

interface PortfolioManagementCardProps {
    hasPortfolio: boolean;
    userId?: string;
}

const PortfolioManagementCard: React.FC<PortfolioManagementCardProps> = ({
    hasPortfolio,
    userId
}) => {
    return (
        <Card className="p-8 border-0 bg-white/80 backdrop-blur hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl text-white mr-4">
                    <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Portfolio Management</h2>
            </div>

            {hasPortfolio ? (
                <>
                    <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                        Your portfolio is active and ready to showcase your professional journey to the world.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href={`/portfolio/${userId}`}>
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto h-12 px-6 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View Portfolio
                            </Button>
                        </Link>
                        <Link href="/portfolio/edit">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Portfolio
                            </Button>
                        </Link>
                    </div>
                </>
            ) : (
                <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <Plus className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        No Portfolio Yet
                    </h3>
                    <p className="text-gray-600 mb-8 leading-relaxed text-lg max-w-md mx-auto">
                        Ready to showcase your professional journey? Create your stunning portfolio in just a few minutes and stand out from the crowd.
                    </p>
                    <Link href="/portfolio/create">
                        <Button
                            size="lg"
                            className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your Portfolio
                        </Button>
                    </Link>
                </div>
            )}
        </Card>
    );
};

export default PortfolioManagementCard;