// src/lib/redux/slices/skillCategoriesSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { SkillCategory, SkillCategoriesState } from "../../types";
import {
  getSkillCategories,
  createSkillCategory,
  updateSkillCategory,
  deleteSkillCategory,
} from "../../firebase/firestore";

const initialState: SkillCategoriesState = {
  categories: [],
  requests: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchSkillCategories = createAsyncThunk(
  "skillCategories/fetch",
  async () => {
    return await getSkillCategories();
  }
);

export const addSkillCategory = createAsyncThunk(
  "skillCategories/add",
  async (
    categoryData: Omit<SkillCategory, "categoryId" | "createdAt" | "updatedAt">
  ) => {
    const categoryId = await createSkillCategory(categoryData);
    return {
      ...categoryData,
      categoryId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
);

export const editSkillCategory = createAsyncThunk(
  "skillCategories/edit",
  async ({
    categoryId,
    categoryData,
  }: {
    categoryId: string;
    categoryData: Partial<SkillCategory>;
  }) => {
    await updateSkillCategory(categoryId, categoryData);
    return { categoryId, ...categoryData };
  }
);

export const removeSkillCategory = createAsyncThunk(
  "skillCategories/remove",
  async (categoryId: string) => {
    await deleteSkillCategory(categoryId);
    return categoryId;
  }
);

const skillCategoriesSlice = createSlice({
  name: "skillCategories",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchSkillCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSkillCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchSkillCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch categories";
      })
      // Add category
      .addCase(addSkillCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      // Edit category
      .addCase(editSkillCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (cat) => cat.categoryId === action.payload.categoryId
        );
        if (index !== -1) {
          state.categories[index] = {
            ...state.categories[index],
            ...action.payload,
          };
        }
      })
      // Remove category
      .addCase(removeSkillCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (cat) => cat.categoryId !== action.payload
        );
      });
  },
});

export const { clearError } = skillCategoriesSlice.actions;
export default skillCategoriesSlice.reducer;
