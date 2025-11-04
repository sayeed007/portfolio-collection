/**
 * Entity Resolver Service
 *
 * Resolves CV text entities (skills, degrees, institutions) to database IDs
 * Uses fuzzy matching and existing hooks for data fetching
 */

import { EntityResolver, fuzzyMatch } from '../normalizers';

interface Degree {
  id: string;
  name: string;
  shortName: string;
  level: string;
}

interface Institution {
  id: string;
  name: string;
  type: string;
  location: string;
  division?: string;
}

interface Skill {
  id: string;
  name: string;
  categoryId: string;
}

interface SkillCategory {
  id: string;
  name: string;
}

export class DatabaseEntityResolver implements EntityResolver {
  private degrees: Degree[] = [];
  private institutions: Institution[] = [];
  private skills: Skill[] = [];
  private skillCategories: SkillCategory[] = [];

  private matchThreshold = 0.75; // 75% similarity required for fuzzy match

  constructor(config?: { matchThreshold?: number }) {
    if (config?.matchThreshold) {
      this.matchThreshold = config.matchThreshold;
    }
  }

  /**
   * Load entities from database
   * Call this before resolving entities
   */
  async loadEntities(fetchers: {
    fetchDegrees: () => Promise<Degree[]>;
    fetchInstitutions: () => Promise<Institution[]>;
    fetchSkills: () => Promise<Skill[]>;
    fetchSkillCategories: () => Promise<SkillCategory[]>;
  }): Promise<void> {
    [this.degrees, this.institutions, this.skills, this.skillCategories] = await Promise.all([
      fetchers.fetchDegrees(),
      fetchers.fetchInstitutions(),
      fetchers.fetchSkills(),
      fetchers.fetchSkillCategories(),
    ]);
  }

  /**
   * Resolve degree by name
   */
  async resolveDegree(degreeName: string): Promise<{
    matched: boolean;
    entity?: Degree;
    matchConfidence?: number;
  }> {
    // Try exact match first
    const exactMatch = this.degrees.find(
      d =>
        d.name.toLowerCase() === degreeName.toLowerCase() ||
        d.shortName.toLowerCase() === degreeName.toLowerCase()
    );

    if (exactMatch) {
      return { matched: true, entity: exactMatch, matchConfidence: 1.0 };
    }

    // Try fuzzy match
    const fuzzyMatches = this.degrees
      .map(degree => ({
        degree,
        similarity: Math.max(
          fuzzyMatch(degree.name, degreeName),
          fuzzyMatch(degree.shortName, degreeName)
        ),
      }))
      .filter(match => match.similarity >= this.matchThreshold)
      .sort((a, b) => b.similarity - a.similarity);

    if (fuzzyMatches.length > 0) {
      return {
        matched: true,
        entity: fuzzyMatches[0].degree,
        matchConfidence: fuzzyMatches[0].similarity,
      };
    }

    return { matched: false };
  }

  /**
   * Resolve institution by name
   */
  async resolveInstitution(institutionName: string): Promise<{
    matched: boolean;
    entity?: Institution;
    matchConfidence?: number;
  }> {
    // Try exact match
    const exactMatch = this.institutions.find(
      inst =>
        inst.name.toLowerCase() === institutionName.toLowerCase() ||
        inst.name.toLowerCase().includes(institutionName.toLowerCase()) ||
        institutionName.toLowerCase().includes(inst.name.toLowerCase())
    );

    if (exactMatch) {
      return { matched: true, entity: exactMatch, matchConfidence: 1.0 };
    }

    // Try fuzzy match
    const fuzzyMatches = this.institutions
      .map(institution => ({
        institution,
        similarity: fuzzyMatch(institution.name, institutionName),
      }))
      .filter(match => match.similarity >= this.matchThreshold)
      .sort((a, b) => b.similarity - a.similarity);

    if (fuzzyMatches.length > 0) {
      return {
        matched: true,
        entity: fuzzyMatches[0].institution,
        matchConfidence: fuzzyMatches[0].similarity,
      };
    }

    return { matched: false };
  }

  /**
   * Resolve skill by name with optional category hint
   */
  async resolveSkill(
    skillName: string,
    categoryHint?: string
  ): Promise<{
    matched: boolean;
    entity?: { id: string; name: string; categoryId: string; categoryName: string };
    matchConfidence?: number;
  }> {
    // Filter skills by category if hint is provided
    let candidateSkills = this.skills;

    if (categoryHint) {
      const category = await this.resolveSkillCategory(categoryHint);
      if (category.matched && category.entity) {
        candidateSkills = this.skills.filter(s => s.categoryId === category.entity!.id);
      }
    }

    // Try exact match
    const exactMatch = candidateSkills.find(
      skill => skill.name.toLowerCase() === skillName.toLowerCase()
    );

    if (exactMatch) {
      const category = this.skillCategories.find(c => c.id === exactMatch.categoryId);
      return {
        matched: true,
        entity: {
          id: exactMatch.id,
          name: exactMatch.name,
          categoryId: exactMatch.categoryId,
          categoryName: category?.name || 'Other',
        },
        matchConfidence: 1.0,
      };
    }

    // Try fuzzy match
    const fuzzyMatches = candidateSkills
      .map(skill => ({
        skill,
        similarity: fuzzyMatch(skill.name, skillName),
      }))
      .filter(match => match.similarity >= this.matchThreshold)
      .sort((a, b) => b.similarity - a.similarity);

    if (fuzzyMatches.length > 0) {
      const match = fuzzyMatches[0].skill;
      const category = this.skillCategories.find(c => c.id === match.categoryId);

      return {
        matched: true,
        entity: {
          id: match.id,
          name: match.name,
          categoryId: match.categoryId,
          categoryName: category?.name || 'Other',
        },
        matchConfidence: fuzzyMatches[0].similarity,
      };
    }

    return { matched: false };
  }

  /**
   * Resolve skill category by name
   */
  async resolveSkillCategory(categoryName: string): Promise<{
    matched: boolean;
    entity?: SkillCategory;
    matchConfidence?: number;
  }> {
    // Try exact match
    const exactMatch = this.skillCategories.find(
      cat => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (exactMatch) {
      return { matched: true, entity: exactMatch, matchConfidence: 1.0 };
    }

    // Try fuzzy match
    const fuzzyMatches = this.skillCategories
      .map(category => ({
        category,
        similarity: fuzzyMatch(category.name, categoryName),
      }))
      .filter(match => match.similarity >= this.matchThreshold)
      .sort((a, b) => b.similarity - a.similarity);

    if (fuzzyMatches.length > 0) {
      return {
        matched: true,
        entity: fuzzyMatches[0].category,
        matchConfidence: fuzzyMatches[0].similarity,
      };
    }

    // Fallback: try common category mappings
    const categoryMapping: Record<string, string> = {
      frontend: 'Frontend',
      backend: 'Backend',
      'front-end': 'Frontend',
      'back-end': 'Backend',
      database: 'Databases',
      databases: 'Databases',
      devops: 'DevOps',
      'dev ops': 'DevOps',
      cloud: 'Cloud',
      mobile: 'Mobile',
      testing: 'Testing',
      qa: 'Testing',
      design: 'Design',
      tools: 'Tools',
      framework: 'Frameworks',
      frameworks: 'Frameworks',
      library: 'Libraries',
      libraries: 'Libraries',
      language: 'Languages',
      languages: 'Languages',
      'programming languages': 'Languages',
    };

    const mappedName = categoryMapping[categoryName.toLowerCase()];
    if (mappedName) {
      const mappedMatch = this.skillCategories.find(
        cat => cat.name.toLowerCase() === mappedName.toLowerCase()
      );
      if (mappedMatch) {
        return { matched: true, entity: mappedMatch, matchConfidence: 0.8 };
      }
    }

    return { matched: false };
  }

  /**
   * Get all available degrees
   */
  getDegrees(): Degree[] {
    return this.degrees;
  }

  /**
   * Get all available institutions
   */
  getInstitutions(): Institution[] {
    return this.institutions;
  }

  /**
   * Get all available skills
   */
  getSkills(): Skill[] {
    return this.skills;
  }

  /**
   * Get all available skill categories
   */
  getSkillCategories(): SkillCategory[] {
    return this.skillCategories;
  }

  /**
   * Get suggestions for unmapped entity
   */
  getSuggestions(
    entityType: 'degree' | 'institution' | 'skill' | 'category',
    searchTerm: string,
    limit: number = 5
  ): any[] {
    let entities: any[] = [];

    switch (entityType) {
      case 'degree':
        entities = this.degrees;
        break;
      case 'institution':
        entities = this.institutions;
        break;
      case 'skill':
        entities = this.skills;
        break;
      case 'category':
        entities = this.skillCategories;
        break;
    }

    return entities
      .map(entity => ({
        entity,
        similarity: fuzzyMatch(entity.name, searchTerm),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(match => match.entity);
  }
}

/**
 * Fetch entities directly from Firestore
 * Use this when you need to load entities outside React components
 */
export async function fetchEntitiesFromFirestore() {
  // Dynamically import Firestore to avoid circular dependencies
  const { collection, getDocs, query, where } = await import('firebase/firestore');
  const { db } = await import('@/lib/firebase/config');

  const fetchDegrees = async (): Promise<Degree[]> => {
    const degreesRef = collection(db, 'degrees');
    const q = query(degreesRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Degree[];
  };

  const fetchInstitutions = async (): Promise<Institution[]> => {
    const institutionsRef = collection(db, 'institutions');
    const q = query(institutionsRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Institution[];
  };

  const fetchSkills = async (): Promise<Skill[]> => {
    const skillsRef = collection(db, 'skills');
    const snapshot = await getDocs(skillsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Skill[];
  };

  const fetchSkillCategories = async (): Promise<SkillCategory[]> => {
    const categoriesRef = collection(db, 'skillCategories');
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as SkillCategory[];
  };

  return {
    fetchDegrees,
    fetchInstitutions,
    fetchSkills,
    fetchSkillCategories,
  };
}

/**
 * Create entity resolver with direct Firestore access
 * Use this helper to initialize the resolver
 */
export async function createEntityResolver(): Promise<DatabaseEntityResolver> {
  const resolver = new DatabaseEntityResolver();
  const fetchers = await fetchEntitiesFromFirestore();

  await resolver.loadEntities(fetchers);

  return resolver;
}
