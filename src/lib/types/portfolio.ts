import { Timestamp } from "firebase/firestore";

// src/lib/types/portfolio.ts
export interface PersonalInfo {
  employeeCode: string;
  designation: string;
  yearsOfExperience: number;
  nationality: string;
  languageProficiency: Array<{
    language: string;
    proficiency: string;
  }>;
  email: string;
  mobileNo: string;
  profileImage: string; // Base64 string
  summary: string;
}

export interface Reference {
  name: string;
  contactInfo: string;
  relationship: string;
}

export interface Education {
  degree: string;
  institution: string;
  passingYear: string | number;
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  year: string | number;
}

export interface Course {
  name: string;
  provider: string;
  completionDate: string;
}

export interface TechnicalSkill {
  category: string;
  skills: string[];
}

export interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  responsibility: string[];
}

export interface Project {
  name: string;
  description: string;
  contribution: string;
  technologies: string[];
}

export interface Portfolio {
  id?: string;  // Optional since it's only used in public collection
  userId: string;
  nationality: string;
  languageProficiency: Array<{
    language: string;
    proficiency: string;
  }>;
  email?: string;
  mobileNo?: string;
  profileImage?: string;
  designation: string;
  employeeCode: string;
  summary: string;
  yearsOfExperience: number;
  personalInfo: PersonalInfo;
  references: Reference[];
  education: Education[];
  certifications: Certification[];
  courses: Course[];
  technicalSkills: TechnicalSkill[];
  workExperience: WorkExperience[];
  projects: Project[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  visitCount: number;
  isPublic: boolean;
  location?: string;  // Optional since it's used in filters
}

export interface PortfolioFormData {
  step1: {
    personalInfo: PersonalInfo;
    references: Reference[];
  };
  step2: {
    education: Education[];
    certifications: Certification[];
    courses: Course[];
  };
  step3: {
    technicalSkills: TechnicalSkill[];
    workExperience: WorkExperience[];
  };
  step4: {
    projects: Project[];
  };
}

export interface PortfolioState {
  currentPortfolio: Portfolio | null;
  portfolios: Portfolio[];
  formData: PortfolioFormData;
  currentStep: number;
  loading: boolean;
  error: string | null;
  searchResults: Portfolio[];
  filters: PortfolioFilters;
}

// export interface PortfolioFilters {
//   yearsOfExperience?: number;
//   skills?: string[];
//   education?: string;
//   institution?: string;
//   searchQuery?: string;
// }

// Updated PortfolioFilters type
export interface PortfolioFilters {
  searchTerm?: string;
  experienceRange?: {
    min: number;
    max: number;
  };
  skills?: string[];
  nationality?: string[];
  designation?: string[];
  location?: string[];
  // Add pagination support
  page?: number;
  pageSize?: number;
}
