// components/dashboard/ExploreConnectCard.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Globe, Search } from 'lucide-react';

const ExploreConnectCard: React.FC = () => {
    return (
        <Card className="p-8 border-0 bg-white/80 backdrop-blur hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl text-white mr-4">
                    <Globe className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Explore & Connect</h2>
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Discover talented professionals, expand your network, and get inspired by amazing portfolios in our community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/directory">
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto h-12 px-6 border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all duration-300"
                    >
                        <Globe className="w-4 h-4 mr-2" />
                        Browse Portfolios
                    </Button>
                </Link>
                <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto h-12 px-6 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                >
                    <Search className="w-4 h-4 mr-2" />
                    Advanced Search
                </Button>
            </div>
        </Card>
    );
};

export default ExploreConnectCard;