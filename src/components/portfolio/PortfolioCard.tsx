'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { User, MapPin, Calendar, Eye, Download } from 'lucide-react';
import { Portfolio } from '@/lib/types';
import { formatDate } from '@/lib/utils/formatters';
import Image from 'next/image';

interface PortfolioCardProps {
    portfolio: Portfolio;
    showVisitCount?: boolean;
    onPDFExport?: (portfolio: Portfolio) => void;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
    portfolio,
    showVisitCount = false,
    onPDFExport
}) => {
    const handlePDFExport = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onPDFExport) {
            onPDFExport(portfolio);
        }
    };

    const { profileImage, employeeCode, designation, yearsOfExperience, nationality, summary } = portfolio?.personalInfo;

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
            <Link href={`/portfolio/${portfolio.userId}`}>
                <div className="p-6">
                    {/* Header with Profile Image and Basic Info */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className="relative self-center">
                            {profileImage ? (
                                <Image
                                    width={64}
                                    height={64}
                                    src={profileImage}
                                    alt={`${employeeCode} profile`}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                            )}

                            {/* Online status indicator */}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                {employeeCode}
                            </h3>
                            <p className="text-gray-600 font-medium truncate">
                                {designation}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {yearsOfExperience} years exp.
                                </span>
                                {nationality && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {nationality}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Visit count and actions */}
                        <div className="flex flex-col items-end gap-2">
                            {showVisitCount && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Eye className="w-4 h-4" />
                                    <span>{portfolio.visitCount || 0}</span>
                                </div>
                            )}

                            {onPDFExport && (
                                <button
                                    onClick={handlePDFExport}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Export to PDF"
                                >
                                    <Download className="w-4 h-4 text-gray-600" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    {summary && (
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                            {summary}
                        </p>
                    )}

                    {/* Technical Skills Preview */}
                    {portfolio.technicalSkills && portfolio.technicalSkills.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Top Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {portfolio.technicalSkills
                                    .slice(0, 2)
                                    .map((skillCategory, index) => (
                                        <div key={index} className="flex flex-wrap gap-1">
                                            {skillCategory.skills.slice(0, 3).map((skill, skillIndex) => (
                                                <span
                                                    key={skillIndex}
                                                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                                >
                                                    {skill.skillId} ({skill.proficiency})
                                                </span>
                                            ))}
                                        </div>
                                    ))}
                                {portfolio.technicalSkills.length > 2 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                        +{portfolio.technicalSkills.length - 2} more categories
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Education Preview */}
                    {portfolio.education && portfolio.education.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Education</h4>
                            <p className="text-sm text-gray-600 truncate">
                                {portfolio.education[0].degree} - {portfolio.education[0].institution}
                            </p>
                        </div>
                    )}

                    {/* Footer with timestamps and project count */}
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                        <span>
                            Updated {formatDate(portfolio?.updatedAt?.toString())}
                        </span>
                        {portfolio.projects && (
                            <span>
                                {portfolio.projects.length} project{portfolio.projects.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </Card>
    );
};

export default PortfolioCard;