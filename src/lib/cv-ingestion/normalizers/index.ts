/**
 * Normalizers for CV Ingestion
 *
 * Maps ParsedCV data to PortfolioFormData format
 * Handles entity ID resolution and data transformation
 */

import { ParsedCV } from '../types';
// Import from Redux slice which has the correct flat structure
import type {
  PortfolioFormData,
  Education,
  Certification,
  Course,
  TechnicalSkill,
  WorkExperience,
  Project,
} from '@/lib/redux/slices/portfolioSlice';

export interface NormalizationResult {
  formData: Partial<PortfolioFormData>;
  unmappedFields: {
    skills: string[]; // Skills that couldn't be mapped
    institutions: string[]; // Institutions not in DB
    degrees: string[]; // Degrees not in DB
  };
  warnings: string[];
}

/**
 * Main normalization function
 */
export async function normalizeParsedCV(
  parsedCV: ParsedCV,
  entityResolver?: EntityResolver
): Promise<NormalizationResult> {
  const warnings: string[] = [];
  const unmappedFields = {
    skills: [] as string[],
    institutions: [] as string[],
    degrees: [] as string[],
  };

  // Normalize personal info
  const personalInfo = normalizePersonalInfo(parsedCV);

  // Normalize education
  const education = await normalizeEducation(
    parsedCV.education,
    entityResolver,
    unmappedFields,
    warnings
  );

  // Normalize certifications
  const certifications = normalizeCertifications(parsedCV.certifications);

  // Normalize courses
  const courses = normalizeCourses(parsedCV.courses);

  // Normalize skills
  const technicalSkills = await normalizeSkills(
    parsedCV.skills,
    entityResolver,
    unmappedFields,
    warnings
  );

  // Normalize work experience
  const workExperience = normalizeWorkExperience(parsedCV.workExperience);

  // Normalize projects
  const projects = normalizeProjects(parsedCV.projects);

  const formData: Partial<PortfolioFormData> = {
    ...personalInfo,
    education,
    certifications,
    courses,
    technicalSkills,
    workExperience,
    projects,
    references: [], // Will be filled manually by user
  };

  return {
    formData,
    unmappedFields,
    warnings,
  };
}

/**
 * Normalize personal info section
 */
function normalizePersonalInfo(
  parsedCV: ParsedCV
): Partial<PortfolioFormData> {
  const { personalInfo } = parsedCV;

  // Extract years of experience from work history
  const yearsOfExperience = calculateYearsOfExperience(parsedCV.workExperience);

  // Try to infer designation from latest job
  const designation =
    parsedCV.workExperience.length > 0
      ? parsedCV.workExperience[0].position
      : 'Software Engineer'; // Default

  return {
    email: personalInfo.email,
    mobileNo: personalInfo.phone,
    nationality: personalInfo.nationality || 'Unknown',
    yearsOfExperience,
    designation,
    summary: personalInfo.summary || '',
    employeeCode: '', // Will be filled manually
    languageProficiency: [
      { language: 'English', proficiency: 'professional' }, // Default
    ],
  };
}

/**
 * Normalize education section
 */
async function normalizeEducation(
  education: ParsedCV['education'],
  entityResolver: EntityResolver | undefined,
  unmappedFields: { degrees: string[]; institutions: string[] },
  warnings: string[]
): Promise<Education[]> {
  const normalized: Education[] = [];

  for (const edu of education) {
    let degreeName = `__UNMAPPED__${edu.degree}`; // Default to unmapped
    let institutionName = `__UNMAPPED__${edu.institution}`; // Default to unmapped

    // Try to resolve entity names if resolver is provided
    if (entityResolver) {
      const degreeMatch = await entityResolver.resolveDegree(edu.degree);
      if (degreeMatch.matched && degreeMatch.entity) {
        degreeName = degreeMatch.entity.name;
      } else {
        unmappedFields.degrees.push(edu.degree);
        warnings.push(`Degree "${edu.degree}" not found in database, will be created`);
      }

      const institutionMatch = await entityResolver.resolveInstitution(edu.institution);
      if (institutionMatch.matched && institutionMatch.entity) {
        institutionName = institutionMatch.entity.name;
      } else {
        unmappedFields.institutions.push(edu.institution);
        warnings.push(`Institution "${edu.institution}" not found in database, will be created`);
      }
    }

    normalized.push({
      degree: degreeName,
      institution: institutionName,
      passingYear:
        typeof edu.graduationYear === 'number'
          ? edu.graduationYear
          : parseInt(edu.graduationYear as string, 10) || new Date().getFullYear(),
      grade: edu.grade,
    });
  }

  return normalized;
}

/**
 * Normalize certifications
 */
function normalizeCertifications(certifications: ParsedCV['certifications']): Certification[] {
  return certifications.map(cert => ({
    name: cert.name,
    issuer: cert.issuer,
    date: cert.issueDate || '',
    issuingOrganization: cert.issuer,
    year: cert.issueDate ? new Date(cert.issueDate).getFullYear().toString() : '',
    expiryDate: cert.expiryDate,
    credentialId: cert.credentialId,
  }));
}

/**
 * Normalize courses
 */
function normalizeCourses(courses: ParsedCV['courses']): Course[] {
  return courses.map(course => ({
    name: course.name,
    provider: course.provider,
    completionDate: course.completionDate || '',
    duration: course.duration,
  }));
}

/**
 * Normalize skills with entity resolution
 */
async function normalizeSkills(
  skills: ParsedCV['skills'],
  entityResolver: EntityResolver | undefined,
  unmappedFields: { skills: string[] },
  warnings: string[]
): Promise<TechnicalSkill[]> {
  const technicalSkills: TechnicalSkill[] = [];

  // Process categorized skills
  for (const category of skills.categories) {
    const skillsForCategory: Array<{ skillId: string; proficiency: any }> = [];

    for (const skill of category.skills) {
      if (entityResolver) {
        const skillMatch = await entityResolver.resolveSkill(skill.name, category.categoryName);

        if (skillMatch.matched && skillMatch.entity) {
          // Skill found - use the database ID
          skillsForCategory.push({
            skillId: skillMatch.entity.id,
            proficiency: skill.proficiency || 'Intermediate',
          });
        } else {
          // Skill NOT found - use name as temporary ID (will be remapped later)
          skillsForCategory.push({
            skillId: `__UNMAPPED__${skill.name}`, // Prefix to indicate it needs remapping
            proficiency: skill.proficiency || 'Intermediate',
          });
          unmappedFields.skills.push(skill.name);
          warnings.push(`Skill "${skill.name}" not found in database`);
        }
      } else {
        // Without resolver, use skill name directly (will need manual mapping)
        skillsForCategory.push({
          skillId: `__UNMAPPED__${skill.name}`, // Prefix to indicate it needs remapping
          proficiency: skill.proficiency || 'Intermediate',
        });
      }
    }

    if (skillsForCategory.length > 0) {
      // Resolve category ID
      let categoryId = `__UNMAPPED__${category.categoryName}`; // Default to unmapped

      if (entityResolver) {
        const categoryMatch = await entityResolver.resolveSkillCategory(category.categoryName);
        if (categoryMatch.matched && categoryMatch.entity) {
          categoryId = categoryMatch.entity.id;
        } else {
          warnings.push(`Category "${category.categoryName}" not found, will be created`);
        }
      }

      technicalSkills.push({
        category: categoryId,
        skills: skillsForCategory,
      });
    }
  }

  // Process raw (uncategorized) skills
  if (skills.raw.length > 0 && entityResolver) {
    const uncategorizedSkills: Array<{ skillId: string; proficiency: any }> = [];

    for (const skillName of skills.raw) {
      const skillMatch = await entityResolver.resolveSkill(skillName);

      if (skillMatch.matched && skillMatch.entity) {
        uncategorizedSkills.push({
          skillId: skillMatch.entity.id,
          proficiency: 'Intermediate',
        });
      } else {
        unmappedFields.skills.push(skillName);
      }
    }

    if (uncategorizedSkills.length > 0) {
      // Get or create "Other" category
      const otherCategoryMatch = await entityResolver.resolveSkillCategory('Other');
      const categoryId = otherCategoryMatch.entity?.id || 'other';

      technicalSkills.push({
        category: categoryId,
        skills: uncategorizedSkills,
      });
    }
  }

  return technicalSkills;
}

/**
 * Normalize work experience
 */
function normalizeWorkExperience(experience: ParsedCV['workExperience']): WorkExperience[] {
  return experience.map(exp => ({
    company: exp.company,
    position: exp.position,
    startDate: exp.startDate,
    endDate: exp.endDate,
    isCurrentRole: exp.isCurrentRole,
    responsibilities: exp.responsibilities,
    technologies: exp.technologies,
  }));
}

/**
 * Normalize projects
 */
function normalizeProjects(projects: ParsedCV['projects']): Project[] {
  return projects.map(proj => ({
    name: proj.name,
    description: proj.description,
    contribution: proj.contribution || proj.description,
    technologies: proj.technologies,
    startDate: proj.startDate,
    endDate: proj.endDate,
    isOngoing: proj.isOngoing,
    role: proj.role,
    url: proj.url,
    repository: proj.repository,
  }));
}

/**
 * Calculate years of experience from work history
 */
function calculateYearsOfExperience(workExperience: ParsedCV['workExperience']): number {
  if (workExperience.length === 0) return 0;

  // Sum up all work durations
  let totalMonths = 0;

  for (const exp of workExperience) {
    const startDate = new Date(exp.startDate);
    const endDate = exp.endDate ? new Date(exp.endDate) : new Date();

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const months =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());

      totalMonths += Math.max(0, months);
    }
  }

  return Math.floor(totalMonths / 12);
}

/**
 * Entity Resolver Interface
 * Implement this to connect with your database/hooks
 */
export interface EntityResolver {
  resolveDegree(degreeName: string): Promise<{
    matched: boolean;
    entity?: { id: string; name: string; shortName: string; level: string };
  }>;

  resolveInstitution(institutionName: string): Promise<{
    matched: boolean;
    entity?: { id: string; name: string; type: string; location: string };
  }>;

  resolveSkill(
    skillName: string,
    categoryHint?: string
  ): Promise<{
    matched: boolean;
    entity?: { id: string; name: string; categoryId: string; categoryName: string };
  }>;

  resolveSkillCategory(categoryName: string): Promise<{
    matched: boolean;
    entity?: { id: string; name: string };
  }>;
}

/**
 * Fuzzy string matching utility
 */
export function fuzzyMatch(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  // Exact match
  if (s1 === s2) return 1.0;

  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  // Levenshtein distance
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  const similarity = 1 - distance / maxLength;

  return similarity;
}

/**
 * Levenshtein distance algorithm
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
