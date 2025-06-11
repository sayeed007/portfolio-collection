// src/lib/redux/slices/portfolioSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Portfolio, PortfolioFilters } from "../../types";
import {
  createPortfolio,
  updatePortfolio,
  getPortfolio,
  deletePortfolio,
  getPublicPortfolios,
  incrementPortfolioVisits,
} from "../../firebase/firestore";

// Updated interfaces to match your form structure
export interface Reference {
  name: string;
  contactInfo: string;
  relationship: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
  grade?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface Course {
  name: string;
  provider: string;
  completionDate: string;
  duration?: string;
}

export interface TechnicalSkill {
  category: string;
  skills: string[];
  proficiency: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrentRole: boolean;
  responsibilities: string[];
  technologies: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  isOngoing: boolean;
  role: string;
  responsibilities: string[];
  outcomes: string[];
  url?: string;
  repository?: string;
}

// Flat form data structure to match your components
export interface PortfolioFormData {
  // Step 1: Personal Information
  employeeCode: string;
  designation: string;
  yearsOfExperience: number;
  nationality: string;
  languageProficiency: string[];
  email: string;
  mobileNo: string;
  profileImage?: string;
  summary: string;
  references: Reference[];

  // Step 2: Education & Certifications
  education: Education[];
  certifications: Certification[];
  courses: Course[];

  // Step 3: Skills & Experience
  technicalSkills: TechnicalSkill[];
  workExperience: WorkExperience[];

  // Step 4: Projects
  projects: Project[];
}

export interface StepValidation {
  isValid: boolean;
  errors: string[];
}

export interface PortfolioState {
  currentPortfolio: Portfolio | null;
  portfolios: Portfolio[];
  formData: PortfolioFormData;
  currentStep: number;
  stepValidation: Record<number, StepValidation>;
  loading: boolean;
  error: string | null;
  searchResults: Portfolio[];
  filters: PortfolioFilters;
  isSubmitting: boolean;
  isSaving: boolean;
  submitError: string | null;
  isEditing: boolean;
}

const initialFormData: PortfolioFormData = {
  employeeCode: "",
  designation: "",
  yearsOfExperience: 0,
  nationality: "",
  languageProficiency: [""],
  email: "",
  mobileNo: "",
  profileImage: "",
  summary: "",
  references: [{ name: "", contactInfo: "", relationship: "" }],
  education: [],
  certifications: [],
  courses: [],
  technicalSkills: [],
  workExperience: [],
  projects: [],
};

const initialState: PortfolioState = {
  currentPortfolio: null,
  portfolios: [],
  formData: initialFormData,
  currentStep: 1,
  stepValidation: {},
  loading: false,
  error: null,
  searchResults: [],
  filters: {},
  isSubmitting: false,
  isSaving: false,
  submitError: null,
  isEditing: false,
};

// Helper function to transform form data to portfolio structure
const transformFormDataToPortfolio = (formData: PortfolioFormData) => {
  return {
    personalInfo: {
      employeeCode: formData.employeeCode,
      designation: formData.designation,
      yearsOfExperience: formData.yearsOfExperience,
      nationality: formData.nationality,
      languageProficiency: formData.languageProficiency.filter(
        (lang) => lang.trim() !== ""
      ),
      email: formData.email,
      mobileNo: formData.mobileNo,
      profileImage: formData.profileImage || "",
      summary: formData.summary,
    },
    references: formData.references,
    education: formData.education,
    certifications: formData.certifications,
    courses: formData.courses,
    technicalSkills: formData.technicalSkills,
    workExperience: formData.workExperience,
    projects: formData.projects,
  };
};

// Helper function to transform portfolio to form data
const transformPortfolioToFormData = (portfolio: any): PortfolioFormData => {
  return {
    employeeCode: portfolio.personalInfo?.employeeCode || "",
    designation: portfolio.personalInfo?.designation || "",
    yearsOfExperience: portfolio.personalInfo?.yearsOfExperience || 0,
    nationality: portfolio.personalInfo?.nationality || "",
    languageProficiency:
      portfolio.personalInfo?.languageProficiency?.length > 0
        ? portfolio.personalInfo.languageProficiency
        : [""],
    email: portfolio.personalInfo?.email || "",
    mobileNo: portfolio.personalInfo?.mobileNo || "",
    profileImage: portfolio.personalInfo?.profileImage || "",
    summary: portfolio.personalInfo?.summary || "",
    references:
      portfolio.references?.length > 0
        ? portfolio.references
        : [{ name: "", contactInfo: "", relationship: "" }],
    education: portfolio.education || [],
    certifications: portfolio.certifications || [],
    courses: portfolio.courses || [],
    technicalSkills: portfolio.technicalSkills || [],
    workExperience: portfolio.workExperience || [],
    projects: portfolio.projects || [],
  };
};

// Async thunks
export const submitPortfolio = createAsyncThunk(
  "portfolio/submit",
  async (
    {
      portfolioData,
      userId,
      portfolioId,
    }: {
      portfolioData: PortfolioFormData;
      userId: string;
      portfolioId?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const portfolioPayload = {
        ...transformFormDataToPortfolio(portfolioData),
        isPublic: true,
        status: "published" as const,
      };

      if (portfolioId) {
        const updatedPortfolio = await updatePortfolio(
          portfolioId,
          portfolioPayload
        );
        return updatedPortfolio;
      } else {
        const newPortfolio = await createPortfolio(userId, portfolioPayload);
        return newPortfolio;
      }
    } catch (error) {
      console.error("Submit portfolio error:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to submit portfolio"
      );
    }
  }
);

export const savePortfolioDraft = createAsyncThunk(
  "portfolio/saveDraft",
  async (
    {
      portfolioData,
      userId,
      portfolioId,
    }: {
      portfolioData: PortfolioFormData;
      userId: string;
      portfolioId?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const portfolioPayload = {
        ...transformFormDataToPortfolio(portfolioData),
        isPublic: false,
        status: "draft" as const,
      };

      if (portfolioId) {
        const updatedPortfolio = await updatePortfolio(
          portfolioId,
          portfolioPayload
        );
        return updatedPortfolio;
      } else {
        const newPortfolio = await createPortfolio(userId, portfolioPayload);
        return newPortfolio;
      }
    } catch (error) {
      console.error("Save draft error:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to save draft"
      );
    }
  }
);

export const fetchUserPortfolio = createAsyncThunk<Portfolio | null, string, { rejectValue: string }>(
  "portfolio/fetch",
  async (userId: string, { rejectWithValue }) => {
    try {
      const portfolio = await getPortfolio(userId);
      if (!portfolio) {
        return rejectWithValue("No portfolio found");
      }
      return portfolio;
    } catch (error) {
      console.error("Fetch portfolio error:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch portfolio"
      );
    }
  }
);

export const createUserPortfolio = createAsyncThunk(
  "portfolio/create",
  async (
    {
      userId,
      portfolioData,
    }: {
      userId: string;
      portfolioData: Omit<
        Portfolio,
        "userId" | "createdAt" | "updatedAt" | "visitCount"
      >;
    },
    { rejectWithValue }
  ) => {
    try {
      const newPortfolio = await createPortfolio(userId, portfolioData);
      return newPortfolio;
    } catch (error) {
      console.error("Create portfolio error:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create portfolio"
      );
    }
  }
);

export const updateUserPortfolio = createAsyncThunk(
  "portfolio/update",
  async (
    {
      userId,
      portfolioData,
    }: {
      userId: string;
      portfolioData: Partial<Portfolio>;
    },
    { rejectWithValue }
  ) => {
    try {
      // Get the portfolio ID first
      const existingPortfolio = await getPortfolio(userId);
      if (!existingPortfolio?.id) {
        throw new Error("Portfolio not found");
      }

      const updatedPortfolio = await updatePortfolio(
        existingPortfolio.id,
        portfolioData
      );
      return updatedPortfolio;
    } catch (error) {
      console.error("Update portfolio error:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update portfolio"
      );
    }
  }
);

export const deleteUserPortfolio = createAsyncThunk(
  "portfolio/delete",
  async (userId: string, { rejectWithValue }) => {
    try {
      await deletePortfolio(userId);
      return userId;
    } catch (error) {
      console.error("Delete portfolio error:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete portfolio"
      );
    }
  }
);

export const fetchPublicPortfolios = createAsyncThunk<
  Portfolio[], // Return type
  PortfolioFilters | undefined, // Argument type
  { rejectValue: string } // ThunkAPI type for rejectWithValue
>(
  "portfolio/fetchPublic",
  async (filters, { rejectWithValue }) => {
    try {
      console.log("Fetching public portfolios with filters:", filters);

      const portfolios = await getPublicPortfolios(filters);

      // Validate the response
      if (!Array.isArray(portfolios)) {
        throw new Error("Invalid response: expected array of portfolios");
      }

      console.log(`Successfully fetched ${portfolios.length} public portfolios`);
      return portfolios;
    } catch (error) {
      console.error("Fetch public portfolios error:", error);

      // Handle different types of errors
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }

      // Handle network errors
      if (typeof error === 'object' && error !== null && 'code' in error) {
        return rejectWithValue(`Network error: ${(error as any).code}`);
      }

      return rejectWithValue("Failed to fetch portfolios");
    }
  }
);

export const visitPortfolio = createAsyncThunk(
  "portfolio/visit",
  async (userId: string, { rejectWithValue }) => {
    try {
      await incrementPortfolioVisits(userId);
      return userId;
    } catch (error) {
      console.error("Visit portfolio error:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to record visit"
      );
    }
  }
);

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },

    updateFormData: (
      state,
      action: PayloadAction<Partial<PortfolioFormData>>
    ) => {
      state.formData = { ...state.formData, ...action.payload };
    },

    setFormData: (state, action: PayloadAction<any>) => {
      try {
        const portfolio = action.payload;
        state.formData = transformPortfolioToFormData(portfolio);
      } catch (error) {
        console.error("Error setting form data:", error);
        // Fallback to safe merge
        state.formData = { ...state.formData, ...action.payload };
      }
    },

    resetForm: (state) => {
      state.formData = initialFormData;
      state.currentStep = 1;
      state.stepValidation = {};
      state.isEditing = false;
      state.submitError = null;
    },

    resetFormData: (state) => {
      state.formData = initialFormData;
    },

    validateStep: (
      state,
      action: PayloadAction<{
        step: number;
        isValid: boolean;
        errors: string[];
      }>
    ) => {
      const { step, isValid, errors } = action.payload;
      state.stepValidation[step] = { isValid, errors };
    },

    setFilters: (state, action: PayloadAction<PortfolioFilters>) => {
      state.filters = action.payload;
    },

    clearError: (state) => {
      state.error = null;
      state.submitError = null;
    },

    setIsEditing: (state, action: PayloadAction<boolean>) => {
      state.isEditing = action.payload;
    },

    clearFormValidation: (state) => {
      state.stepValidation = {};
    },
  },

  extraReducers: (builder) => {
    builder
      // Submit portfolio
      .addCase(submitPortfolio.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(submitPortfolio.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.currentPortfolio = action.payload;
        state.submitError = null;
      })
      .addCase(submitPortfolio.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload as string;
      })

      // Save draft
      .addCase(savePortfolioDraft.pending, (state) => {
        state.isSaving = true;
        state.submitError = null;
      })
      .addCase(savePortfolioDraft.fulfilled, (state, action) => {
        state.isSaving = false;
        state.currentPortfolio = action.payload;
      })
      .addCase(savePortfolioDraft.rejected, (state, action) => {
        state.isSaving = false;
        state.submitError = action.payload as string;
      })

      // Fetch portfolio
      .addCase(fetchUserPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPortfolio = action.payload;
        state.error = null;
      })
      .addCase(fetchUserPortfolio.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = action.payload as string;
        if (errorMessage === "No portfolio found") {
          state.error = null;
          state.currentPortfolio = null;
        } else {
          state.error = errorMessage;
        }
      })

      // Create portfolio
      .addCase(createUserPortfolio.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(createUserPortfolio.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.currentPortfolio = action.payload;
      })
      .addCase(createUserPortfolio.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload as string;
      })

      // Update portfolio
      .addCase(updateUserPortfolio.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(updateUserPortfolio.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.currentPortfolio = action.payload;
      })
      .addCase(updateUserPortfolio.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload as string;
      })

      // Delete portfolio
      .addCase(deleteUserPortfolio.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUserPortfolio.fulfilled, (state) => {
        state.loading = false;
        state.currentPortfolio = null;
        state.formData = initialFormData;
        state.currentStep = 1;
        state.stepValidation = {};
        state.isEditing = false;
      })
      .addCase(deleteUserPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch public portfolios
      .addCase(fetchPublicPortfolios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicPortfolios.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolios = action.payload;
        state.searchResults = action.payload;
      })
      .addCase(fetchPublicPortfolios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Visit portfolio
      .addCase(visitPortfolio.fulfilled, (state, action) => {
        // Update visit count if the visited portfolio is currently loaded
        if (state.currentPortfolio?.userId === action.payload) {
          state.currentPortfolio.visitCount =
            (state.currentPortfolio.visitCount || 0) + 1;
        }
      });
  },
});

export const {
  setCurrentStep,
  updateFormData,
  setFormData,
  resetForm,
  resetFormData,
  validateStep,
  setFilters,
  clearError,
  setIsEditing,
  clearFormValidation,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
