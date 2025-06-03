import { PortfolioFormData } from "../redux/slices/portfolioSlice";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePortfolioStep(
  step: number,
  formData: Partial<PortfolioFormData>
): ValidationResult {
  switch (step) {
    case 1:
      return validateStep1(formData);
    case 2:
      return validateStep2(formData);
    case 3:
      return validateStep3(formData);
    case 4:
      return validateStep4(formData);
    default:
      return { isValid: false, errors: ["Invalid step"] };
  }
}

function validateStep1(formData: Partial<PortfolioFormData>): ValidationResult {
  const errors: string[] = [];

  if (!formData.employeeCode?.trim()) {
    errors.push("Employee code is required");
  }

  if (!formData.designation?.trim()) {
    errors.push("Designation is required");
  }

  if (formData.yearsOfExperience == null || formData.yearsOfExperience < 0) {
    errors.push("Valid years of experience is required");
  }

  if (!formData.nationality?.trim()) {
    errors.push("Nationality is required");
  }

  if (
    !formData.languageProficiency?.length ||
    formData.languageProficiency.some((lang) => !lang.trim())
  ) {
    errors.push("At least one valid language proficiency is required");
  }

  if (!formData.email?.trim()) {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push("Valid email is required");
  }

  if (!formData.mobileNo?.trim()) {
    errors.push("Mobile number is required");
  }

  if (!formData.summary?.trim() || formData.summary.length < 50) {
    errors.push("Professional summary must be at least 50 characters");
  }

  // if (!formData.references?.length) {
  //   errors.push("At least one reference is required");
  // } else {
  //   formData.references.forEach((ref, index) => {
  //     if (!ref.name?.trim()) {
  //       errors.push(`Reference ${index + 1}: Name is required`);
  //     }
  //     if (!ref.contactInfo?.trim()) {
  //       errors.push(`Reference ${index + 1}: Contact info is required`);
  //     }
  //     if (!ref.relationship?.trim()) {
  //       errors.push(`Reference ${index + 1}: Relationship is required`);
  //     }
  //   });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateStep2(formData: Partial<PortfolioFormData>): ValidationResult {
  const errors: string[] = [];

  if (!formData.education?.length) {
    errors.push("At least one education entry is required");
  } else {
    formData.education.forEach((edu, index) => {
      if (!edu.degree?.trim()) {
        errors.push(`Education ${index + 1}: Degree is required`);
      }
      if (!edu.institution?.trim()) {
        errors.push(`Education ${index + 1}: Institution is required`);
      }
      if (
        edu.year == null ||
        edu.year < 1900 ||
        edu.year > new Date().getFullYear() + 10
      ) {
        errors.push(`Education ${index + 1}: Valid year is required`);
      }
    });
  }

  if (formData.certifications?.length) {
    formData.certifications.forEach((cert, index) => {
      if (!cert.name?.trim()) {
        errors.push(`Certification ${index + 1}: Name is required`);
      }
      if (!cert.issuingOrganization?.trim()) {
        errors.push(
          `Certification ${index + 1}: Issuing organization is required`
        );
      }
      if (!cert.year?.trim()) {
        errors.push(`Certification ${index + 1}: Year is required`);
      }
    });
  }

  if (formData.courses?.length) {
    formData.courses.forEach((course, index) => {
      if (!course.name?.trim()) {
        errors.push(`Course ${index + 1}: Name is required`);
      }
      if (!course.provider?.trim()) {
        errors.push(`Course ${index + 1}: Provider is required`);
      }
      if (!course.completionDate?.trim()) {
        errors.push(`Course ${index + 1}: Completion date is required`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateStep3(formData: Partial<PortfolioFormData>): ValidationResult {
  const errors: string[] = [];

  if (!formData.technicalSkills?.length) {
    errors.push("At least one technical skill category is required");
  } else {
    formData.technicalSkills.forEach((skillGroup, index) => {
      if (!skillGroup.category?.trim()) {
        errors.push(`Skill group ${index + 1}: Category is required`);
      }
      if (
        !skillGroup.skills?.length ||
        skillGroup.skills.some((skill) => !skill?.trim())
      ) {
        errors.push(
          `Skill group ${index + 1}: At least one valid skill is required`
        );
      }
      if (!skillGroup.proficiency) {
        errors.push(`Skill group ${index + 1}: Proficiency level is required`);
      }
    });
  }

  if (!formData.workExperience?.length) {
    errors.push("At least one work experience entry is required");
  } else {
    formData.workExperience.forEach((exp, index) => {
      if (!exp.company?.trim()) {
        errors.push(`Work experience ${index + 1}: Company is required`);
      }
      if (!exp.position?.trim()) {
        errors.push(`Work experience ${index + 1}: Position is required`);
      }
      if (!exp.startDate?.trim()) {
        errors.push(`Work experience ${index + 1}: Start date is required`);
      }
      if (!exp.isCurrentRole && !exp.endDate?.trim()) {
        errors.push(
          `Work experience ${index + 1}: End date is required for past roles`
        );
      }
      if (
        !exp.responsibilities?.length ||
        exp.responsibilities.some((resp) => !resp.trim())
      ) {
        errors.push(
          `Work experience ${
            index + 1
          }: At least one valid responsibility is required`
        );
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateStep4(formData: Partial<PortfolioFormData>): ValidationResult {
  const errors: string[] = [];

  if (!formData.projects?.length) {
    errors.push("At least one project is required");
  } else {
    formData.projects.forEach((project, index) => {
      if (!project.name?.trim()) {
        errors.push(`Project ${index + 1}: Name is required`);
      }
      if (!project.description?.trim() || project.description.length < 20) {
        errors.push(
          `Project ${index + 1}: Description must be at least 20 characters`
        );
      }
      if (
        !project.technologies?.length ||
        project.technologies.some((tech) => !tech.trim())
      ) {
        errors.push(
          `Project ${index + 1}: At least one valid technology is required`
        );
      }
      if (!project.startDate?.trim()) {
        errors.push(`Project ${index + 1}: Start date is required`);
      }
      if (!project.isOngoing && !project.endDate?.trim()) {
        errors.push(
          `Project ${index + 1}: End date is required for completed projects`
        );
      }
      if (!project.role?.trim()) {
        errors.push(`Project ${index + 1}: Role is required`);
      }
      if (
        !project.responsibilities?.length ||
        project.responsibilities.some((resp) => !resp.trim())
      ) {
        errors.push(
          `Project ${index + 1}: At least one valid responsibility is required`
        );
      }
      if (project.url && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(project.url)) {
        errors.push(`Project ${index + 1}: Valid URL is required`);
      }
      if (
        project.repository &&
        !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(project.repository)
      ) {
        errors.push(`Project ${index + 1}: Valid repository URL is required`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateAllSteps(
  formData: Partial<PortfolioFormData>
): Record<number, ValidationResult> {
  return {
    1: validateStep1(formData),
    2: validateStep2(formData),
    3: validateStep3(formData),
    4: validateStep4(formData),
  };
}

export function canSubmitPortfolio(
  formData: Partial<PortfolioFormData>
): boolean {
  const validations = validateAllSteps(formData);
  return Object.values(validations).every((validation) => validation.isValid);
}
