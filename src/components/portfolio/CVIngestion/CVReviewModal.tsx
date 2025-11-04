'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  ChevronDown,
  ChevronUp,
  User,
  GraduationCap,
  Briefcase,
  Code,
  FolderOpen,
  Award,
  BookOpen,
} from 'lucide-react';
import { CVIngestionResult } from '@/lib/cv-ingestion';

interface CVReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  result: CVIngestionResult;
}

export default function CVReviewModal({
  isOpen,
  onClose,
  onApprove,
  result,
}: CVReviewModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['personalInfo', 'education', 'skills', 'experience'])
  );

  if (!isOpen || !result.parsedCV) return null;

  const { parsedCV, validation } = result;

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getSectionIcon = (section: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      personalInfo: <User className="w-5 h-5" />,
      education: <GraduationCap className="w-5 h-5" />,
      certifications: <Award className="w-5 h-5" />,
      courses: <BookOpen className="w-5 h-5" />,
      skills: <Code className="w-5 h-5" />,
      experience: <Briefcase className="w-5 h-5" />,
      projects: <FolderOpen className="w-5 h-5" />,
    };
    return iconMap[section] || <CheckCircle className="w-5 h-5" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review Extracted Data</h2>
            <p className="text-sm text-gray-500 mt-1">
              Verify the information before filling the form
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Validation Summary */}
        {validation && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-3 gap-4">
              {/* Completeness */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Completeness</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {validation.completeness}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${validation.completeness}%` }}
                  />
                </div>
              </div>

              {/* Quality Score */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Quality Score</span>
                  <span className="text-2xl font-bold text-green-600">
                    {validation.qualityScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${validation.qualityScore}%` }}
                  />
                </div>
              </div>

              {/* Issues */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-sm font-medium text-gray-600 mb-2">Issues Found</div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold">{validation.errors.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-semibold">{validation.warnings.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Errors and Warnings */}
            {(validation.errors.length > 0 || validation.warnings.length > 0) && (
              <div className="mt-4 space-y-2">
                {validation.errors.map((error, index) => (
                  <div
                    key={`error-${index}`}
                    className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700">
                      <span className="font-medium">{error.field}:</span> {error.message}
                    </div>
                  </div>
                ))}
                {validation.warnings.slice(0, 3).map((warning, index) => (
                  <div
                    key={`warning-${index}`}
                    className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-700">
                      <span className="font-medium">{warning.field}:</span> {warning.message}
                      {warning.suggestion && (
                        <span className="block text-xs mt-1">{warning.suggestion}</span>
                      )}
                    </div>
                  </div>
                ))}
                {validation.warnings.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{validation.warnings.length - 3} more warnings
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Personal Info Section */}
          <Section
            title="Personal Information"
            icon={getSectionIcon('personalInfo')}
            isExpanded={expandedSections.has('personalInfo')}
            onToggle={() => toggleSection('personalInfo')}
          >
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Full Name" value={parsedCV.personalInfo.fullName} />
              <InfoField label="Email" value={parsedCV.personalInfo.email} />
              <InfoField label="Phone" value={parsedCV.personalInfo.phone} />
              <InfoField label="Location" value={parsedCV.personalInfo.location} />
              <InfoField label="Nationality" value={parsedCV.personalInfo.nationality} />
              <InfoField label="LinkedIn" value={parsedCV.personalInfo.linkedIn} />
              <InfoField label="GitHub" value={parsedCV.personalInfo.github} />
              <InfoField label="Website" value={parsedCV.personalInfo.website} />
            </div>
            {parsedCV.personalInfo.summary && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">Summary</label>
                <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {parsedCV.personalInfo.summary}
                </p>
              </div>
            )}
          </Section>

          {/* Education Section */}
          {parsedCV.education.length > 0 && (
            <Section
              title={`Education (${parsedCV.education.length})`}
              icon={getSectionIcon('education')}
              isExpanded={expandedSections.has('education')}
              onToggle={() => toggleSection('education')}
            >
              <div className="space-y-4">
                {parsedCV.education.map((edu, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span>Year: {edu.graduationYear}</span>
                          {edu.grade && <span>Grade: {edu.grade}</span>}
                        </div>
                      </div>
                      <ConfidenceBadge confidence={edu.confidence} />
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Skills Section */}
          {(parsedCV.skills.categories.length > 0 || parsedCV.skills.raw.length > 0) && (
            <Section
              title="Skills"
              icon={getSectionIcon('skills')}
              isExpanded={expandedSections.has('skills')}
              onToggle={() => toggleSection('skills')}
            >
              {parsedCV.skills.categories.map((category, index) => (
                <div key={index} className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{category.categoryName}</h4>
                    <ConfidenceBadge confidence={category.confidence} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {skill.name}
                        {skill.proficiency && (
                          <span className="ml-1 text-blue-500">({skill.proficiency})</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {parsedCV.skills.raw.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Other Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedCV.skills.raw.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Work Experience Section */}
          {parsedCV.workExperience.length > 0 && (
            <Section
              title={`Work Experience (${parsedCV.workExperience.length})`}
              icon={getSectionIcon('experience')}
              isExpanded={expandedSections.has('experience')}
              onToggle={() => toggleSection('experience')}
            >
              <div className="space-y-4">
                {parsedCV.workExperience.map((exp, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {exp.startDate} - {exp.endDate || 'Present'}
                          {exp.isCurrentRole && (
                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                              Current
                            </span>
                          )}
                        </p>
                      </div>
                      <ConfidenceBadge confidence={exp.confidence} />
                    </div>
                    {exp.responsibilities.length > 0 && (
                      <ul className="mt-3 space-y-1 text-sm text-gray-600">
                        {exp.responsibilities.map((resp, respIndex) => (
                          <li key={respIndex} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {exp.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {exp.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Projects Section */}
          {parsedCV.projects.length > 0 && (
            <Section
              title={`Projects (${parsedCV.projects.length})`}
              icon={getSectionIcon('projects')}
              isExpanded={expandedSections.has('projects')}
              onToggle={() => toggleSection('projects')}
            >
              <div className="space-y-4">
                {parsedCV.projects.map((project, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{project.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                          >
                            {project.url}
                          </a>
                        )}
                      </div>
                      <ConfidenceBadge confidence={project.confidence} />
                    </div>
                    {project.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {project.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Certifications & Courses */}
          {(parsedCV.certifications.length > 0 || parsedCV.courses.length > 0) && (
            <div className="grid grid-cols-2 gap-4">
              {parsedCV.certifications.length > 0 && (
                <Section
                  title={`Certifications (${parsedCV.certifications.length})`}
                  icon={getSectionIcon('certifications')}
                  isExpanded={expandedSections.has('certifications')}
                  onToggle={() => toggleSection('certifications')}
                >
                  <div className="space-y-2">
                    {parsedCV.certifications.map((cert, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <p className="font-medium text-gray-900">{cert.name}</p>
                        <p className="text-gray-600">{cert.issuer}</p>
                        {cert.issueDate && (
                          <p className="text-xs text-gray-500 mt-1">{cert.issueDate}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {parsedCV.courses.length > 0 && (
                <Section
                  title={`Courses (${parsedCV.courses.length})`}
                  icon={getSectionIcon('courses')}
                  isExpanded={expandedSections.has('courses')}
                  onToggle={() => toggleSection('courses')}
                >
                  <div className="space-y-2">
                    {parsedCV.courses.map((course, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <p className="font-medium text-gray-900">{course.name}</p>
                        <p className="text-gray-600">{course.provider}</p>
                        {course.completionDate && (
                          <p className="text-xs text-gray-500 mt-1">{course.completionDate}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="text-sm text-gray-500">
            Parsing took {parsedCV.metadata.parsingDuration}ms • Method:{' '}
            {parsedCV.metadata.parsingMethod}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onApprove}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Use This Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components

function Section({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-blue-600">{icon}</div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isExpanded && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
        {value || '-'}
      </p>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const getColor = (conf: number) => {
    if (conf >= 0.8) return 'bg-green-50 text-green-700 border-green-200';
    if (conf >= 0.6) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const getLabel = (conf: number) => {
    if (conf >= 0.8) return 'High';
    if (conf >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded border ${getColor(confidence)}`}
    >
      {getLabel(confidence)} ({Math.round(confidence * 100)}%)
    </span>
  );
}
