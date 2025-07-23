// src/lib/hooks/useAllSkills.ts
import { useSkills } from './useSkills';
import { useSkillCategories } from './useSkillCategories';
import { useSkillCategoryRequests, useSkillRequests } from './useSkillCategoryRequests';
import { useMemo } from 'react';

export function useAllSkills() {
    const { categories } = useSkillCategories();
    const { categoryRequests } = useSkillCategoryRequests();
    const { skills } = useSkills([...categoryRequests, ...categories]);
    const { skillRequests } = useSkillRequests();

    return useMemo(
        () =>
            [...skillRequests, ...skills].map(skill => ({
                value: skill.id,
                label: skill.name,
            })),
        [skillRequests, skills]
    );
}