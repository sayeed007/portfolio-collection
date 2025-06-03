// components/dashboard/WelcomeHeader.tsx
import React from 'react';
import { Star } from 'lucide-react';

interface WelcomeHeaderProps {
    userName?: string;
    userEmail?: string;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ userName, userEmail }) => {
    const displayName = userName?.split(' ')[0] || userEmail?.split('@')[0] || 'Professional';

    return (
        <div className="mb-16 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-purple-200 mb-8">
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                    Professional Dashboard
                </span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Welcome back,
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {" "}{displayName}!
                </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Manage your portfolio and track your professional growth with our cutting-edge platform
            </p>
        </div>
    );
};

export default WelcomeHeader;