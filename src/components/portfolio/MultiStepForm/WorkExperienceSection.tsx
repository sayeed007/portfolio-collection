'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeleteButton } from '@/components/ui/DeleteButton';
import { Input } from '@/components/ui/input';
import { Briefcase, Plus } from 'lucide-react';
import { Control, useFieldArray } from 'react-hook-form';
import { z } from 'zod';

// Schema for work experience only
export const workExperienceSchema = z.object({
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

export type WorkExperienceFormData = z.infer<typeof workExperienceSchema>;

interface WorkExperienceProps {
    control: Control<any>;
    register: any;
    watch: any;
    setValue: any;
    getValues: any;
    errors: any;
    initialData?: WorkExperienceFormData['workExperience'];
}

export function WorkExperience({
    control,
    register,
    watch,
    setValue,
    getValues,
    errors,
}: WorkExperienceProps) {
    const {
        fields: experienceFields,
        append: appendExperience,
        remove: removeExperience,
    } = useFieldArray({
        control,
        name: 'workExperience',
    });

    const addResponsibility = (experienceIndex: number) => {
        const currentResponsibilities = getValues(`workExperience.${experienceIndex}.responsibilities`);
        setValue(`workExperience.${experienceIndex}.responsibilities`, [...currentResponsibilities, ''], { shouldValidate: false });
    };

    const removeResponsibility = (experienceIndex: number, responsibilityIndex: number) => {
        const currentResponsibilities = getValues(`workExperience.${experienceIndex}.responsibilities`);
        if (currentResponsibilities.length > 1) {
            const newResponsibilities = currentResponsibilities.filter((_: string, index: number) => index !== responsibilityIndex);
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
            const newTechnologies = currentTechnologies.filter((_: string, index: number) => index !== techIndex);
            setValue(`workExperience.${experienceIndex}.technologies`, newTechnologies, { shouldValidate: true });
        }
    };

    return (
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
                                        <DeleteButton
                                            alignWith="floating-input"
                                            onDelete={() => removeExperience(experienceIndex)}
                                        />
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

                                    <div className="space-y-2">
                                        {currentResponsibilities.map((_: string, responsibilityIndex: number) => (
                                            <div key={responsibilityIndex} className="flex gap-2 items-center">
                                                <div className="flex-1">
                                                    <Input
                                                        {...register(`workExperience.${experienceIndex}.responsibilities.${responsibilityIndex}`)}
                                                        placeholder="e.g., Developed and maintained web applications using React and Node.js"
                                                        error={errors.workExperience?.[experienceIndex]?.responsibilities?.[responsibilityIndex]?.message}
                                                    />
                                                </div>
                                                {currentResponsibilities.length > 1 && (
                                                    <DeleteButton
                                                        alignWith={errors.workExperience?.[experienceIndex]?.responsibilities?.[responsibilityIndex]?.message ? "error" : "auto"}
                                                        onDelete={() => removeResponsibility(experienceIndex, responsibilityIndex)}
                                                    />
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {currentTechnologies.map((_: string, techIndex: number) => (
                                            <div key={techIndex} className="flex gap-1 items-center">
                                                <div className="flex-1">
                                                    <Input
                                                        {...register(`workExperience.${experienceIndex}.technologies.${techIndex}`)}
                                                        placeholder="e.g., React, Node.js, PostgreSQL"
                                                        error={errors.workExperience?.[experienceIndex]?.technologies?.[techIndex]?.message}
                                                        className="flex-1"
                                                    />
                                                </div>
                                                {currentTechnologies.length > 1 && (
                                                    <DeleteButton
                                                        alignWith={errors.workExperience?.[experienceIndex]?.technologies?.[techIndex]?.message ? 'error' : 'auto'}
                                                        onDelete={() => removeTechnology(experienceIndex, techIndex)}
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
        </Card>
    );
}