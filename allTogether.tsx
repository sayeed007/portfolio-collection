// src\components\portfolio\MultiStepForm\Step3SkillsExperience.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useSkillCategories } from '@/lib/hooks/useSkillCategories';
import { updateFormData } from '@/lib/redux/slices/portfolioSlice';
import { RootState } from '@/lib/redux/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Briefcase, Code, Plus, Settings, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';
import { SkillCategorySelector } from '../SkillCategorySelector';

// Validation schema for Step3SkillsExperience.tsx
const step3Schema = z.object({
  technicalSkills: z.array(z.object({
    category: z.string().min(1, 'Category is required'),
    skills: z.array(z.string().min(1, 'Skill cannot be empty')).min(1, 'At least one skill is required'),
    proficiency: z.string().min(1, 'Proficiency level is required'),
  })).min(1, 'At least one technical skill category is required'),
  workExperience: z.array(z.object({
    company: z.string().min(1, 'Company name is required'),
    position: z.string().min(1, 'Position is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    isCurrentRole: z.boolean(),
    responsibilities: z.array(z.string().min(1, 'Responsibility cannot be empty')).min(1, 'At least one responsibility is required'),
    technologies: z.array(z.string().min(1, 'Technology cannot be empty')).optional(),
  })).min(1, 'At least one work experience is required'),
});

type Step3FormData = z.infer<typeof step3Schema>;

export function Step3SkillsExperience() {
  const dispatch = useDispatch();
  const { formData } = useSelector((state: RootState) => state.portfolio);
  const { skillCategories, loading: categoriesLoading } = useSkillCategories();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedSkillIndex, setSelectedSkillIndex] = useState<number>(-1);

  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      technicalSkills: formData.technicalSkills && formData.technicalSkills.length > 0
        ? formData.technicalSkills.map(skill => ({
          ...skill,
          skills: [...skill.skills] // Ensure mutable array
        }))
        : [{
          category: '',
          skills: [''],
          proficiency: ''
        }],
      workExperience: formData.workExperience && formData.workExperience.length > 0
        ? formData.workExperience.map(exp => ({
          ...exp,
          responsibilities: [...exp.responsibilities], // Ensure mutable array
          technologies: exp.technologies ? [...exp.technologies] : [''] // Ensure mutable array
        }))
        : [{
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          isCurrentRole: false,
          responsibilities: [''],
          technologies: ['']
        }],
    },
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: 'technicalSkills',
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: 'workExperience',
  });

  // Fixed: Use subscription instead of watch() in useEffect
  useEffect(() => {
    const subscription = watch((value) => {
      // Only dispatch if the value has actually changed
      dispatch(updateFormData(value as Step3FormData));
    });

    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  const handleCategorySelect = (category: string) => {
    if (selectedSkillIndex >= 0) {
      setValue(`technicalSkills.${selectedSkillIndex}.category`, category);
    }
    setShowCategoryModal(false);
    setSelectedSkillIndex(-1);
  };

  const openCategoryModal = (index: number) => {
    setSelectedSkillIndex(index);
    setShowCategoryModal(true);
  };

  const addSkillToCategory = (categoryIndex: number) => {
    const currentSkills = getValues(`technicalSkills.${categoryIndex}.skills`);
    setValue(`technicalSkills.${categoryIndex}.skills`, [...currentSkills, '']);
  };

  const removeSkillFromCategory = (categoryIndex: number, skillIndex: number) => {
    const currentSkills = getValues(`technicalSkills.${categoryIndex}.skills`);
    if (currentSkills.length > 1) {
      const newSkills = currentSkills.filter((_, index) => index !== skillIndex);
      setValue(`technicalSkills.${categoryIndex}.skills`, newSkills);
    }
  };

  const addResponsibility = (experienceIndex: number) => {
    const currentResponsibilities = getValues(`workExperience.${experienceIndex}.responsibilities`);
    setValue(`workExperience.${experienceIndex}.responsibilities`, [...currentResponsibilities, '']);
  };

  const removeResponsibility = (experienceIndex: number, responsibilityIndex: number) => {
    const currentResponsibilities = getValues(`workExperience.${experienceIndex}.responsibilities`);
    if (currentResponsibilities.length > 1) {
      const newResponsibilities = currentResponsibilities.filter((_, index) => index !== responsibilityIndex);
      setValue(`workExperience.${experienceIndex}.responsibilities`, newResponsibilities);
    }
  };

  const addTechnology = (experienceIndex: number) => {
    const currentTechnologies = getValues(`workExperience.${experienceIndex}.technologies`) || [];
    setValue(`workExperience.${experienceIndex}.technologies`, [...currentTechnologies, '']);
  };

  const removeTechnology = (experienceIndex: number, techIndex: number) => {
    const currentTechnologies = getValues(`workExperience.${experienceIndex}.technologies`) || [];
    if (currentTechnologies.length > 1) {
      const newTechnologies = currentTechnologies.filter((_, index) => index !== techIndex);
      setValue(`workExperience.${experienceIndex}.technologies`, newTechnologies);
    }
  };

  return (
    <div className="space-y-6">
      {/* Technical Skills */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Code className="w-5 h-5 mr-2" />
            Technical Skills
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendSkill({ category: '', skills: [''], proficiency: '' })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Skill Category
          </Button>
        </div>

        <div className="space-y-6">
          {skillFields.map((field, categoryIndex) => {
            // Get current skills array safely
            const currentSkills = getValues(`technicalSkills.${categoryIndex}.skills`) || [''];

            return (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="space-y-4">
                  {/* Category Selection */}
                  <div className="flex gap-2">
                    <Input
                      {...register(`technicalSkills.${categoryIndex}.category`)}
                      label="Skill Category"
                      placeholder="Select or enter category"
                      error={errors.technicalSkills?.[categoryIndex]?.category?.message}
                      required
                      readOnly={skillCategories?.length > 0}
                    />
                    <div className="">
                      <select
                        {...register(`technicalSkills.${categoryIndex}.proficiency`)}
                        className="p-2 border border-gray-300 rounded-lg w-full h-12"
                      >
                        <option value="">Select Proficiency</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openCategoryModal(categoryIndex)}
                      className="my-auto"
                      disabled={categoriesLoading}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    {skillFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSkill(categoryIndex)}
                        className="mt-6"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Proficiency Error Display */}
                  {errors.technicalSkills?.[categoryIndex]?.proficiency && (
                    <p className="text-red-500 text-sm">
                      {errors.technicalSkills[categoryIndex].proficiency?.message}
                    </p>
                  )}

                  {/* Skills for this category */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700">Skills</label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSkillToCategory(categoryIndex)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Skill
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {currentSkills.map((_, skillIndex) => (
                        <div key={skillIndex} className="flex gap-2">
                          <Input
                            {...register(`technicalSkills.${categoryIndex}.skills.${skillIndex}`)}
                            placeholder="e.g., JavaScript, React"
                            error={errors.technicalSkills?.[categoryIndex]?.skills?.[skillIndex]?.message}
                            className="flex-1"
                          />
                          {currentSkills.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeSkillFromCategory(categoryIndex, skillIndex)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info about skill categories */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">About Skill Categories:</p>
            <p>You can select from approved categories or request new ones. New category requests will be reviewed by administrators.</p>
          </div>
        </div>
      </Card>

      {/* Work Experience */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Work Experience
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendExperience({
              company: '',
              position: '',
              startDate: '',
              endDate: '',
              isCurrentRole: false,
              responsibilities: [''],
              technologies: ['']
            })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        </div>

        <div className="space-y-6">
          {experienceFields.map((field, experienceIndex) => {
            // Get current arrays safely
            const currentResponsibilities = getValues(`workExperience.${experienceIndex}.responsibilities`) || [''];
            const currentTechnologies = getValues(`workExperience.${experienceIndex}.technologies`) || [''];

            return (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="space-y-4">
                  {/* Company and Position */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      {...register(`workExperience.${experienceIndex}.company`)}
                      label="Company"
                      placeholder="e.g., Tech Solutions Ltd."
                      error={errors.workExperience?.[experienceIndex]?.company?.message}
                      required
                    />

                    <Input
                      {...register(`workExperience.${experienceIndex}.position`)}
                      label="Position"
                      placeholder="e.g., Senior Software Engineer"
                      error={errors.workExperience?.[experienceIndex]?.position?.message}
                      required
                    />
                  </div>

                  {/* Start Date, End Date, and Current Role */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      {...register(`workExperience.${experienceIndex}.startDate`)}
                      label="Start Date"
                      type="date"
                      error={errors.workExperience?.[experienceIndex]?.startDate?.message}
                      required
                    />

                    <Input
                      {...register(`workExperience.${experienceIndex}.endDate`)}
                      label="End Date"
                      type="date"
                      error={errors.workExperience?.[experienceIndex]?.endDate?.message}
                      disabled={watch(`workExperience.${experienceIndex}.isCurrentRole`)}
                    />

                    <div className="flex items-center mt-6">
                      <input
                        type="checkbox"
                        {...register(`workExperience.${experienceIndex}.isCurrentRole`)}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700">Current Role</label>
                    </div>
                  </div>

                  {/* Remove Experience Button */}
                  {experienceFields.length > 1 && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeExperience(experienceIndex)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Experience
                      </Button>
                    </div>
                  )}

                  {/* Responsibilities */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700">
                        Key Responsibilities <span className="text-red-500">*</span>
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addResponsibility(experienceIndex)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Responsibility
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {currentResponsibilities.map((_, responsibilityIndex) => (
                        <div key={responsibilityIndex} className="flex gap-2">
                          <Input
                            {...register(`workExperience.${experienceIndex}.responsibilities.${responsibilityIndex}`)}
                            placeholder="e.g., Developed and maintained web applications using React and Node.js"
                            error={errors.workExperience?.[experienceIndex]?.responsibilities?.[responsibilityIndex]?.message}
                            className="flex-1"
                          />
                          {currentResponsibilities.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeResponsibility(experienceIndex, responsibilityIndex)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technologies Used */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700">
                        Technologies Used
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addTechnology(experienceIndex)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Technology
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {currentTechnologies.map((_, techIndex) => (
                        <div key={techIndex} className="flex gap-2">
                          <Input
                            {...register(`workExperience.${experienceIndex}.technologies.${techIndex}`)}
                            placeholder="e.g., React, Node.js, PostgreSQL"
                            error={errors.workExperience?.[experienceIndex]?.technologies?.[techIndex]?.message}
                            className="flex-1"
                          />
                          {currentTechnologies.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeTechnology(experienceIndex, techIndex)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-6 bg-green-50 border-green-200">
        <h4 className="font-medium text-green-900 mb-2">Tips for this section:</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Group technical skills into logical categories (e.g., Programming Languages, Frameworks)</li>
          <li>• List work experience in reverse chronological order</li>
          <li>• Use action verbs for responsibilities (developed, managed, implemented)</li>
          <li>• Be specific about your contributions and achievements</li>
          <li>• Include relevant internships and freelance work</li>
          <li>• Add technologies you used in each role for better context</li>
        </ul>
      </Card>

      {/* Skill Category Selection Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Select Skill Category"
        size='2xl'
      >
        <SkillCategorySelector
          onSelect={handleCategorySelect}
          onCancel={() => setShowCategoryModal(false)}
        />
      </Modal>
    </div>
  );
}



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

export const fetchUserPortfolio = createAsyncThunk(
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

export const fetchPublicPortfolios = createAsyncThunk(
  "portfolio/fetchPublic",
  async (filters?: PortfolioFilters, { rejectWithValue }) => {
    try {
      const portfolios = await getPublicPortfolios(filters);
      return portfolios;
    } catch (error) {
      console.error("Fetch public portfolios error:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch portfolios"
      );
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


// src/lib/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authSlice from "./slices/authSlice";
import categoryRequestsSlice from "./slices/categoryRequestsSlice";
import portfolioSlice from "./slices/portfolioSlice";
import skillCategoriesSlice from "./slices/skillCategoriesSlice";
import uiSlice from "./slices/uiSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "ui"], // Only persist auth and ui state
};

const rootReducer = combineReducers({
  auth: authSlice,
  portfolio: portfolioSlice,
  skillCategories: skillCategoriesSlice,
  categoryRequests: categoryRequestsSlice,
  ui: uiSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



'use client';

import React, { useState } from 'react';
import { Card, Button, Input, Modal } from '@/components/ui';
import { Plus, X, Send, Trash2, Edit2, Zap, Star, Users } from 'lucide-react';
import { SkillCategory, TechnicalSkill, CategoryRequest } from '@/lib/types';
import { useSkillCategories } from '@/lib/hooks/useSkillCategories';
import { useCategoryRequests } from '@/lib/hooks/useCategoryRequests';

interface SkillCategorySelectorProps {
  selectedSkills: TechnicalSkill[];
  onChange: (skills: TechnicalSkill[]) => void;
  disabled?: boolean;
}

export const SkillCategorySelector: React.FC<SkillCategorySelectorProps> = ({
  selectedSkills,
  onChange,
  disabled = false
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>(['']);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);

  const { categories, loading: categoriesLoading } = useSkillCategories();
  const { submitRequest, loading: requestLoading } = useCategoryRequests();

  // Add a new skill category to the selected skills
  const addSkillCategory = () => {
    const newCategory: TechnicalSkill = {
      category: '',
      skills: ['']
    };
    onChange([...selectedSkills, newCategory]);
    setEditingCategory(selectedSkills.length);
  };

  // Remove a skill category
  const removeSkillCategory = (index: number) => {
    const updatedSkills = selectedSkills.filter((_, i) => i !== index);
    onChange(updatedSkills);
    if (editingCategory === index) {
      setEditingCategory(null);
    }
  };

  // Update skill category
  const updateSkillCategory = (index: number, updates: Partial<TechnicalSkill>) => {
    const updatedSkills = selectedSkills.map((skill, i) =>
      i === index ? { ...skill, ...updates } : skill
    );
    onChange(updatedSkills);
  };

  // Add a skill to a category
  const addSkillToCategory = (categoryIndex: number) => {
    const updatedSkills = [...selectedSkills];
    updatedSkills[categoryIndex].skills.push('');
    onChange(updatedSkills);
  };

  // Remove a skill from a category
  const removeSkillFromCategory = (categoryIndex: number, skillIndex: number) => {
    const updatedSkills = [...selectedSkills];
    updatedSkills[categoryIndex].skills = updatedSkills[categoryIndex].skills.filter(
      (_, i) => i !== skillIndex
    );
    onChange(updatedSkills);
  };

  // Update a specific skill in a category
  const updateSkillInCategory = (categoryIndex: number, skillIndex: number, value: string) => {
    const updatedSkills = [...selectedSkills];
    updatedSkills[categoryIndex].skills[skillIndex] = value;
    onChange(updatedSkills);
  };

  // // Handle category request submission
  // const handleRequestSubmit = async () => {
  //     if (!newCategoryName.trim()) return;

  //     const filteredSkills = suggestedSkills.filter(skill => skill.trim());

  //     await submitRequest({
  //         categoryName: newCategoryName,
  //         suggestedSkills: filteredSkills
  //     });

  //     // Reset form
  //     setNewCategoryName('');
  //     setSuggestedSkills(['']);
  //     setShowRequestModal(false);
  // };
  // Handle category request submission
  const handleRequestSubmit = async () => {
    if (!newCategoryName.trim()) return;

    const filteredSkills = suggestedSkills.filter(skill => skill.trim());

    try {
      await submitRequest({
        categoryName: newCategoryName,
        suggestedSkills: filteredSkills
      });

      // Reset form only after successful submission
      setNewCategoryName('');
      setSuggestedSkills(['']);
      setShowRequestModal(false);
    } catch (error) {
      console.error('Failed to submit category request:', error);
      // Optionally show error message to user
      // You might want to add error handling UI here
    }
  };

  // Add suggested skill input
  const addSuggestedSkill = () => {
    setSuggestedSkills([...suggestedSkills, '']);
  };

  // Remove suggested skill input
  const removeSuggestedSkill = (index: number) => {
    setSuggestedSkills(suggestedSkills.filter((_, i) => i !== index));
  };

  // Update suggested skill
  const updateSuggestedSkill = (index: number, value: string) => {
    const updated = [...suggestedSkills];
    updated[index] = value;
    setSuggestedSkills(updated);
  };

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 rounded-3xl border-0 shadow-xl">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-purple-200 mb-6">
          <Zap className="w-4 h-4 text-purple-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Showcase Your Expertise</span>
        </div>

        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Technical
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {" "}Skills
          </span>
        </h3>

        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Organize your technical expertise into categories to showcase your professional capabilities
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            type="button"
            onClick={() => setShowRequestModal(true)}
            disabled={disabled}
            className="h-12 px-6 text-base bg-white/80 backdrop-blur text-purple-600 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            <Send className="w-4 h-4 mr-2" />
            Request New Category
          </Button>
          <Button
            type="button"
            onClick={addSkillCategory}
            disabled={disabled}
            className="h-12 px-6 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Skill Category
          </Button>
        </div>
      </div>

      {/* Selected Skills */}
      <div className="space-y-6">
        {selectedSkills?.map((skillCategory, categoryIndex) => (
          <Card
            key={categoryIndex}
            className="p-8 border-0 bg-white/80 backdrop-blur hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl group"
          >
            <div className="flex items-start gap-6">
              <div className="flex-1 space-y-6">
                {/* Category Selection */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Skill Category
                    </label>
                    <select
                      value={skillCategory.category}
                      onChange={(e) => updateSkillCategory(categoryIndex, { category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 backdrop-blur transition-all duration-200 text-gray-900 font-medium"
                      disabled={disabled}
                    >
                      <option value="">Select a category...</option>
                      {categories?.map(category => (
                        <option key={category.categoryId} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="pt-7">
                    <Button
                      type="button"
                      onClick={() => setEditingCategory(
                        editingCategory === categoryIndex ? null : categoryIndex
                      )}
                      className="w-12 h-12 bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-300 p-0 flex items-center justify-center"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Skills in this category
                  </label>
                  <div className="space-y-3">
                    {skillCategory.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="flex items-center gap-3 group/skill">
                        <div className="flex-1">
                          <Input
                            type="text"
                            value={skill}
                            onChange={(e) => updateSkillInCategory(categoryIndex, skillIndex, e.target.value)}
                            placeholder="Enter skill name (e.g., React, Node.js, Python)"
                            disabled={disabled}
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur transition-all duration-200 text-gray-900"
                          />
                        </div>
                        {skillCategory.skills.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeSkillFromCategory(categoryIndex, skillIndex)}
                            disabled={disabled}
                            className="w-10 h-10 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 p-0 flex items-center justify-center opacity-0 group-hover/skill:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}

                    <Button
                      type="button"
                      onClick={() => addSkillToCategory(categoryIndex)}
                      disabled={disabled}
                      className="w-full h-12 bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-2 border-dashed border-gray-300 hover:border-blue-300 rounded-xl transition-all duration-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Skill
                    </Button>
                  </div>
                </div>
              </div>

              {/* Remove Category Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  onClick={() => removeSkillCategory(categoryIndex)}
                  disabled={disabled}
                  className="w-12 h-12 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {/* Empty State */}
        {selectedSkills?.length === 0 && (
          <Card className="p-12 text-center border-0 bg-white/60 backdrop-blur rounded-2xl border-2 border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Star className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No Skills Added Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start building your professional profile by adding your technical skills and expertise
            </p>
            <Button
              type="button"
              onClick={addSkillCategory}
              disabled={disabled}
              className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Category
            </Button>
          </Card>
        )}
      </div>

      {/* Request New Category Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title=""
        size="2xl"
      >
        <div className="p-8">
          {/* Modal Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full mb-4">
              <Users className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-700">Community Request</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Request New
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Category
              </span>
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Help expand our platform by suggesting a new skill category for the community
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Category Name *
              </label>
              <Input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Cloud Computing, Mobile Development, DevOps"
                required
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 backdrop-blur text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Suggested Skills (Optional)
              </label>
              <div className="space-y-3">
                {suggestedSkills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Input
                      type="text"
                      value={skill}
                      onChange={(e) => updateSuggestedSkill(index, e.target.value)}
                      placeholder="Enter skill name"
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur text-gray-900"
                    />
                    {suggestedSkills.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeSuggestedSkill(index)}
                        className="w-10 h-10 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 p-0 flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={addSuggestedSkill}
                  className="w-full h-12 bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-2 border-dashed border-gray-300 hover:border-blue-300 rounded-xl transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Skill
                </Button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Community Contribution
                  </p>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Your request will be reviewed by our team. Once approved, this category will be available for all users to help build their professional portfolios.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setShowRequestModal(false)}
                disabled={requestLoading}
                className="flex-1 h-12 bg-white text-gray-600 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleRequestSubmit}
                disabled={requestLoading || !newCategoryName.trim()}
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {requestLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SkillCategorySelector;