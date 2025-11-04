/**
 * Entity Remapper Service
 *
 * Re-maps form data after entities have been created
 * Resolves skill IDs, category IDs, degree names, and institution names
 */

import { DatabaseEntityResolver } from './entity-resolver';
import type { PortfolioFormData } from '@/lib/redux/slices/portfolioSlice';
import { ParsedCV } from '../types';

export interface RemapResult {
  formData: Partial<PortfolioFormData>;
  remainingUnmapped: {
    skills: string[];
    categories: string[];
    degrees: string[];
    institutions: string[];
  };
}

/**
 * Re-map form data with a refreshed entity resolver
 * This should be called AFTER creating unmapped entities
 */
export async function remapFormDataWithEntities(
  formData: Partial<PortfolioFormData>,
  parsedCV: ParsedCV,
  entityResolver: DatabaseEntityResolver
): Promise<RemapResult> {
  const remainingUnmapped = {
    skills: [] as string[],
    categories: [] as string[],
    degrees: [] as string[],
    institutions: [] as string[],
  };

  // Reload entities to get newly created ones
  const { fetchDegrees, fetchInstitutions, fetchSkills, fetchSkillCategories } =
    await import('./entity-resolver').then((m) => m.fetchEntitiesFromFirestore());

  await entityResolver.loadEntities({
    fetchDegrees,
    fetchInstitutions,
    fetchSkills,
    fetchSkillCategories,
  });

  // Clone form data
  const updatedFormData = JSON.parse(JSON.stringify(formData));

  // 1. Re-map education
  if (updatedFormData.education && Array.isArray(updatedFormData.education)) {
    const updatedEducation = [];

    for (let i = 0; i < updatedFormData.education.length; i++) {
      const edu = updatedFormData.education[i];
      const parsedEdu = parsedCV.education[i];

      if (!parsedEdu) {
        updatedEducation.push(edu);
        continue;
      }

      // Extract degree name from __UNMAPPED__ prefix
      const degreeName = edu.degree.startsWith('__UNMAPPED__')
        ? edu.degree.replace('__UNMAPPED__', '')
        : edu.degree;

      // Extract institution name from __UNMAPPED__ prefix
      const institutionName = edu.institution.startsWith('__UNMAPPED__')
        ? edu.institution.replace('__UNMAPPED__', '')
        : edu.institution;

      let finalDegreeName = edu.degree;
      let finalInstitutionName = edu.institution;

      // Re-resolve degree if it was unmapped
      if (edu.degree.startsWith('__UNMAPPED__')) {
        const degreeMatch = await entityResolver.resolveDegree(degreeName);
        if (degreeMatch.matched && degreeMatch.entity) {
          finalDegreeName = degreeMatch.entity.name;
        } else {
          remainingUnmapped.degrees.push(degreeName);
          finalDegreeName = degreeName; // Remove prefix even if not found
        }
      }

      // Re-resolve institution if it was unmapped
      if (edu.institution.startsWith('__UNMAPPED__')) {
        const institutionMatch = await entityResolver.resolveInstitution(institutionName);
        if (institutionMatch.matched && institutionMatch.entity) {
          finalInstitutionName = institutionMatch.entity.name;
        } else {
          remainingUnmapped.institutions.push(institutionName);
          finalInstitutionName = institutionName; // Remove prefix even if not found
        }
      }

      updatedEducation.push({
        ...edu,
        degree: finalDegreeName,
        institution: finalInstitutionName,
      });
    }

    updatedFormData.education = updatedEducation;
  }

  // 2. Re-map technical skills
  if (updatedFormData.technicalSkills && Array.isArray(updatedFormData.technicalSkills)) {
    const updatedTechnicalSkills = [];

    for (const techSkill of updatedFormData.technicalSkills) {
      // Extract category name from ID (handle __UNMAPPED__ prefix)
      const categoryName = techSkill.category.startsWith('__UNMAPPED__')
        ? techSkill.category.replace('__UNMAPPED__', '')
        : techSkill.category;

      // Find the corresponding parsed skill category
      const parsedCategory = parsedCV.skills.categories.find(
        (cat) =>
          cat.categoryName.toLowerCase() === categoryName.toLowerCase() ||
          cat.categoryName === categoryName ||
          cat.categoryName === techSkill.category
      );

      if (!parsedCategory) {
        // Category not found in parsed data, try to resolve what we have
        if (techSkill.category.startsWith('__UNMAPPED__')) {
          const categoryMatch = await entityResolver.resolveSkillCategory(categoryName);
          if (categoryMatch.matched && categoryMatch.entity) {
            techSkill.category = categoryMatch.entity.id;
          }
        }
        updatedTechnicalSkills.push(techSkill);
        continue;
      }

      // Re-resolve category
      const categoryMatch = await entityResolver.resolveSkillCategory(parsedCategory.categoryName);
      const categoryId = categoryMatch.matched && categoryMatch.entity
        ? categoryMatch.entity.id
        : techSkill.category;

      if (!categoryMatch.matched) {
        remainingUnmapped.categories.push(parsedCategory.categoryName);
      }

      // Re-resolve skills
      const updatedSkills = [];

      for (let i = 0; i < techSkill.skills.length; i++) {
        const skill = techSkill.skills[i];

        // Extract skill name from ID (handle __UNMAPPED__ prefix)
        const skillName = skill.skillId.startsWith('__UNMAPPED__')
          ? skill.skillId.replace('__UNMAPPED__', '')
          : skill.skillId;

        // Find corresponding parsed skill by name
        const parsedSkill = parsedCategory.skills.find(
          (ps) => ps.name.toLowerCase() === skillName.toLowerCase()
        ) || parsedCategory.skills[i];

        if (!parsedSkill) {
          // No parsed skill found, try to resolve what we have if unmapped
          if (skill.skillId.startsWith('__UNMAPPED__')) {
            const skillMatch = await entityResolver.resolveSkill(
              skillName,
              parsedCategory.categoryName
            );
            if (skillMatch.matched && skillMatch.entity) {
              updatedSkills.push({
                ...skill,
                skillId: skillMatch.entity.id,
              });
            } else {
              updatedSkills.push(skill);
            }
          } else {
            updatedSkills.push(skill);
          }
          continue;
        }

        // Try to resolve the skill
        const skillMatch = await entityResolver.resolveSkill(
          parsedSkill.name,
          parsedCategory.categoryName
        );

        if (skillMatch.matched && skillMatch.entity) {
          updatedSkills.push({
            ...skill,
            skillId: skillMatch.entity.id,
          });
        } else {
          // Still not found, keep original
          remainingUnmapped.skills.push(parsedSkill.name);
          updatedSkills.push(skill);
        }
      }

      updatedTechnicalSkills.push({
        ...techSkill,
        category: categoryId,
        skills: updatedSkills,
      });
    }

    updatedFormData.technicalSkills = updatedTechnicalSkills;
  }

  return {
    formData: updatedFormData,
    remainingUnmapped,
  };
}
