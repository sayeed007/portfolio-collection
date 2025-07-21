// src\components\portfolio\MultiStepForm\TechnicalSkillsSection.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeleteButton } from '@/components/ui/DeleteButton';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/Select';
import { useSkillCategories } from '@/lib/hooks/useSkillCategories';
import { useSkillCategoryRequests, useSkillRequests } from '@/lib/hooks/useSkillCategoryRequests';
import { useSkills } from '@/lib/hooks/useSkills';
import { Code, Plus, Lightbulb, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Controller, useFieldArray, Control, FieldErrors, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getAuth } from 'firebase/auth';

// Technical skills schema
export const technicalSkillsSchema = z.object({
    technicalSkills: z
        .array(
            z.object({
                category: z.string().min(1, 'Category is required'),
                skills: z
                    .array(
                        z.object({
                            skillId: z.string().min(1, 'Skill ID cannot be empty'),
                            proficiency: z.string().min(1, 'Proficiency level is required'),
                        })
                    )
                    .min(1, 'At least one skill is required'),
            })
        )
        .min(1, 'At least one technical skill category is required'),
});

// Skill request form schema
const skillRequestSchema = z.object({
    name: z.string().min(1, 'Skill name is required'),
    categoryId: z.string().min(1, 'Category is required'),
    requestedBy: z.string().min(1, 'User ID is required'),
    requestedByEmail: z.string().email('Valid email is required'),
});

// Category request form schema
const categoryRequestSchema = z.object({
    name: z.string().min(1, 'Category name is required'),
    requestedBy: z.string().min(1, 'User ID is required'),
    requestedByEmail: z.string().email('Valid email is required'),
});

type SkillRequestFormData = z.infer<typeof skillRequestSchema>;
type CategoryRequestFormData = z.infer<typeof categoryRequestSchema>;

const proficiencyOptions = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' },
];

interface TechnicalSkillsSectionProps {
    control: Control<any>;
    errors: FieldErrors<any>;
    watch: any;
    setValue: any;
    getValues: any;
}

export function TechnicalSkills({ control, errors, watch, setValue, getValues }: TechnicalSkillsSectionProps) {
    const [showSkillRequest, setShowSkillRequest] = useState(false);
    const [showCategoryRequest, setShowCategoryRequest] = useState(false);
    const [isSubmittingSkillRequest, setIsSubmittingSkillRequest] = useState(false);
    const [isSubmittingCategoryRequest, setIsSubmittingCategoryRequest] = useState(false);
    const [skillRequestMessage, setSkillRequestMessage] = useState<string | null>(null);
    const [categoryRequestMessage, setCategoryRequestMessage] = useState<string | null>(null);
    const [skillRequestError, setSkillRequestError] = useState<string | null>(null);
    const [categoryRequestError, setCategoryRequestError] = useState<string | null>(null);

    // Get current user
    const auth = getAuth();
    const currentUser = auth.currentUser;

    // Use hooks
    const { categories, loading: categoriesLoading } = useSkillCategories();
    const { skills, loading: skillsLoading } = useSkills(categories);
    const { skillRequests, createSkillRequest } = useSkillRequests();
    const { categoryRequests, createCategoryRequest } = useSkillCategoryRequests();

    // Skill request form
    const {
        register: registerSkillRequest,
        handleSubmit: handleSubmitSkillRequest,
        control: skillRequestControl,
        formState: { errors: skillRequestErrors },
        reset: resetSkillRequestForm,
    } = useForm<SkillRequestFormData>({
        resolver: zodResolver(skillRequestSchema),
        defaultValues: {
            name: '',
            categoryId: '',
            requestedBy: currentUser?.uid || '',
            requestedByEmail: currentUser?.email || '',
        }
    });

    // Category request form
    const {
        register: registerCategoryRequest,
        handleSubmit: handleSubmitCategoryRequest,
        formState: { errors: categoryRequestErrors },
        reset: resetCategoryRequestForm,
    } = useForm<CategoryRequestFormData>({
        resolver: zodResolver(categoryRequestSchema),
        defaultValues: {
            name: '',
            requestedBy: currentUser?.uid || '',
            requestedByEmail: currentUser?.email || '',
        }
    });

    const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
        control,
        name: 'technicalSkills',
    });

    // Handle skill request submission
    const onSubmitSkillRequest = async (data: SkillRequestFormData) => {
        if (!currentUser) {
            alert('You must be logged in to request a skill');
            return;
        }
        setIsSubmittingSkillRequest(true);
        setSkillRequestMessage(null);
        setSkillRequestError(null);
        try {
            await createSkillRequest(
                data.name,
                data.categoryId,
            );
            setSkillRequestMessage('Skill request submitted successfully!');
            resetSkillRequestForm();
            setShowSkillRequest(false);
        } catch (err: any) {
            setSkillRequestError(err.message || 'Failed to submit skill request');
        }
        setIsSubmittingSkillRequest(false);
    };

    // Handle category request submission
    const onSubmitCategoryRequest = async (data: CategoryRequestFormData) => {
        if (!currentUser) {
            alert('You must be logged in to request a category');
            return;
        }
        setIsSubmittingCategoryRequest(true);
        setCategoryRequestMessage(null);
        setCategoryRequestError(null);


        // name: data.name,
        // requestedBy: currentUser.uid,
        // requestedByEmail: currentUser.email || ''
        try {
            await createCategoryRequest(data.name, currentUser.uid, (currentUser.email || ''));
            setCategoryRequestMessage('Category request submitted successfully!');
            resetCategoryRequestForm();
            setShowCategoryRequest(false);
        } catch (err: any) {
            setCategoryRequestError(err.message || 'Failed to submit category request');
        }
        setIsSubmittingCategoryRequest(false);
    };

    // Helper functions
    const getCategoryOptions = () => {
        return [...categoryRequests, ...categories].map(category => ({
            value: category.id,
            label: category.name,
        }));
    };

    const getSkillOptions = (categoryId: string) => {
        return [...skillRequests, ...skills]
            .filter(skill => skill.categoryId === categoryId)
            .map(skill => ({
                value: skill.id,
                label: skill.name,
            }));
    };

    const addSkillToCategory = (categoryIndex: number) => {
        const currentSkills = getValues(`technicalSkills.${categoryIndex}.skills`) || [];
        setValue(`technicalSkills.${categoryIndex}.skills`, [...currentSkills, { skillId: '', proficiency: '' }]);
    };

    const removeSkillFromCategory = (categoryIndex: number, skillIndex: number) => {
        const currentSkills = getValues(`technicalSkills.${categoryIndex}.skills`) || [];
        if (currentSkills.length > 1) {
            const newSkills = currentSkills.filter((_: any, index: number) => index !== skillIndex);
            setValue(`technicalSkills.${categoryIndex}.skills`, newSkills);
        }
    };

    const openSkillRequestModal = (categoryId: string) => {
        if (!categoryId) {
            alert('Please select a category first');
            return;
        }
        setShowSkillRequest(true);
    };

    // Watch for changes to clear messages
    useEffect(() => {
        if (skillRequestMessage || skillRequestError) {
            const timer = setTimeout(() => {
                setSkillRequestMessage(null);
                setSkillRequestError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [skillRequestMessage, skillRequestError]);

    useEffect(() => {
        if (categoryRequestMessage || categoryRequestError) {
            const timer = setTimeout(() => {
                setCategoryRequestMessage(null);
                setCategoryRequestError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [categoryRequestMessage, categoryRequestError]);

    return (
        <div className="space-y-6">
            {/* Success/Error Messages */}
            {skillRequestMessage && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
                    {skillRequestMessage}
                </div>
            )}
            {skillRequestError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                    {skillRequestError}
                </div>
            )}
            {categoryRequestMessage && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
                    {categoryRequestMessage}
                </div>
            )}
            {categoryRequestError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                    {categoryRequestError}
                </div>
            )}

            {/* Skill Request Modal/Form */}
            {showSkillRequest && (
                <Card className="p-6 border-2 border-blue-200 bg-blue-50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                            <Lightbulb className="w-5 h-5 mr-2" />
                            Request New Skill
                        </h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setShowSkillRequest(false);
                                resetSkillRequestForm();
                                setSkillRequestMessage(null);
                                setSkillRequestError(null);
                            }}
                        >
                            Cancel
                        </Button>
                    </div>

                    <form onSubmit={handleSubmitSkillRequest(onSubmitSkillRequest)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                {...registerSkillRequest('name')}
                                label="Skill Name"
                                placeholder="e.g., React.js, Python"
                                error={skillRequestErrors.name?.message}
                                required
                            />

                            <Controller
                                name="categoryId"
                                control={skillRequestControl}
                                render={({ field: { onChange, value } }) => (
                                    <Select
                                        label="Category"
                                        placeholder="Select category..."
                                        options={getCategoryOptions()}
                                        value={getCategoryOptions().find(option => option.value === value) || null}
                                        onChange={(selectedOption: any) => onChange(selectedOption?.value || '')}
                                        error={skillRequestErrors.categoryId?.message}
                                        required
                                    />
                                )}
                            />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowSkillRequest(false);
                                    resetSkillRequestForm();
                                    setSkillRequestMessage(null);
                                    setSkillRequestError(null);
                                }}
                                disabled={isSubmittingSkillRequest}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmittingSkillRequest}
                                className="flex items-center"
                            >
                                <Lightbulb className="w-4 h-4 mr-2" />
                                {isSubmittingSkillRequest ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Category Request Modal/Form */}
            {showCategoryRequest && (
                <Card className="p-6 border-2 border-purple-200 bg-purple-50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                            <Tag className="w-5 h-5 mr-2" />
                            Request New Category
                        </h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setShowCategoryRequest(false);
                                resetCategoryRequestForm();
                                setCategoryRequestMessage(null);
                                setCategoryRequestError(null);
                            }}
                        >
                            Cancel
                        </Button>
                    </div>

                    <form onSubmit={handleSubmitCategoryRequest(onSubmitCategoryRequest)} className="space-y-4">
                        <Input
                            {...registerCategoryRequest('name')}
                            label="Category Name"
                            placeholder="e.g., Web Development, Data Science"
                            error={categoryRequestErrors.name?.message}
                            required
                        />

                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                <strong>Note:</strong> Your category request will be reviewed by an administrator.
                                You&apos;ll be notified once it&apos;s approved or if more information is needed.
                            </p>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowCategoryRequest(false);
                                    resetCategoryRequestForm();
                                    setCategoryRequestMessage(null);
                                    setCategoryRequestError(null);
                                }}
                                disabled={isSubmittingCategoryRequest}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmittingCategoryRequest}
                                className="flex items-center"
                            >
                                <Tag className="w-4 h-4 mr-2" />
                                {isSubmittingCategoryRequest ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Technical Skills */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <Code className="w-5 h-5 mr-2" />
                        Technical Skills
                    </h3>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-purple-600 hover:text-purple-800"
                            onClick={() => setShowCategoryRequest(true)}
                        >
                            <Tag className="w-4 h-4 mr-2" />
                            Request Category
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => appendSkill({ category: '', skills: [{ skillId: '', proficiency: '' }] })}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Skill Category
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {skillFields.map((field, categoryIndex) => {
                        const categoryId = watch(`technicalSkills.${categoryIndex}.category`);
                        const skillOptions = categoryId ? getSkillOptions(categoryId) : [];
                        const categoryOptions = getCategoryOptions();
                        const currentSkills = watch(`technicalSkills.${categoryIndex}.skills`) || [{ skillId: '', proficiency: '' }];

                        return (
                            <div key={field.id} className="grid grid-cols-1 gap-4 p-4 border border-gray-200 rounded-lg">
                                {/* Category and Proficiency Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Controller
                                        name={`technicalSkills.${categoryIndex}.category`}
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <Select
                                                label="Skill Category"
                                                placeholder="Select a category..."
                                                options={categoryOptions}
                                                value={categoryOptions.find(option => option.value === value) || null}
                                                onChange={(selectedOption: any) => {
                                                    onChange(selectedOption?.value || '');
                                                    setValue(`technicalSkills.${categoryIndex}.skills`, [{ skillId: '', proficiency: '' }]);
                                                }}
                                                loading={categoriesLoading}
                                                searchable={true}
                                                clearable={true}
                                                error={(errors.technicalSkills as any)?.[categoryIndex]?.category?.message}
                                                required
                                            />
                                        )}
                                    />
                                    {skillFields.length > 1 && (
                                        <DeleteButton
                                            alignWith="floating-input"
                                            onDelete={() => removeSkill(categoryIndex)}
                                        />
                                    )}
                                </div>

                                {/* Skills Section */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-gray-700">Skills</label>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-blue-600 hover:text-blue-800"
                                                onClick={() => openSkillRequestModal(categoryId)}
                                                disabled={!categoryId}
                                            >
                                                <Lightbulb className="w-4 h-4 mr-2" />
                                                Request Skill
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addSkillToCategory(categoryIndex)}
                                                disabled={!categoryId}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Skill
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1">
                                        {currentSkills.map((skill: any, skillIndex: number) => (
                                            <div key={skillIndex} className="flex items-center my-2 gap-2">
                                                <Controller
                                                    name={`technicalSkills.${categoryIndex}.skills.${skillIndex}.skillId`}
                                                    control={control}
                                                    render={({ field: { onChange, value } }) => (
                                                        <Select
                                                            label="Skill"
                                                            placeholder="Select a skill..."
                                                            options={skillOptions}
                                                            value={skillOptions.find(option => option.value === value) || null}
                                                            onChange={(selectedOption: any) => onChange(selectedOption?.value || '')}
                                                            loading={skillsLoading}
                                                            searchable={true}
                                                            clearable={true}
                                                            error={(errors.technicalSkills as any)?.[categoryIndex]?.skills?.[skillIndex]?.skillId?.message}
                                                            className="flex-1"
                                                        />
                                                    )}
                                                />
                                                <Controller
                                                    name={`technicalSkills.${categoryIndex}.skills.${skillIndex}.proficiency`}
                                                    control={control}
                                                    render={({ field: { onChange, value } }) => (
                                                        <Select
                                                            label="Proficiency"
                                                            placeholder="Select proficiency..."
                                                            options={proficiencyOptions}
                                                            value={proficiencyOptions.find(option => option.value === value) || null}
                                                            onChange={(selectedOption: any) => onChange(selectedOption?.value || '')}
                                                            error={(errors.technicalSkills as any)?.[categoryIndex]?.skills?.[skillIndex]?.proficiency?.message}
                                                            className="flex-1"
                                                        />
                                                    )}
                                                />
                                                {currentSkills.length > 1 && (
                                                    <DeleteButton
                                                        alignWith="floating-input"
                                                        onDelete={() => removeSkillFromCategory(categoryIndex, skillIndex)}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
} 