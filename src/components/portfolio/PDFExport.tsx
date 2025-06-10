'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Portfolio } from '@/lib/types';
import { generatePortfolioPDF } from '@/lib/utils/pdf-generator';
import Image from 'next/image';

interface PDFExportProps {
    portfolio: Portfolio;
    variant?: 'button' | 'icon';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const PDFExport: React.FC<PDFExportProps> = ({
    portfolio,
    variant = 'button',
    size = 'md',
    className = ''
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleExport = async () => {
        try {
            setIsGenerating(true);
            setError(null);

            await generatePortfolioPDF(portfolio);
        } catch (err) {
            console.error('PDF generation failed:', err);
            setError('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleExport}
                disabled={isGenerating}
                className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
                title="Export to PDF"
            >
                {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                ) : (
                    <Download className="w-4 h-4 text-gray-600" />
                )}
            </button>
        );
    }

    return (
        <div className="space-y-2">
            <Button
                onClick={handleExport}
                disabled={isGenerating}
                variant="primary"
                size={size}
                className={className}
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating PDF...
                    </>
                ) : (
                    <>
                        <Download className="w-4 h-4 mr-2" />
                        Export to PDF
                    </>
                )}
            </Button>

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

// PDF Preview Component for showing what the PDF will look like
interface PDFPreviewProps {
    portfolio: Portfolio;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ portfolio }) => {
    return (
        <div className="bg-white shadow-lg max-w-4xl mx-auto" id="pdf-preview">
            {/* PDF Header */}
            <div className="bg-blue-600 text-white p-6">
                <div className="flex items-center gap-6">
                    {portfolio.profileImage ? (
                        <Image
                            width={80}
                            height={80}
                            src={portfolio.profileImage}
                            alt={`${portfolio.employeeCode} profile`}
                            className="w-20 h-20 rounded-full object-cover border-4 border-white"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                            <FileText className="w-10 h-10 text-white" />
                        </div>
                    )}

                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{portfolio.employeeCode}</h1>
                        <p className="text-blue-100 text-lg">{portfolio.designation}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-blue-100">
                            <span>{portfolio.yearsOfExperience} years experience</span>
                            <span>•</span>
                            <span>{portfolio.nationality}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* PDF Content */}
            <div className="p-6 space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <strong>Email:</strong> {portfolio.email}
                    </div>
                    <div>
                        <strong>Mobile:</strong> {portfolio.mobileNo}
                    </div>
                </div>

                {/* Summary */}
                {portfolio.summary && (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                            Professional Summary
                        </h2>
                        <p className="text-gray-700 text-sm leading-relaxed">{portfolio.summary}</p>
                    </div>
                )}

                {/* Technical Skills */}
                {portfolio.technicalSkills && portfolio.technicalSkills.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                            Technical Skills
                        </h2>
                        <div className="space-y-2">
                            {portfolio.technicalSkills.map((skillCategory, index) => (
                                <div key={index}>
                                    <h3 className="font-medium text-gray-800 text-sm">{skillCategory.category}</h3>
                                    <p className="text-gray-600 text-sm">{skillCategory.skills.join(', ')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Work Experience */}
                {portfolio.workExperience && portfolio.workExperience.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                            Work Experience
                        </h2>
                        <div className="space-y-3">
                            {portfolio.workExperience.map((work, index) => (
                                <div key={index}>
                                    <h3 className="font-medium text-gray-900 text-sm">{work.position}</h3>
                                    <p className="text-gray-600 text-sm">{work.company} • {work.duration}</p>
                                    {work.responsibility && work.responsibility.length > 0 && (
                                        <ul className="list-disc list-inside text-gray-700 text-xs mt-1 space-y-1">
                                            {work.responsibility.map((resp, respIndex) => (
                                                <li key={respIndex}>{resp}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                {portfolio.education && portfolio.education.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                            Education
                        </h2>
                        <div className="space-y-2">
                            {portfolio.education.map((edu, index) => (
                                <div key={index}>
                                    <h3 className="font-medium text-gray-900 text-sm">{edu.degree}</h3>
                                    <p className="text-gray-600 text-sm">{edu.institution} • {edu.passingYear}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {portfolio.projects && portfolio.projects.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                            Key Projects
                        </h2>
                        <div className="space-y-3">
                            {portfolio.projects.map((project, index) => (
                                <div key={index}>
                                    <h3 className="font-medium text-gray-900 text-sm">{project.name}</h3>
                                    <p className="text-gray-700 text-xs mb-1">{project.description}</p>
                                    <p className="text-gray-600 text-xs mb-1">
                                        <strong>Contribution:</strong> {project.contribution}
                                    </p>
                                    {project.technologies && project.technologies.length > 0 && (
                                        <p className="text-gray-600 text-xs">
                                            <strong>Technologies:</strong> {project.technologies.join(', ')}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Certifications */}
                {portfolio.certifications && portfolio.certifications.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                            Certifications
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            {portfolio.certifications.map((cert, index) => (
                                <div key={index}>
                                    <h3 className="font-medium text-gray-900 text-sm">{cert.name}</h3>
                                    <p className="text-gray-600 text-xs">{cert.issuingOrganization} • {cert.year}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Languages */}
                {portfolio.languageProficiency && portfolio.languageProficiency.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-200 pb-1">
                            Language Proficiency
                        </h2>
                        <p className="text-gray-700 text-sm">{portfolio.languageProficiency.join(', ')}</p>
                    </div>
                )}
            </div>

            {/* PDF Footer */}
            <div className="bg-gray-50 p-4 text-center text-xs text-gray-500 border-t">
                <p>Generated on {new Date().toLocaleDateString()}</p>
            </div>
        </div>
    );
};

export default PDFExport;