/**
 * CV Ingestion Type Definitions
 *
 * These types represent the intermediate format after parsing a CV
 * but before mapping to PortfolioFormData
 */

export interface ParsedCV {
  personalInfo: ParsedPersonalInfo;
  education: ParsedEducation[];
  certifications: ParsedCertification[];
  courses: ParsedCourse[];
  skills: ParsedSkills;
  workExperience: ParsedWorkExperience[];
  projects: ParsedProject[];
  metadata: CVMetadata;
}

export interface ParsedPersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location?: string;
  nationality?: string;
  summary?: string;
  linkedIn?: string;
  github?: string;
  website?: string;
  profileImage?: string; // base64
}

export interface ParsedEducation {
  degree: string;
  institution: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  graduationYear: number | string;
  grade?: string;
  gpa?: string;
  fieldOfStudy?: string;
  confidence: number; // 0-1
}

export interface ParsedCertification {
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  confidence: number;
}

export interface ParsedCourse {
  name: string;
  provider: string;
  completionDate?: string;
  duration?: string;
  certificateUrl?: string;
  confidence: number;
}

export interface ParsedSkills {
  categories: ParsedSkillCategory[];
  raw: string[]; // Unparsed skill names
}

export interface ParsedSkillCategory {
  categoryName: string;
  skills: ParsedSkill[];
  confidence: number;
}

export interface ParsedSkill {
  name: string;
  proficiency?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience?: number;
  confidence: number;
}

export interface ParsedWorkExperience {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrentRole: boolean;
  responsibilities: string[];
  achievements?: string[];
  technologies: string[];
  confidence: number;
}

export interface ParsedProject {
  name: string;
  description: string;
  role?: string;
  contribution?: string;
  technologies: string[];
  startDate?: string;
  endDate?: string;
  isOngoing?: boolean;
  url?: string;
  repository?: string;
  achievements?: string[];
  confidence: number;
}

export interface CVMetadata {
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'doc';
  fileSize: number;
  uploadedAt: Date;
  parsingMethod: 'deterministic' | 'llm' | 'hybrid';
  parsingDuration: number; // milliseconds
  totalConfidence: number; // average confidence across all sections
  warnings: string[];
  errors: string[];
}

/**
 * Raw extracted text structure before parsing
 */
export interface ExtractedText {
  fullText: string;
  sections: ExtractedSection[];
  metadata: {
    pageCount?: number;
    wordCount: number;
    hasImages: boolean;
  };
}

export interface ExtractedSection {
  heading: string;
  content: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Entity matching/resolution types
 */
export interface EntityMatch<T = any> {
  matched: boolean;
  entity?: T;
  matchConfidence: number;
  matchType: 'exact' | 'fuzzy' | 'created';
  suggestions?: T[];
}

export interface SkillMatch extends EntityMatch {
  entity?: {
    id: string;
    name: string;
    categoryId: string;
    categoryName: string;
  };
}

export interface InstitutionMatch extends EntityMatch {
  entity?: {
    id: string;
    name: string;
    type: string;
    location: string;
  };
}

export interface DegreeMatch extends EntityMatch {
  entity?: {
    id: string;
    name: string;
    shortName: string;
    level: string;
  };
}

/**
 * Validation and review types
 */
export interface CVValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  completeness: number; // 0-100%
  qualityScore: number; // 0-100%
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

/**
 * Review/Edit state for user confirmation
 */
export interface CVReviewState {
  parsedCV: ParsedCV;
  validationResult: CVValidationResult;
  userEdits: Partial<ParsedCV>;
  approvedSections: {
    personalInfo: boolean;
    education: boolean;
    skills: boolean;
    experience: boolean;
    projects: boolean;
  };
  entityMappings: {
    skills: Map<string, SkillMatch>;
    institutions: Map<string, InstitutionMatch>;
    degrees: Map<string, DegreeMatch>;
  };
}

/**
 * Parser configuration
 */
export interface ParserConfig {
  useLLM: boolean;
  llmProvider?: 'openai' | 'anthropic' | 'gemini';
  apiKey?: string;
  fallbackToDeterministic: boolean;
  enableOCR: boolean;
  confidenceThreshold: number; // 0-1
  debugMode: boolean;
}

/**
 * Parsing result with status
 */
export interface CVParsingResult {
  success: boolean;
  data?: ParsedCV;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  warnings: string[];
}
