'use client';

import { useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';
import { RootState } from '@/lib/redux/store';
import { updateFormData } from '@/lib/redux/slices/portfolioSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GraduationCap, Award, BookOpen, Plus, Trash2 } from 'lucide-react';
import { DeleteButton } from '@/components/ui/DeleteButton';

// Validation schema for Step2Education.tsx
const step2Schema = z.object({
    education: z.array(z.object({
        degree: z.string().min(1, 'Degree is required'),
        institution: z.string().min(1, 'Institution is required'),
        passingYear: z.number().min(1900, 'Year must be valid').max(new Date().getFullYear() + 10, 'Year cannot be too far in the future'),
        grade: z.string().optional(),
    })).min(1, 'At least one education entry is required'),
    certifications: z.array(z.object({
        name: z.string().min(1, 'Certification name is required'),
        issuingOrganization: z.string().min(1, 'Issuing organization is required'),
        year: z.number().min(1900, 'Year must be valid').max(new Date().getFullYear() + 10, 'Year cannot be too far in the future'),
        expiryDate: z.string().optional(),
        credentialId: z.string().optional(),
    })).optional(),
    courses: z.array(z.object({
        name: z.string().min(1, 'Course name is required'),
        provider: z.string().min(1, 'Provider is required'),
        completionDate: z.string().min(1, 'Completion date is required'),
        duration: z.string().optional(),
    })).optional(),
});

type Step2FormData = z.infer<typeof step2Schema>;

export function Step2Education() {
    const dispatch = useDispatch();
    const { formData } = useSelector((state: RootState) => state.portfolio);
    const previousDataRef = useRef<string>('');

    const {
        register,
        control,
        watch,
        formState: { errors },
    } = useForm<Step2FormData>({
        resolver: zodResolver(step2Schema),
        defaultValues: {
            education: formData.education || [{ degree: '', institution: '', year: new Date().getFullYear() }],
            certifications: formData.certifications || [],
            courses: formData.courses || [],
        },
    });

    const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
        control,
        name: 'education',
    });

    const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
        control,
        name: 'certifications',
    });

    const { fields: courseFields, append: appendCourse, remove: removeCourse } = useFieldArray({
        control,
        name: 'courses',
    });

    const watchedData = watch();

    // Solution 1: Use deep comparison to prevent unnecessary updates
    useEffect(() => {
        const currentDataString = JSON.stringify(watchedData);

        if (currentDataString !== previousDataRef.current) {
            dispatch(updateFormData(watchedData));
            previousDataRef.current = currentDataString;
        }
    }, [watchedData, dispatch]);

    // Alternative Solution 2: Debounced update (uncomment to use instead of Solution 1)
    /*
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            dispatch(updateFormData(watchedData));
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [watchedData, dispatch]);
    */

    // Alternative Solution 3: Manual update on specific events (uncomment to use instead of Solution 1)
    /*
    const handleFormChange = useCallback(() => {
        const currentData = watch();
        dispatch(updateFormData(currentData));
    }, [watch, dispatch]);
    */

    return (
        <div className="space-y-6">
            {/* Education */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Education
                    </h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => appendEducation({ degree: '', institution: '', passingYear: new Date().getFullYear() })}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Education
                    </Button>
                </div>

                <div className="space-y-4">
                    {educationFields.map((field, index) => (
                        <div key={`education-${index}`} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                            <Input
                                {...register(`education.${index}.degree`)}
                                label="Degree"
                                placeholder="e.g., Bachelor of Science in Computer Science"
                                error={errors.education?.[index]?.degree?.message}
                                required
                            />

                            <Input
                                {...register(`education.${index}.institution`)}
                                label="Institution"
                                placeholder="e.g., University of Dhaka"
                                error={errors.education?.[index]?.institution?.message}
                                required
                            />

                            <div className="flex gap-2">
                                <Input
                                    {...register(`education.${index}.passingYear`, { valueAsNumber: true })}
                                    type="number"
                                    label="Passing Year"
                                    placeholder="e.g., 2020"
                                    error={errors.education?.[index]?.passingYear?.message}
                                    required
                                    className="flex-1"
                                />
                                {educationFields.length > 1 && (
                                    <DeleteButton
                                        alignWith="floating-input"
                                        onDelete={() => removeEducation(index)}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Certifications */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        Certifications
                    </h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className='cursor-pointer'
                        onClick={() => appendCertification({ name: '', issuingOrganization: '', year: new Date().getFullYear() })}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Certification
                    </Button>
                </div>

                {certificationFields.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                        {'No certifications added yet. Click "Add Certification" to get started.'}
                    </p>
                ) : (
                    <div className="space-y-4">
                        {certificationFields.map((field, index) => (
                            <div key={`certificate-${index}`} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                                <Input
                                    {...register(`certifications.${index}.name`)}
                                    label="Certification Name"
                                    placeholder="e.g., AWS Certified Solutions Architect"
                                    error={errors.certifications?.[index]?.name?.message}
                                    required
                                />

                                <Input
                                    {...register(`certifications.${index}.issuingOrganization`)}
                                    label="Issuing Organization"
                                    placeholder="e.g., Amazon Web Services"
                                    error={errors.certifications?.[index]?.issuingOrganization?.message}
                                    required
                                />

                                <div className="flex gap-2">
                                    <Input
                                        {...register(`certifications.${index}.year`)}
                                        label="Year"
                                        placeholder="e.g., 2023"
                                        error={errors.certifications?.[index]?.year?.message}
                                        required
                                        className="flex-1"
                                    />
                                    <DeleteButton
                                        alignWith="floating-input"
                                        onDelete={() => removeCertification(index)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Courses */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <BookOpen className="w-5 h-5 mr-2" />
                        Courses
                    </h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendCourse({ name: '', provider: '', completionDate: '' })}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Course
                    </Button>
                </div>

                {courseFields.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                        {'No courses added yet. Click "Add Course" to get started.'}
                    </p>
                ) : (
                    <div className="space-y-4">
                        {courseFields.map((field, index) => (
                            <div key={`course-${index}`} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                                <Input
                                    {...register(`courses.${index}.name`)}
                                    label="Course Name"
                                    placeholder="e.g., Complete React Developer Course"
                                    error={errors.courses?.[index]?.name?.message}
                                    required
                                />

                                <Input
                                    {...register(`courses.${index}.provider`)}
                                    label="Provider"
                                    placeholder="e.g., Udemy, Coursera"
                                    error={errors.courses?.[index]?.provider?.message}
                                    required
                                />

                                <div className="flex gap-2">
                                    <Input
                                        {...register(`courses.${index}.completionDate`)}
                                        label="Completion Date"
                                        placeholder="e.g., 2023-05"
                                        error={errors.courses?.[index]?.completionDate?.message}
                                        required
                                        className="flex-1"
                                    />
                                    <DeleteButton
                                        alignWith="floating-input"
                                        onDelete={() => removeCourse(index)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Tips */}
            <Card className="p-6 bg-blue-50 border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Tips for this section:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• List your education in reverse chronological order (most recent first)</li>
                    <li>• Include relevant certifications that showcase your expertise</li>
                    <li>• Add online courses that complement your professional skills</li>
                    <li>• Use completion dates in YYYY-MM format for courses</li>
                </ul>
            </Card>
        </div>
    );
}