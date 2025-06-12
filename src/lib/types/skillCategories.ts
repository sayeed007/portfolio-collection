import { Timestamp } from "firebase/firestore";

// src/lib/types/skillCategories.ts
export interface SkillCategory {
  categoryId: string;
  name: string;
  approved: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CategoryRequest {
  id: string;
  userId: string;
  categoryName: string;
  suggestedSkills: string[];
  status: "Pending" | "Approved" | "Rejected";
  adminComment?: string;
  createdAt: Timestamp;
}

export interface SkillCategoriesState {
  categories: SkillCategory[];
  requests: CategoryRequest[];
  loading: boolean;
  error: string | null;
}
