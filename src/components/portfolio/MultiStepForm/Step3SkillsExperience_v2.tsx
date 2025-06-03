// src\components\portfolio\MultiStepForm\Step3SkillsExperience.tsx
'use client';

import { updateFormData } from '@/lib/redux/slices/portfolioSlice';
import { RootState } from '@/lib/redux/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';
import { TechnicalSkillsSection } from './FormComponents/TechnicalSkillsSection';
import { WorkExperienceSection } from './FormComponents/WorkExperienceSection';

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

export type Step3FormData = z.infer<typeof step3Schema>;

export function Step3SkillsExperience() {
    const dispatch = useDispatch();
    const { formData } = useSelector((state: RootState) => state.portfolio);

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
                    category: skill.category,
                    skills: [...skill.skills],
                    proficiency: skill.proficiency,
                }))
                : [{
                    category: '',
                    skills: [''],
                    proficiency: '',
                }],
            workExperience: formData.workExperience && formData.workExperience.length > 0
                ? formData.workExperience.map(exp => ({
                    company: exp.company,
                    position: exp.position,
                    startDate: exp.startDate,
                    endDate: exp.endDate || '',
                    isCurrentRole: exp.isCurrentRole,
                    responsibilities: [...exp.responsibilities],
                    technologies: exp.technologies ? [...exp.technologies] : [''],
                }))
                : [{
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

    const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
        control,
        name: 'technicalSkills',
    });

    const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
        control,
        name: 'workExperience',
    });

    useEffect(() => {
        const subscription = watch((value) => {
            dispatch(updateFormData(value as Step3FormData));
        });
        return () => subscription.unsubscribe();
    }, [watch, dispatch]);

    return (
        <div className="space-y-6">
            <TechnicalSkillsSection
                control={control}
                register={register}
                setValue={setValue}
                getValues={getValues}
                errors={errors}
                skillFields={skillFields}
                appendSkill={appendSkill}
                removeSkill={removeSkill}
            />

            {/* <WorkExperienceSection
                control={control}
                register={register}
                setValue={setValue}
                getValues={getValues}
                watch={watch}
                errors={errors}
                experienceFields={experienceFields}
                appendExperience={appendExperience}
                removeExperience={removeExperience}
            /> */}
        </div>
    );
}