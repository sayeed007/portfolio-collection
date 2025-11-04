/**
 * Unmapped Entity Creator Service
 *
 * Handles creation of entities that were not found during CV ingestion
 * Creates missing degrees, institutions, skills, and categories
 */

import { db } from '@/lib/firebase/config';
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { fuzzyMatch } from '../normalizers';

export interface UnmappedEntities {
  degrees: string[];
  institutions: string[];
  skills: string[];
  skillCategories: string[];
}

export interface EntityCreationResult {
  degreeMap: Map<string, string>; // original name -> ID
  institutionMap: Map<string, string>;
  skillMap: Map<string, string>;
  categoryMap: Map<string, string>;
  created: {
    degrees: number;
    institutions: number;
    skills: number;
    categories: number;
  };
  failed: string[];
}

interface DegreeData {
  name: string;
  shortName: string;
  level: string;
  description: string;
  isActive: boolean;
}

interface InstitutionData {
  name: string;
  shortName?: string;
  type: string;
  location: string;
  division: string;
  isActive: boolean;
  isVerified: boolean;
}

/**
 * Main function to create unmapped entities
 */
export async function createUnmappedEntities(
  unmappedEntities: UnmappedEntities,
): Promise<EntityCreationResult> {
  const result: EntityCreationResult = {
    degreeMap: new Map(),
    institutionMap: new Map(),
    skillMap: new Map(),
    categoryMap: new Map(),
    created: {
      degrees: 0,
      institutions: 0,
      skills: 0,
      categories: 0,
    },
    failed: [],
  };

  try {
    // 1. Create skill categories first (needed for skills)
    if (unmappedEntities.skillCategories.length > 0) {
      const categoryResult = await createSkillCategories(unmappedEntities.skillCategories);
      result.categoryMap = categoryResult.idMap;
      result.created.categories = categoryResult.created;
      result.failed.push(...categoryResult.failed);
    }

    // 2. Create degrees
    if (unmappedEntities.degrees.length > 0) {
      const degreeResult = await createDegrees(unmappedEntities.degrees);
      result.degreeMap = degreeResult.idMap;
      result.created.degrees = degreeResult.created;
      result.failed.push(...degreeResult.failed);
    }

    // 3. Create institutions (as requests for non-admin users)
    if (unmappedEntities.institutions.length > 0) {
      const institutionResult = await createInstitutions(unmappedEntities.institutions);
      result.institutionMap = institutionResult.idMap;
      result.created.institutions = institutionResult.created;
      result.failed.push(...institutionResult.failed);
    }

    // 4. Create skills (now that categories exist)
    if (unmappedEntities.skills.length > 0) {
      // Get all category IDs for skill creation
      const allCategories = await getAllSkillCategories();
      const skillResult = await createSkills(unmappedEntities.skills, allCategories);
      result.skillMap = skillResult.idMap;
      result.created.skills = skillResult.created;
      result.failed.push(...skillResult.failed);
    }

    return result;
  } catch (error) {
    console.error('Error creating unmapped entities:', error);
    throw error;
  }
}

/**
 * Create skill categories
 */
async function createSkillCategories(categoryNames: string[]): Promise<{
  idMap: Map<string, string>;
  created: number;
  failed: string[];
}> {
  const idMap = new Map<string, string>();
  const failed: string[] = [];
  let created = 0;

  // Get existing categories
  const existingCategories = await getAllSkillCategories();

  for (const categoryName of categoryNames) {
    try {
      // Check if already exists (exact or fuzzy match)
      const existing = findExistingCategory(categoryName, existingCategories);

      if (existing) {
        idMap.set(categoryName, existing.id);
        continue;
      }

      // Create new category
      const categoryRef = await addDoc(collection(db, 'skillCategories'), {
        name: categoryName.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      idMap.set(categoryName, categoryRef.id);
      created++;

      // Add to existing categories for next iteration
      existingCategories.push({
        id: categoryRef.id,
        name: categoryName.trim(),
      });
    } catch (error) {
      console.error(`Failed to create category "${categoryName}":`, error);
      failed.push(`Category: ${categoryName}`);
    }
  }

  return { idMap, created, failed };
}

/**
 * Create degrees
 */
async function createDegrees(degreeNames: string[]): Promise<{
  idMap: Map<string, string>;
  created: number;
  failed: string[];
}> {
  const idMap = new Map<string, string>();
  const failed: string[] = [];
  let created = 0;

  // Get existing degrees
  const existingDegrees = await getAllDegrees();

  for (const degreeName of degreeNames) {
    try {
      // Check if already exists
      const existing = findExistingDegree(degreeName, existingDegrees);

      if (existing) {
        idMap.set(degreeName, existing.name); // Use name as value for degrees
        continue;
      }

      // Infer degree data from name
      const degreeData = inferDegreeData(degreeName);

      // Create new degree
      await addDoc(collection(db, 'degrees'), {
        ...degreeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      idMap.set(degreeName, degreeData.name);
      created++;

      // Add to existing degrees for next iteration
      existingDegrees.push({
        id: '', // We don't need the ID for degrees
        name: degreeData.name,
        shortName: degreeData.shortName,
        level: degreeData.level,
      });
    } catch (error) {
      console.error(`Failed to create degree "${degreeName}":`, error);
      failed.push(`Degree: ${degreeName}`);
    }
  }

  return { idMap, created, failed };
}

/**
 * Create institutions (or institution requests)
 */
async function createInstitutions(
  institutionNames: string[],
): Promise<{
  idMap: Map<string, string>;
  created: number;
  failed: string[];
}> {
  const idMap = new Map<string, string>();
  const failed: string[] = [];
  let created = 0;

  // Get existing institutions
  const existingInstitutions = await getAllInstitutions();

  for (const institutionName of institutionNames) {
    try {
      // Check if already exists
      const existing = findExistingInstitution(institutionName, existingInstitutions);

      if (existing) {
        idMap.set(institutionName, existing.name); // Use name as value for institutions
        continue;
      }

      // Infer institution data
      const institutionData = inferInstitutionData(institutionName);

      // Create institution directly from CV data
      // Set isVerified: true since it's from user's own CV
      await addDoc(collection(db, 'institutions'), {
        ...institutionData,
        isActive: true,
        isVerified: true, // Auto-verify CV-extracted institutions
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      idMap.set(institutionName, institutionData.name);
      created++;

      // Add to existing institutions for next iteration
      existingInstitutions.push({
        id: '',
        name: institutionData.name,
        type: institutionData.type,
        location: institutionData.location,
      });
    } catch (error) {
      console.error(`Failed to create institution "${institutionName}":`, error);
      failed.push(`Institution: ${institutionName}`);
    }
  }

  return { idMap, created, failed };
}

/**
 * Create skills
 */
async function createSkills(
  skillNames: string[],
  categories: Array<{ id: string; name: string }>
): Promise<{
  idMap: Map<string, string>;
  created: number;
  failed: string[];
}> {
  const idMap = new Map<string, string>();
  const failed: string[] = [];
  let created = 0;

  // Get existing skills
  const existingSkills = await getAllSkills();

  // Find or create "Other" category for uncategorized skills
  const otherCategory =
    categories.find((c) => c.name.toLowerCase() === 'other') ||
    categories.find((c) => c.name.toLowerCase() === 'others');

  if (!otherCategory) {
    throw new Error('No "Other" category found for skills');
  }

  for (const skillName of skillNames) {
    try {
      // Check if already exists
      const existing = findExistingSkill(skillName, existingSkills);

      if (existing) {
        idMap.set(skillName, existing.id);
        continue;
      }

      // Create new skill in "Other" category
      const skillRef = await addDoc(collection(db, 'skills'), {
        name: skillName.trim(),
        categoryId: otherCategory.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      idMap.set(skillName, skillRef.id);
      created++;

      // Add to existing skills for next iteration
      existingSkills.push({
        id: skillRef.id,
        name: skillName.trim(),
        categoryId: otherCategory.id,
      });
    } catch (error) {
      console.error(`Failed to create skill "${skillName}":`, error);
      failed.push(`Skill: ${skillName}`);
    }
  }

  return { idMap, created, failed };
}

/**
 * Helper: Get all skill categories
 */
async function getAllSkillCategories(): Promise<Array<{ id: string; name: string }>> {
  const snapshot = await getDocs(collection(db, 'skillCategories'));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
  }));
}

/**
 * Helper: Get all degrees
 */
async function getAllDegrees(): Promise<
  Array<{ id: string; name: string; shortName: string; level: string }>
> {
  const q = query(collection(db, 'degrees'), where('isActive', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    shortName: doc.data().shortName,
    level: doc.data().level,
  }));
}

/**
 * Helper: Get all institutions
 */
async function getAllInstitutions(): Promise<
  Array<{ id: string; name: string; type: string; location: string }>
> {
  const q = query(collection(db, 'institutions'), where('isActive', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    type: doc.data().type,
    location: doc.data().location,
  }));
}

/**
 * Helper: Get all skills
 */
async function getAllSkills(): Promise<
  Array<{ id: string; name: string; categoryId: string }>
> {
  const snapshot = await getDocs(collection(db, 'skills'));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    categoryId: doc.data().categoryId,
  }));
}

/**
 * Helper: Find existing category
 */
function findExistingCategory(
  categoryName: string,
  existing: Array<{ id: string; name: string }>
): { id: string; name: string } | null {
  const normalized = categoryName.toLowerCase().trim();

  // Exact match
  for (const cat of existing) {
    if (cat.name.toLowerCase() === normalized) {
      return cat;
    }
  }

  // Fuzzy match
  for (const cat of existing) {
    if (fuzzyMatch(cat.name, categoryName) >= 0.85) {
      return cat;
    }
  }

  return null;
}

/**
 * Helper: Find existing degree
 */
function findExistingDegree(
  degreeName: string,
  existing: Array<{ id: string; name: string; shortName: string; level: string }>
): { id: string; name: string; shortName: string; level: string } | null {
  const normalized = degreeName.toLowerCase().trim();

  // Exact match (name or shortName)
  for (const deg of existing) {
    if (
      deg.name.toLowerCase() === normalized ||
      deg.shortName.toLowerCase() === normalized
    ) {
      return deg;
    }
  }

  // Fuzzy match
  for (const deg of existing) {
    if (
      fuzzyMatch(deg.name, degreeName) >= 0.85 ||
      fuzzyMatch(deg.shortName, degreeName) >= 0.85
    ) {
      return deg;
    }
  }

  return null;
}

/**
 * Helper: Find existing institution
 */
function findExistingInstitution(
  institutionName: string,
  existing: Array<{ id: string; name: string; type: string; location: string }>
): { id: string; name: string; type: string; location: string } | null {
  const normalized = institutionName.toLowerCase().trim();

  // Exact match
  for (const inst of existing) {
    if (inst.name.toLowerCase() === normalized) {
      return inst;
    }
  }

  // Fuzzy match
  for (const inst of existing) {
    if (fuzzyMatch(inst.name, institutionName) >= 0.85) {
      return inst;
    }
  }

  return null;
}

/**
 * Helper: Find existing skill
 */
function findExistingSkill(
  skillName: string,
  existing: Array<{ id: string; name: string; categoryId: string }>
): { id: string; name: string; categoryId: string } | null {
  const normalized = skillName.toLowerCase().trim();

  // Exact match
  for (const skill of existing) {
    if (skill.name.toLowerCase() === normalized) {
      return skill;
    }
  }

  // Fuzzy match
  for (const skill of existing) {
    if (fuzzyMatch(skill.name, skillName) >= 0.9) {
      return skill;
    }
  }

  return null;
}

/**
 * Helper: Infer degree data from name
 */
function inferDegreeData(degreeName: string): DegreeData {
  const name = degreeName.trim();

  // Try to extract short name and infer level
  let shortName = '';
  let level = 'Undergraduate'; // Default

  // Common patterns
  if (name.match(/\(([^)]+)\)/)) {
    const match = name.match(/\(([^)]+)\)/);
    shortName = match ? match[1] : '';
  } else {
    // Try to create abbreviation
    shortName = name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }

  // Infer level
  if (name.toLowerCase().includes('phd') || name.toLowerCase().includes('doctor')) {
    level = 'Postgraduate';
  } else if (name.toLowerCase().includes('master') || name.toLowerCase().includes('msc') || name.toLowerCase().includes('mba')) {
    level = 'Graduate';
  } else if (name.toLowerCase().includes('bachelor') || name.toLowerCase().includes('bsc') || name.toLowerCase().includes('ba')) {
    level = 'Undergraduate';
  } else if (name.toLowerCase().includes('diploma')) {
    level = 'Diploma';
  } else if (name.toLowerCase().includes('certificate')) {
    level = 'Certificate';
  }

  return {
    name,
    shortName: shortName || name.substring(0, 10),
    level,
    description: `${name} degree`,
    isActive: true,
  };
}

/**
 * Helper: Infer institution data from name
 */
function inferInstitutionData(institutionName: string): InstitutionData {
  const name = institutionName.trim();

  // Infer type
  let type = 'University'; // Default

  if (name.toLowerCase().includes('college')) {
    type = 'College';
  } else if (name.toLowerCase().includes('school')) {
    type = 'School';
  } else if (name.toLowerCase().includes('institute')) {
    type = 'Technical Institute';
  }

  return {
    name,
    type,
    location: 'Unknown', // User will need to update
    division: 'Dhaka', // Default - user will need to update
    isActive: true,
    isVerified: false,
  };
}
