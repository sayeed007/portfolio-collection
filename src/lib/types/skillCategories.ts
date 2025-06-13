// src/lib/types/skillCategories.ts
export interface SkillCategory {
  categoryId: string;
  name: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequest {
  id: string;
  userId: string;
  categoryName: string;
  suggestedSkills: string[];
  status: "Pending" | "Approved" | "Rejected";
  adminComment?: string;
  createdAt: string;
}

export interface SkillCategoriesState {
  categories: SkillCategory[];
  requests: CategoryRequest[];
  loading: boolean;
  error: string | null;
}
