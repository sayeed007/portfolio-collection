// src/lib/hooks/useAllCategories.ts
import { useSkillCategories } from './useSkillCategories';
import { useSkillCategoryRequests } from './useSkillCategoryRequests';
import { useMemo } from 'react';

export function useAllCategories() {
    const { categories } = useSkillCategories();
    const { categoryRequests } = useSkillCategoryRequests();

    return useMemo(
        () =>
            [...categoryRequests, ...categories].map(category => ({
                value: category.id,
                label: category.name,
            })),
        [categoryRequests, categories]
    );
}