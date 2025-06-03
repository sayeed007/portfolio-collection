// components/dashboard/StatsCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatsCardProps {
    icon: LucideIcon;
    label: string;
    value: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
}

const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, label, value, color }) => {
    const colorClasses = {
        blue: {
            bg: "bg-blue-100",
            text: "text-blue-600",
            hover: "group-hover:bg-blue-600 group-hover:text-white"
        },
        green: {
            bg: "bg-green-100",
            text: "text-green-600",
            hover: "group-hover:bg-green-600 group-hover:text-white"
        },
        purple: {
            bg: "bg-purple-100",
            text: "text-purple-600",
            hover: "group-hover:bg-purple-600 group-hover:text-white"
        },
        orange: {
            bg: "bg-orange-100",
            text: "text-orange-600",
            hover: "group-hover:bg-orange-600 group-hover:text-white"
        }
    };

    const classes = colorClasses[color];

    return (
        <Card className="p-6 border-0 bg-white/80 backdrop-blur hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
            <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-2xl transition-all duration-300 ${classes.bg} ${classes.text} ${classes.hover}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                        {label}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">
                        {value}
                    </p>
                </div>
            </div>
        </Card>
    );
};

export default StatsCard;