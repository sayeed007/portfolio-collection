// src/lib/hooks/useSkillCategories.ts
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import {
  fetchSkillCategories,
  addSkillCategory,
  editSkillCategory,
  removeSkillCategory,
} from "../redux/slices/skillCategoriesSlice";
import { SkillCategory } from "../types";

export const useSkillCategories = () => {
  const dispatch = useDispatch<AppDispatch>();
  const skillCategoriesState = useSelector(
    (state: RootState) => state.skillCategories
  );

  // Fetch categories
  const fetchCategories = () => {
    dispatch(fetchSkillCategories());
  };

  // Add category (admin only)
  const createCategory = (
    categoryData: Omit<SkillCategory, "categoryId" | "createdAt" | "updatedAt">
  ) => {
    dispatch(addSkillCategory(categoryData));
  };

  // Edit category (admin only)
  const updateCategory = (
    categoryId: string,
    categoryData: Partial<SkillCategory>
  ) => {
    dispatch(editSkillCategory({ categoryId, categoryData }));
  };

  // Delete category (admin only)
  const deleteCategory = (categoryId: string) => {
    dispatch(removeSkillCategory(categoryId));
  };

  useEffect(() => {
    // Fetch categories on mount
    if (skillCategoriesState.categories.length === 0) {
      fetchCategories();
    }
  }, []);

  return {
    ...skillCategoriesState,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
