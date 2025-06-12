// src/lib/utils/validation.ts
import { z } from "zod";
import { Education, Portfolio, Reference } from "../types";

// Zod schemas for form validation
export const registerSchema = z
  .object({
    displayName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .min(1, "Email is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

// Keep existing validation functions for backward compatibility
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[]; // Changed to string[] to match usage in components
}

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Phone number validation
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Year validation
export const validateYear = (year: string | number): boolean => {
  const yearNum = typeof year === "string" ? parseInt(year) : year;
  const currentYear = new Date().getFullYear();
  return yearNum >= 1900 && yearNum <= currentYear + 10;
};

// Image validation
export const validateImage = (base64String: string): ValidationResult => {
  const errors: string[] = [];

  if (!base64String.startsWith("data:image/")) {
    errors.push("Invalid image format");
  }

  // Check file size (1MB = 1,048,576 bytes)
  const base64Data = base64String.split(",")[1];
  const binaryString = atob(base64Data);
  const bytes = binaryString.length;

  if (bytes > 1048576) {
    errors.push("Image size must be less than 1MB");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Personal Information validation
export const validatePersonalInfo = (data: Portfolio): ValidationResult => {
  const errors: string[] = [];

  if (!data.employeeCode?.trim()) {
    errors.push("Employee code is required");
  }

  if (!data.designation?.trim()) {
    errors.push("Designation is required");
  }

  if (!data.yearsOfExperience || data.yearsOfExperience < 0) {
    errors.push("Valid years of experience is required");
  }

  if (!data.nationality?.trim()) {
    errors.push("Nationality is required");
  }

  if (!data.email?.trim() || !validateEmail(data.email)) {
    errors.push("Valid email is required");
  }

  if (!data.mobileNo?.trim() || !validatePhoneNumber(data.mobileNo)) {
    errors.push("Valid mobile number is required");
  }

  if (!data.summary?.trim() || data.summary.length < 50) {
    errors.push("Professional summary must be at least 50 characters");
  }

  if (
    !data.languageProficiency ||
    data.languageProficiency.length === 0 ||
    data.languageProficiency.every((lang: string) => !lang?.trim())
  ) {
    errors.push("At least one language proficiency is required");
  }

  if (!data.references || data.references.length === 0) {
    errors.push("At least one reference is required");
  } else {
    data.references.forEach((ref: Reference, index: number) => {
      if (!ref.name?.trim()) {
        errors.push(`Reference ${index + 1}: Name is required`);
      }
      if (!ref.contactInfo?.trim()) {
        errors.push(`Reference ${index + 1}: Contact info is required`);
      }
      if (!ref.relationship?.trim()) {
        errors.push(`Reference ${index + 1}: Relationship is required`);
      }
    });
  }

  if (data.profileImage && !validateImage(data.profileImage).isValid) {
    errors.push("Valid profile image is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Education validation
export const validateEducation = (education: Education[]): ValidationResult => {
  const errors: string[] = [];

  if (!education || education.length === 0) {
    errors.push("At least one education entry is required");
    return { isValid: false, errors };
  }

  education.forEach((edu, index) => {
    if (!edu.degree?.trim()) {
      errors.push(`Education ${index + 1}: Degree is required`);
    }

    if (!edu.institution?.trim()) {
      errors.push(`Education ${index + 1}: Institution is required`);
    }

    if (!edu.passingYear || !validateYear(edu.passingYear)) {
      errors.push(`Education ${index + 1}: Valid passing year is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Skills validation - Updated to match your Step3 structure
export const validateSkills = (data: any): ValidationResult => {
  const errors: string[] = [];

  // Check if technicalSkills exists and has at least one entry
  if (!data.technicalSkills || data.technicalSkills.length === 0) {
    errors.push("At least one technical skill category is required");
    return { isValid: false, errors };
  }

  // Validate each technical skill category
  data.technicalSkills.forEach((skillCategory: any, index: number) => {
    if (!skillCategory.category?.trim()) {
      errors.push(`Technical Skill ${index + 1}: Category is required`);
    }

    if (!skillCategory.proficiency?.trim()) {
      errors.push(`Technical Skill ${index + 1}: Proficiency level is required`);
    }

    if (!skillCategory.skills || skillCategory.skills.length === 0) {
      errors.push(`Technical Skill ${index + 1}: At least one skill is required`);
    } else {
      // Check if all skills in the category are non-empty
      const validSkills = skillCategory.skills.filter((skill: string) => skill?.trim());
      if (validSkills.length === 0) {
        errors.push(`Technical Skill ${index + 1}: At least one non-empty skill is required`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};


// Work Experience validation - Updated to match your Step3 structure
export const validateWorkExperience = (experience: any[]): ValidationResult => {
  const errors: string[] = [];

  if (!experience || experience.length === 0) {
    errors.push("At least one work experience entry is required");
    return { isValid: false, errors };
  }

  experience.forEach((exp, index) => {
    if (!exp.company?.trim()) {
      errors.push(`Work Experience ${index + 1}: Company name is required`);
    }

    if (!exp.position?.trim()) {
      errors.push(`Work Experience ${index + 1}: Position is required`);
    }

    if (!exp.startDate?.trim()) {
      errors.push(`Work Experience ${index + 1}: Start date is required`);
    }

    // Validate end date only if it's not a current role
    if (!exp.isCurrentRole && !exp.endDate?.trim()) {
      errors.push(`Work Experience ${index + 1}: End date is required (or mark as current role)`);
    }

    // Validate responsibilities
    if (!exp.responsibilities || exp.responsibilities.length === 0) {
      errors.push(`Work Experience ${index + 1}: At least one responsibility is required`);
    } else {
      const validResponsibilities = exp.responsibilities.filter((resp: string) => resp?.trim());
      if (validResponsibilities.length === 0) {
        errors.push(`Work Experience ${index + 1}: At least one non-empty responsibility is required`);
      }
    }

    // Validate technologies (optional but if provided, should have at least one non-empty)
    if (exp.technologies && exp.technologies.length > 0) {
      const validTechnologies = exp.technologies.filter((tech: string) => tech?.trim());
      if (validTechnologies.length === 0) {
        errors.push(`Work Experience ${index + 1}: If technologies are provided, at least one must be non-empty`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};


// Projects validation
export const validateProjects = (projects: any[]): ValidationResult => {
  const errors: string[] = [];

  if (!projects || projects.length === 0) {
    errors.push("At least one project is required");
    return { isValid: false, errors };
  }

  projects.forEach((project, index) => {
    if (!project.name?.trim()) {
      errors.push(`Project ${index + 1}: Project name is required`);
    }

    if (!project.description?.trim()) {
      errors.push(`Project ${index + 1}: Project description is required`);
    }

    if (!project.contribution?.trim()) {
      errors.push(`Project ${index + 1}: Contribution is required`);
    }

    if (
      !project.technologies ||
      project.technologies.length === 0 ||
      project.technologies.every((tech: string) => !tech?.trim())
    ) {
      errors.push(`Project ${index + 1}: At least one technology is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Updated step validation for Step 3
export const validatePortfolioStep = (
  step: number,
  formData: any
): ValidationResult => {
  switch (step) {
    case 1:
      return validatePersonalInfo(formData);
    case 2:
      return validateEducation(formData.education || []);
    case 3:
      // Validate both skills and work experience for step 3
      const skillsResult = validateSkills(formData);
      const workExpResult = validateWorkExperience(formData.workExperience || []);

      return {
        isValid: skillsResult.isValid && workExpResult.isValid,
        errors: [...skillsResult.errors, ...workExpResult.errors],
      };
    case 4:
      return validateProjects(formData.projects || []);
    default:
      return { isValid: false, errors: ["Invalid step"] };
  }
};

// Complete portfolio validation
export const validatePortfolio = (portfolio: any): ValidationResult => {
  const errors: string[] = [];

  // Validate personal info
  const personalInfoResult = validatePersonalInfo(portfolio);
  errors.push(...personalInfoResult.errors);

  // Validate education if provided
  if (portfolio.education && portfolio.education.length > 0) {
    const educationResult = validateEducation(portfolio.education);
    errors.push(...educationResult.errors);
  }

  // Validate skills
  const skillsResult = validateSkills(portfolio);
  errors.push(...skillsResult.errors);

  // Validate work experience if provided
  if (portfolio.workExperience && portfolio.workExperience.length > 0) {
    const workExpResult = validateWorkExperience(portfolio.workExperience);
    errors.push(...workExpResult.errors);
  }

  // Validate projects if provided
  if (portfolio.projects && portfolio.projects.length > 0) {
    const projectsResult = validateProjects(portfolio.projects);
    errors.push(...projectsResult.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
