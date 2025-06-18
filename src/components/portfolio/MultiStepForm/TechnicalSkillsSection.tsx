// src\components\portfolio\MultiStepForm\TechnicalSkillsSection.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeleteButton } from '@/components/ui/DeleteButton';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/Select';
import { useSkillCategories } from '@/lib/hooks/useSkillCategories';
import { useSkillCategoryRequests, useSkillRequests } from '@/lib/hooks/useSkillCategoryRequests';
import { useSkills } from '@/lib/hooks/useSkills';
import { AlertCircle, Code, Plus } from 'lucide-react';
import { useState } from 'react';
import { Control, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { SkillCategorySelector } from '../SkillCategorySelector';
import { SelectOption } from '@/components/ui/Select';

// Schema for technical skills only
export const technicalSkillsSchema = z.object({
    technicalSkills: z
        .array(
            z.object({
                category: z.string().min(1, 'Category is required'),
                skills: z
                    .array(z.string().min(1, 'Skill ID cannot be empty'))
                    .min(1, 'At least one skill is required'),
                proficiency: z.string().min(1, 'Proficiency level is required'),
            })
        )
        .min(1, 'At least one technical skill category is required'),
});

export type TechnicalSkillsFormData = z.infer<typeof technicalSkillsSchema>;

interface TechnicalSkillsProps {
    control: Control<any>;
    register: any;
    watch: any;
    setValue: any;
    getValues: any;
    errors: any;
    initialData?: TechnicalSkillsFormData['technicalSkills'];
}

const proficiencyOptions = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' },
];

export function TechnicalSkills({
    control,
    // register,
    watch,
    setValue,
    getValues,
    errors,
    // initialData = [{ category: '', skills: [''], proficiency: '' }]
}: TechnicalSkillsProps) {
    const { categories, loading: categoriesLoading } = useSkillCategories();
    const { skills, loading: skillsLoading } = useSkills(categories);
    const { createSkillRequest } = useSkillRequests();
    const { createCategoryRequest } = useSkillCategoryRequests();

    // Modal states
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showSkillRequestModal, setShowSkillRequestModal] = useState(false);
    const [showCategoryRequestModal, setShowCategoryRequestModal] = useState(false);

    // Form states
    const [selectedSkillIndex, setSelectedSkillIndex] = useState<number>(-1);
    // const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number>(-1);
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillCategoryId, setNewSkillCategoryId] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');

    // Loading states
    const [isSubmittingSkillRequest, setIsSubmittingSkillRequest] = useState(false);
    const [isSubmittingCategoryRequest, setIsSubmittingCategoryRequest] = useState(false);

    const {
        fields: skillFields,
        append: appendSkill,
        remove: removeSkill,
    } = useFieldArray({
        control,
        name: 'technicalSkills',
    });

    // Handlers
    const handleCategorySelect = (categoryId: string) => {
        if (selectedSkillIndex >= 0) {
            setValue(`technicalSkills.${selectedSkillIndex}.category`, categoryId, { shouldValidate: true });
            // Clear skills when category changes
            setValue(`technicalSkills.${selectedSkillIndex}.skills`, [''], { shouldValidate: true });
        }
        setShowCategoryModal(false);
        setSelectedSkillIndex(-1);
    };

    // const openCategoryModal = (index: number) => {
    //     setSelectedSkillIndex(index);
    //     setShowCategoryModal(true);
    // };

    const openSkillRequestModal = (categoryIndex: number) => {
        const categoryId = watch(`technicalSkills.${categoryIndex}.category`);
        if (!categoryId) {
            alert('Please select a category first');
            return;
        }
        // setSelectedCategoryIndex(categoryIndex);
        setNewSkillCategoryId(categoryId);
        setShowSkillRequestModal(true);
    };

    const openCategoryRequestModal = () => {
        setShowCategoryRequestModal(true);
    };

    const handleSkillRequest = async () => {
        if (!newSkillName.trim() || !newSkillCategoryId) {
            alert('Please fill in all fields');
            return;
        }

        setIsSubmittingSkillRequest(true);
        try {
            await createSkillRequest(
                newSkillName.trim(),
                newSkillCategoryId,
                'Current User', // Replace with actual user name from auth context
                'user@example.com' // Replace with actual user email from auth context
            );

            setNewSkillName('');
            setNewSkillCategoryId('');
            setShowSkillRequestModal(false);
            alert('Skill request submitted successfully! It will be reviewed by an admin.');
        } catch (error) {
            console.error('Error requesting new skill:', error);
            alert('Failed to submit skill request. Please try again.');
        } finally {
            setIsSubmittingSkillRequest(false);
        }
    };

    const handleCategoryRequest = async () => {
        if (!newCategoryName.trim()) {
            alert('Please enter a category name');
            return;
        }

        setIsSubmittingCategoryRequest(true);
        try {
            await createCategoryRequest(
                newCategoryName.trim(),
                'Current User', // Replace with actual user name from auth context
                'user@example.com' // Replace with actual user email from auth context
            );

            setNewCategoryName('');
            setShowCategoryRequestModal(false);
            alert('Category request submitted successfully! It will be reviewed by an admin.');
        } catch (error) {
            console.error('Error requesting new category:', error);
            alert('Failed to submit category request. Please try again.');
        } finally {
            setIsSubmittingCategoryRequest(false);
        }
    };

    const addSkillToCategory = (categoryIndex: number) => {
        const currentSkills = getValues(`technicalSkills.${categoryIndex}.skills`);
        setValue(`technicalSkills.${categoryIndex}.skills`, [...currentSkills, ''], { shouldValidate: true });
    };

    const removeSkillFromCategory = (categoryIndex: number, skillIndex: number) => {
        const currentSkills = getValues(`technicalSkills.${categoryIndex}.skills`);
        if (currentSkills.length > 1) {
            const newSkills = currentSkills.filter((_: any, index: number) => index !== skillIndex);
            setValue(`technicalSkills.${categoryIndex}.skills`, newSkills, { shouldValidate: true });
        }
    };

    // Prepare skill options for react-select
    const getSkillOptions = (categoryId: string) => {
        return skills
            .filter(skill => skill.categoryId === categoryId)
            .map(skill => ({
                value: skill.id,
                label: skill.name,
            }));
    };

    // Prepare category options for react-select
    const getCategoryOptions = () => {
        return categories.map(category => ({
            value: category.id,
            label: category.name,
        }));
    };

    return (
        <>
            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <Code className="w-5 h-5 mr-2" />
                        Technical Skills
                    </h3>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={openCategoryRequestModal}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Request Category
                        </Button>
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
                </div>

                <div className="space-y-6">
                    {skillFields.map((field, categoryIndex) => {
                        const currentSkills = watch(`technicalSkills.${categoryIndex}.skills`) || [''];
                        const categoryId = watch(`technicalSkills.${categoryIndex}.category`);
                        const skillOptions = categoryId ? getSkillOptions(categoryId) : [];
                        const categoryOptions = getCategoryOptions();
                        const selectedCategory = categoryOptions.find(option => option.value === categoryId);

                        return (
                            <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                                <div className="space-y-4">
                                    {/* Category Selection and Proficiency */}
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <Select
                                                label="Skill Category"
                                                options={categoryOptions}
                                                value={selectedCategory}
                                                onChange={(option) => {
                                                    const selectedOption = option as SelectOption;
                                                    setValue(`technicalSkills.${categoryIndex}.category`, selectedOption?.value || '', {
                                                        shouldValidate: true,
                                                    });
                                                    // Clear skills when category changes
                                                    setValue(`technicalSkills.${categoryIndex}.skills`, [''], { shouldValidate: true });
                                                }}
                                                placeholder="Select a category..."
                                                error={errors.technicalSkills?.[categoryIndex]?.category?.message}
                                                isLoading={categoriesLoading}
                                                required
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[120px]">
                                            <Select
                                                label="Proficiency"
                                                options={proficiencyOptions}
                                                value={proficiencyOptions.find(
                                                    option => option.value === watch(`technicalSkills.${categoryIndex}.proficiency`)
                                                )}
                                                onChange={(option) => {
                                                    const selectedOption = option as SelectOption;
                                                    setValue(`technicalSkills.${categoryIndex}.proficiency`, selectedOption?.value || '', {
                                                        shouldValidate: true,
                                                    })
                                                }}
                                                error={errors.technicalSkills?.[categoryIndex]?.proficiency?.message}
                                                required
                                            />
                                        </div>
                                        {skillFields.length > 1 && (
                                            <DeleteButton
                                                alignWith="floating-input"
                                                onDelete={() => removeSkill(categoryIndex)}
                                            />
                                        )}
                                    </div>

                                    {/* Skills for this category */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium text-gray-700">Skills</label>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addSkillToCategory(categoryIndex)}
                                                    disabled={!categoryId}
                                                >
                                                    <Plus className="w-3 h-3 mr-1" />
                                                    Add Skill
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openSkillRequestModal(categoryIndex)}
                                                    disabled={!categoryId}
                                                >
                                                    <Plus className="w-3 h-3 mr-1" />
                                                    Request New Skill
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {currentSkills.map((skillId: string, skillIndex: number) => (
                                                <div key={skillIndex} className="flex gap-2 items-center">
                                                    <Select
                                                        options={skillOptions}
                                                        value={skillOptions.find(option => option.value === skillId)}
                                                        onChange={(option) => {
                                                            const selectedOption = option as SelectOption;
                                                            setValue(`technicalSkills.${categoryIndex}.skills.${skillIndex}`, selectedOption?.value || '', {
                                                                shouldValidate: true,
                                                            })
                                                        }}
                                                        placeholder="Select a skill..."
                                                        error={errors.technicalSkills?.[categoryIndex]?.skills?.[skillIndex]?.message}
                                                        isLoading={skillsLoading}
                                                        className="flex-1"
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
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium">About Skill Categories:</p>
                        <p>You can select from approved categories or request new ones. New category or skill requests will be reviewed by administrators.</p>
                    </div>
                </div>
            </Card>

            {/* Skill Category Selector Modal */}
            <Modal
                isOpen={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                title="Select Skill Category"
                size="2xl"
            >
                <SkillCategorySelector
                    onCategorySelect={handleCategorySelect}
                    onCancel={() => setShowCategoryModal(false)}
                />
            </Modal>

            {/* Skill Request Modal */}
            <Modal
                isOpen={showSkillRequestModal}
                onClose={() => setShowSkillRequestModal(false)}
                title="Request New Skill"
                size="lg"
            >
                <div className="space-y-4">
                    <Input
                        label="New Skill Name"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        placeholder="Enter new skill name"
                        required
                    />
                    <Select
                        label="Category"
                        options={categories.map(category => ({
                            value: category.id,
                            label: category.name,
                        }))}
                        value={categories
                            .map(category => ({
                                value: category.id,
                                label: category.name,
                            }))
                            .find(option => option.value === newSkillCategoryId)}
                        onChange={(option) => {
                            const selectedOption = option as SelectOption;
                            setNewSkillCategoryId(selectedOption?.value || '')
                        }}
                        placeholder="Select a category"
                        required
                    />
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowSkillRequestModal(false)}
                            disabled={isSubmittingSkillRequest}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSkillRequest}
                            disabled={!newSkillName.trim() || !newSkillCategoryId || isSubmittingSkillRequest}
                        >
                            {isSubmittingSkillRequest ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Category Request Modal */}
            <Modal
                isOpen={showCategoryRequestModal}
                onClose={() => setShowCategoryRequestModal(false)}
                title="Request New Category"
                size="lg"
            >
                <div className="space-y-4">
                    <Input
                        label="New Category Name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter new category name"
                        required
                    />
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> {`Your category request will be reviewed by an administrator.
                            You'll be notified once it's approved or if more information is needed.`}
                        </p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowCategoryRequestModal(false)}
                            disabled={isSubmittingCategoryRequest}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCategoryRequest}
                            disabled={!newCategoryName.trim() || isSubmittingCategoryRequest}
                        >
                            {isSubmittingCategoryRequest ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}