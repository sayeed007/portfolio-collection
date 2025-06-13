'use client';

import React from 'react';
import { Card } from '@/components/ui';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    GraduationCap,
    Award,
    BookOpen,
    Code,
    Briefcase,
    FolderOpen,
    Users,
    Download,
    Edit,
    Eye
} from 'lucide-react';
import { Portfolio } from '@/lib/types';
import { formatDate } from '@/lib/utils/formatters';
import Image from 'next/image';

interface PortfolioViewProps {
    portfolio: Portfolio;
    isOwner?: boolean;
    onEdit?: () => void;
    onPDFExport?: () => void;
    showVisitCount?: boolean;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
    portfolio,
    isOwner = false,
    onEdit,
    onPDFExport,
    showVisitCount = isOwner || false
}) => {

    const { profileImage, employeeCode, designation, email, mobileNo, nationality, yearsOfExperience, languageProficiency, summary } = portfolio?.personalInfo;
    const { visitCount } = portfolio;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header with Actions */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {employeeCode}
                    </h1>
                    <p className="text-xl text-gray-600 mt-1">
                        {designation}
                    </p>
                </div>

                <div className="flex gap-2">
                    {showVisitCount && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                            <Eye className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-600">
                                {visitCount || 0} views
                            </span>
                        </div>
                    )}

                    {onPDFExport && (
                        <button
                            onClick={onPDFExport}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                    )}

                    {isOwner && onEdit && (
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </button>
                    )}
                </div>
            </div>

            {/* Personal Information */}
            <Card className="p-6">
                <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                        {profileImage ? (
                            <Image
                                width={96}
                                height={96}
                                src={profileImage}
                                alt={`${employeeCode} profile`}
                                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <User className="w-12 h-12 text-white" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span>{email}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span>{mobileNo}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span>{nationality}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span>{yearsOfExperience} years experience</span>
                            </div>
                        </div>

                        {languageProficiency && languageProficiency?.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-bold text-gray-700 mb-2">Languages</h4>
                                <div className="flex flex-wrap gap-2">
                                    {languageProficiency?.map((language, index) => (
                                        <span
                                            key={`language-${index}`}
                                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                                        >
                                            {language?.language} = {language?.proficiency}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Summary */}
            {summary && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
                    <p className="text-gray-700 leading-relaxed">{summary}</p>
                </Card>
            )}

            {/* Education */}
            {portfolio?.education && portfolio?.education?.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Education
                    </h2>
                    <div className="space-y-4">
                        {portfolio?.education?.map((edu, index) => (
                            <div key={`education-${index}`} className="border-l-4 border-blue-500 pl-4">
                                <h3 className="font-semibold text-gray-900">{edu?.degree}</h3>
                                <p className="text-gray-600">{edu?.institution}</p>
                                <p className="text-sm text-gray-500">Graduated: {edu?.passingYear}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Certifications */}
            {portfolio?.certifications && portfolio?.certifications.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Certifications
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {portfolio?.certifications?.map((cert, index) => (
                            <div key={`certificate-${index}`} className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-gray-900">{cert?.name}</h3>
                                <p className="text-gray-600">{cert?.issuingOrganization}</p>
                                <p className="text-sm text-gray-500">Year: {cert?.year}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Courses */}
            {portfolio?.courses && portfolio?.courses?.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Courses
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {portfolio?.courses.map((course, index) => (
                            <div key={`courses-${index}`} className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-gray-900">{course.name}</h3>
                                <p className="text-gray-600">{course.provider}</p>
                                <p className="text-sm text-gray-500">Completed: {course.completionDate}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Technical Skills */}
            {portfolio?.technicalSkills && portfolio?.technicalSkills?.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        Technical Skills
                    </h2>
                    <div className="space-y-4">
                        {portfolio?.technicalSkills?.map((skillCategory, index) => (
                            <div key={`technicalSkills-${index}`}>
                                <h3 className="font-semibold text-gray-800 mb-2">
                                    {skillCategory.category}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {skillCategory.skills.map((skill, skillIndex) => (
                                        <span
                                            key={skillIndex}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Work Experience */}
            {portfolio?.workExperience && portfolio?.workExperience.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Work Experience
                    </h2>
                    <div className="space-y-6">
                        {portfolio?.workExperience.map((work, index) => (
                            <div key={`workExperience-${index}`} className="border-l-4 border-green-500 pl-4">
                                <h3 className="font-semibold text-gray-900">{work.position}</h3>
                                <p className="text-gray-600 font-medium">{work.company}</p>
                                <p className="text-sm text-gray-500 mb-2">{work.duration}</p>
                                {work.responsibility && work.responsibility.length > 0 && (
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                        {work.responsibility.map((resp, respIndex) => (
                                            <li key={respIndex} className="text-sm">{resp}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Projects */}
            {portfolio?.projects && portfolio?.projects.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FolderOpen className="w-5 h-5" />
                        Projects
                    </h2>
                    <div className="space-y-6">
                        {portfolio?.projects.map((project, index) => (
                            <div key={`projects-${index}`} className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
                                <p className="text-gray-700 mb-3">{project.description}</p>
                                <p className="text-gray-600 mb-3">
                                    <span className="font-medium">Contribution:</span> {project.contribution}
                                </p>
                                {project.technologies && project.technologies.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Technologies Used:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {project.technologies.map((tech, techIndex) => (
                                                <span
                                                    key={techIndex}
                                                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* References */}
            {portfolio?.references && portfolio?.references.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        References
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {portfolio?.references.map((ref, index) => (
                            <div key={`references-${index}`} className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-gray-900">{ref.name}</h3>
                                <p className="text-gray-600">{ref.relationship}</p>
                                <p className="text-sm text-gray-500">{ref.contactInfo}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 py-4">
                <p>Portfolio created on {formatDate(portfolio?.createdAt?.toDate())}</p>
                <p>Last updated on {formatDate(portfolio?.updatedAt?.toDate())}</p>
            </div>
        </div>
    );
};

export default PortfolioView;