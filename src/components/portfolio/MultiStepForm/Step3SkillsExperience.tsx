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
import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';
import { SkillCategorySelector } from '../SkillCategorySelector';

// Zod schema remains unchanged
const step3Schema = z.object({
    technicalSkills: z
        .array(
            z.object({
                category: z.string().min(1, 'Category is required'),
                skills: z
                    .array(z.string().min(1, 'Skill cannot be empty'))
                    .min(1, 'At least one skill is required'),
                proficiency: z.string().min(1, 'Proficiency level is required'),
            })
        )
        .min(1, 'At least one technical skill category is required'),
    workExperience: z
        .array(
            z.object({
                company: z.string().min(1, 'Company name is required'),
                position: z.string().min(1, 'Position is required'),
                startDate: z.string().min(1, 'Start date is required'),
                endDate: z.string().optional(),
                isCurrentRole: z.boolean(),
                responsibilities: z
                    .array(z.string().min(1, 'Responsibility cannot be empty'))
                    .min(1, 'At least one responsibility is required'),
                technologies: z
                    .array(z.string().min(1, 'Technology cannot be empty'))
                    .optional(),
            })
        )
        .min(1, 'At least one work experience is required'),
});

type Step3FormData = z.infer<typeof step3Schema>;

const deepCopyJSON = (data) => JSON.parse(JSON.stringify(data));

export function Step3SkillsExperience() {
    const dispatch = useDispatch();
    const { formData } = useSelector((state: RootState) => state.portfolio);
    const { categories, loading: categoriesLoading } = useSkillCategories();
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedSkillIndex, setSelectedSkillIndex] = useState<number>(-1);
    const previousDataRef = useRef<string>('');

    const {
        register,
        control,
        watch,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<Step3FormData>({
        resolver: zodResolver(step3Schema),
        defaultValues: formData && (formData.technicalSkills || formData.workExperience)
            ? {
                technicalSkills: formData.technicalSkills?.length
                    ? deepCopyJSON(formData.technicalSkills)
                    : [{ category: '', skills: [''], proficiency: '' }],
                workExperience: formData.workExperience?.length
                    ? deepCopyJSON(formData.workExperience)
                    : [{
                        company: '',
                        position: '',
                        startDate: '',
                        endDate: '',
                        isCurrentRole: false,
                        responsibilities: [''],
                        technologies: [''],
                    }],
            }
            : {
                technicalSkills: [{ category: '', skills: [''], proficiency: '' }],
                workExperience: [{
                    company: '',
                    position: '',
                    startDate: '',
                    endDate: '',
                    isCurrentRole: false,
                    responsibilities: [''],
                    technologies: [''],
                }],
            },
    });

    const {
        fields: skillFields,
        append: appendSkill,
        remove: removeSkill
    } = useFieldArray({
        control,
        name: 'technicalSkills',
    });

    const {
        fields: experienceFields,
        append: appendExperience,
        remove: removeExperience
    } = useFieldArray({
        control,
        name: 'workExperience',
    });

    const watchedData = watch();

    // Update Redux store on form changes
    useEffect(() => {
        const currentDataString = JSON.stringify(watchedData);
        if (currentDataString !== previousDataRef.current) {
            dispatch(updateFormData(deepCopyJSON(watchedData)));
            previousDataRef.current = currentDataString;
        }
    }, [watchedData, dispatch]);

    // Handlers remain unchanged
    const handleCategorySelect = (category: string) => {
        if (selectedSkillIndex >= 0) {
            setValue(`technicalSkills.${selectedSkillIndex}.category`, category, { shouldValidate: true });
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
        setValue(`technicalSkills.${categoryIndex}.skills`, [...currentSkills, ''], { shouldValidate: true });
    };

    const removeSkillFromCategory = (categoryIndex: number, skillIndex: number) => {
        const currentSkills = getValues(`technicalSkills.${categoryIndex}.skills`);
        if (currentSkills.length > 1) {
            const newSkills = currentSkills.filter((_, index) => index !== skillIndex);
            setValue(`technicalSkills.${categoryIndex}.skills`, newSkills, { shouldValidate: true });
        }
    };

    const addResponsibility = (experienceIndex: number) => {
        const currentResponsibilities = getValues(`workExperience.${experienceIndex}.responsibilities`);
        setValue(`workExperience.${experienceIndex}.responsibilities`, [...currentResponsibilities, ''], { shouldValidate: true });
    };

    const removeResponsibility = (experienceIndex: number, responsibilityIndex: number) => {
        const currentResponsibilities = getValues(`workExperience.${experienceIndex}.responsibilities`);
        if (currentResponsibilities.length > 1) {
            const newResponsibilities = currentResponsibilities.filter((_, index) => index !== responsibilityIndex);
            setValue(`workExperience.${experienceIndex}.responsibilities`, newResponsibilities, { shouldValidate: true });
        }
    };

    const addTechnology = (experienceIndex: number) => {
        const currentTechnologies = getValues(`workExperience.${experienceIndex}.technologies`) || [];
        setValue(`workExperience.${experienceIndex}.technologies`, [...currentTechnologies, ''], { shouldValidate: true });
    };

    const removeTechnology = (experienceIndex: number, techIndex: number) => {
        const currentTechnologies = getValues(`workExperience.${experienceIndex}.technologies`) || [];
        if (currentTechnologies.length > 1) {
            const newTechnologies = currentTechnologies.filter((_, index) => index !== techIndex);
            setValue(`workExperience.${experienceIndex}.technologies`, newTechnologies, { shouldValidate: true });
        }
    };

    return (
        <div className="space-y-6">
            {/* Technical Skills Section */}
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
                        const currentSkills = watch(`technicalSkills.${categoryIndex}.skills`) || [''];

                        return (
                            <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                                <div className="space-y-4">
                                    {/* Category Selection and Proficiency */}
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <Input
                                                {...register(`technicalSkills.${categoryIndex}.category`)}
                                                label="Skill Category"
                                                placeholder="Select or enter category"
                                                error={errors.technicalSkills?.[categoryIndex]?.category?.message}
                                                required
                                                readOnly={categories?.length > 0}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[120px]">
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
                                            className="my-auto h-12"
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
                                                className="my-auto h-12 hover:bg-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>

                                    {/* Proficiency Error Display */}
                                    {errors.technicalSkills?.[categoryIndex]?.proficiency && (
                                        <p className="text-red-500 text-sm mt-1">
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
                                                <div key={skillIndex} className="flex gap-2 items-center">
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
                                                            className="my-auto h-12 hover:bg-red-400"
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

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium">About Skill Categories:</p>
                        <p>You can select from approved categories or request new ones. New category requests will be reviewed by administrators.</p>
                    </div>
                </div>
            </Card>

            {/* Work Experience Section */}
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
                            technologies: [''],
                        })}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Experience
                    </Button>
                </div>

                <div className="space-y-6">
                    {experienceFields.map((field, experienceIndex) => {
                        const currentResponsibilities = watch(`workExperience.${experienceIndex}.responsibilities`) || [''];
                        const currentTechnologies = watch(`workExperience.${experienceIndex}.technologies`) || [''];

                        return (
                            <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                                <div className="space-y-4">
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

                                    {experienceFields.length > 1 && (
                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeExperience(experienceIndex)}
                                                className="my-auto h-12 hover:bg-red-400"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Remove Experience
                                            </Button>
                                        </div>
                                    )}

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

                                        <div className="flex gap-10 justify-between space-y-2">
                                            {currentResponsibilities.map((_, responsibilityIndex) => (
                                                <div key={responsibilityIndex} className="flex gap-2 items-center">
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
                                                            className="my-auto h-12 hover:bg-red-400"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

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
                                                <div key={techIndex} className="flex gap-2 items-center">
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
                                                            className="my-auto h-12 hover:bg-red-400"
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

            {/* Tips Card */}
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

            {/* Skill Category Selector Modal */}
            <Modal
                isOpen={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                title="Select Skill Category"
                size="2xl"
            >
                <SkillCategorySelector
                    onSelect={handleCategorySelect}
                    onCancel={() => setShowCategoryModal(false)}
                />
            </Modal>
        </div>
    );
}