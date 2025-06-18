'use client';

import { Card } from '@/components/ui/card';
import { updateFormData } from '@/lib/redux/slices/portfolioSlice';
import { RootState } from '@/lib/redux/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';
import { TechnicalSkills, technicalSkillsSchema } from './TechnicalSkillsSection';
import { WorkExperience, workExperienceSchema } from './WorkExperienceSection';

// Combined schema
const step3Schema = z.object({
    ...technicalSkillsSchema.shape,
    ...workExperienceSchema.shape,
});

type Step3FormData = z.infer<typeof step3Schema>;

const deepCopyJSON = (data: any) => JSON.parse(JSON.stringify(data));

export function Step3SkillsExperience() {
    const dispatch = useDispatch();
    const { formData } = useSelector((state: RootState) => state.portfolio);
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

    const watchedData = watch();

    // Update Redux store on form changes
    useEffect(() => {
        const currentDataString = JSON.stringify(watchedData);
        if (currentDataString !== previousDataRef.current) {
            dispatch(updateFormData(deepCopyJSON(watchedData)));
            previousDataRef.current = currentDataString;
        }
    }, [watchedData, dispatch]);

    return (
        <div className="space-y-6">
            {/* Technical Skills Section */}
            <TechnicalSkills
                control={control}
                register={register}
                watch={watch}
                setValue={setValue}
                getValues={getValues}
                errors={errors}
                initialData={formData?.technicalSkills}
            />

            {/* Work Experience Section */}
            <WorkExperience
                control={control}
                register={register}
                watch={watch}
                setValue={setValue}
                getValues={getValues}
                errors={errors}
            // initialData={formData?.workExperience}
            />

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
        </div>
    );
}