// components/dashboard/PortfolioOverviewCard.tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAllCategories } from "@/lib/hooks/useAllCategories";
import { useAllSkills } from "@/lib/hooks/useAllSkills";
import { Portfolio } from '@/lib/types';
import { generatePortfolioPDF } from '@/lib/utils/pdf-generator';
import {
    Award,
    Calendar,
    Download,
    Edit,
    Eye,
    FileText,
    MapPin,
    RefreshCw,
    TrendingUp,
    User,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';


interface PortfolioOverviewCardProps {
    portfolio: Portfolio;
    userId?: string;
    loading?: boolean;
}

const PortfolioOverviewCard: React.FC<PortfolioOverviewCardProps> = ({
    portfolio,
    userId,
    loading,
}) => {

    const { designation, yearsOfExperience, nationality } = portfolio?.personalInfo;

    // For Data View
    const allCategories = useAllCategories();
    const allSkills = useAllSkills();

    return (
        <Card className="p-8 border-0 bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl text-white mr-4">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Portfolio Overview</h2>
                </div>
                {loading && (
                    <div className="flex items-center text-gray-500">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        <span className="text-sm">Updating...</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 text-lg flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Basic Information
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-start text-gray-600">
                            <Award className="w-4 h-4 mr-3 mt-0.5 text-purple-500 flex-shrink-0" />
                            <div>
                                <span className="text-sm font-medium text-gray-800 block">Role</span>
                                <span className="text-sm">{designation || 'Not specified'}</span>
                            </div>
                        </div>
                        <div className="flex items-start text-gray-600">
                            <Calendar className="w-4 h-4 mr-3 mt-0.5 text-green-500 flex-shrink-0" />
                            <div>
                                <span className="text-sm font-medium text-gray-800 block">Experience</span>
                                <span className="text-sm">{yearsOfExperience || 0} years</span>
                            </div>
                        </div>
                        <div className="flex items-start text-gray-600">
                            <MapPin className="w-4 h-4 mr-3 mt-0.5 text-red-500 flex-shrink-0" />
                            <div>
                                <span className="text-sm font-medium text-gray-800 block">Location</span>
                                <span className="text-sm">{nationality || 'Not specified'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Portfolio Stats */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 text-lg flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                        Content Stats
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                            <span className="text-gray-600 text-sm font-medium">Projects</span>
                            <span className="font-bold text-gray-900 text-lg">
                                {portfolio.projects?.length || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                            <span className="text-gray-600 text-sm font-medium">Education</span>
                            <span className="font-bold text-gray-900 text-lg">
                                {portfolio.education?.length || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                            <span className="text-gray-600 text-sm font-medium">Certifications</span>
                            <span className="font-bold text-gray-900 text-lg">
                                {portfolio.certifications?.length || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                            <span className="text-gray-600 text-sm font-medium">Work Experience</span>
                            <span className="font-bold text-gray-900 text-lg">
                                {portfolio.workExperience?.length || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                            <span className="text-gray-600 text-sm font-medium">Skills</span>
                            <span className="font-bold text-gray-900 text-lg">
                                {portfolio.technicalSkills?.reduce((acc, cat) => acc + cat.skills.length, 0) || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 text-lg flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-blue-600" />
                        Quick Actions
                    </h3>
                    <div className="flex flex-col space-y-3 gap-2">
                        <Link href="/portfolio/edit">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start h-12 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                            >
                                <Edit className="w-4 h-4 mr-3" />
                                Edit Portfolio
                            </Button>
                        </Link>
                        <Link href={`/portfolio/${userId}`}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start h-12 border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all duration-300"
                            >
                                <Eye className="w-4 h-4 mr-3" />
                                Preview Portfolio
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start h-12 border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300"
                            onClick={() => {
                                generatePortfolioPDF(portfolio, allCategories, allSkills);
                            }}
                        >
                            <Download className="w-4 h-4 mr-3" />
                            Export PDF
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default PortfolioOverviewCard;