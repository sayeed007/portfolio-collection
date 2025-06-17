'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeleteButton } from '@/components/ui/DeleteButton';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/Select';
import { YearSelect } from '@/components/ui/YearSelect';
import { useDegree } from '@/lib/hooks/useDegree';
import { useInstitution } from '@/lib/hooks/useInstitution';
import { initialCertification, initialCourse, updateFormData } from '@/lib/redux/slices/portfolioSlice';
import { RootState } from '@/lib/redux/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Award, BookOpen, GraduationCap, Plus } from 'lucide-react';
import { useEffect, useRef, useMemo } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';

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
        issuer: z.string(),
        year: z.number().min(1900, 'Year must be valid').max(new Date().getFullYear() + 10, 'Year cannot be too far in the future'),
        issuingOrganization: z.string().min(1, 'Issuing organization is required'),
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

    // Use the custom degree hook - only fetch active degrees for user selection
    const { degreeOptions, loading: degreesLoading } = useDegree({
        activeOnly: true
    });

    // Add institution hook - fetch active and verified institutions
    const { getInstitutionsByFilter, loading: institutionsLoading } = useInstitution();

    // Get institution options for dropdown - use useMemo to prevent recreation
    const institutionOptions = useMemo(() => {
        const institutions = getInstitutionsByFilter({
            isActive: true,
            isVerified: true
        });
        return institutions.map(institution => ({
            value: institution.name,
            label: `${institution.name}${institution.shortName ? ` (${institution.shortName})` : ''}`,
            searchableText: `${institution.name} ${institution.shortName || ''} ${institution.location} ${institution.type}`.toLowerCase()
        }));
    }, [getInstitutionsByFilter]);

    const {
        register,
        control,
        watch,
        formState: { errors },
    } = useForm<Step2FormData>({
        resolver: zodResolver(step2Schema),
        defaultValues: {
            education: JSON.parse(JSON.stringify(formData.education?.length > 0 ? formData.education.map(edu => ({
                ...edu,
                passingYear: typeof edu.passingYear === 'string' ? parseInt(edu.passingYear) : edu.passingYear
            })) : [{ degree: '', institution: '', passingYear: new Date().getFullYear() }])),
            certifications: JSON.parse(JSON.stringify(formData.certifications?.map(cert => ({
                name: cert.name,
                issuer: cert.issuingOrganization || '',
                date: cert.year.toString(),
                issuingOrganization: cert.issuingOrganization || '',
                year: typeof cert.year === 'string' ? parseInt(cert.year) : cert.year,
                expiryDate: cert.expiryDate || '',
                credentialId: cert.credentialId || ''
            })) || [])),
            courses: JSON.parse(JSON.stringify(formData.courses || [])),
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

    // Use deep comparison to prevent unnecessary updates with deep cloning
    useEffect(() => {
        const currentDataString = JSON.stringify(watchedData);
        if (currentDataString !== previousDataRef.current) {
            const mappedData = {
                education: JSON.parse(JSON.stringify(watchedData.education)),
                certifications: watchedData.certifications?.map(cert => ({
                    name: cert.name,
                    issuer: cert.issuingOrganization,
                    date: cert.year.toString(),
                    issuingOrganization: cert.issuingOrganization,
                    year: cert.year,
                    expiryDate: cert.expiryDate,
                    credentialId: cert.credentialId
                })),
                courses: JSON.parse(JSON.stringify(watchedData.courses))
            };
            dispatch(updateFormData(mappedData));
            previousDataRef.current = currentDataString;
        }
    }, [watchedData, dispatch]);

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
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                            <Controller
                                name={`education.${index}.degree`}
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <Select
                                        label="Degree"
                                        placeholder="Select a degree..."
                                        options={degreeOptions || []}
                                        value={degreeOptions?.find(option => option.value === value) || null}
                                        onChange={(selectedOption: any) => onChange(selectedOption?.value || '')}
                                        loading={degreesLoading}
                                        searchable={true}
                                        clearable={true}
                                        error={errors.education?.[index]?.degree?.message}
                                        required
                                    />
                                )}
                            />

                            <Controller
                                name={`education.${index}.institution`}
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <Select
                                        label="Institution"
                                        placeholder="Select an institution..."
                                        options={institutionOptions || []}
                                        value={institutionOptions?.find(option => option.value === value) || null}
                                        onChange={(selectedOption: any) => onChange(selectedOption?.value || '')}
                                        loading={institutionsLoading}
                                        searchable={true}
                                        clearable={true}
                                        error={errors.education?.[index]?.institution?.message}
                                        required
                                    />
                                )}
                            />

                            <div className="flex gap-2">
                                <Controller
                                    name={`education.${index}.passingYear`}
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <YearSelect
                                            label="Passing Year"
                                            placeholder="e.g., 2020"
                                            value={value}
                                            onChange={onChange}
                                            startYear={80}
                                            endYear={0}
                                            error={errors.education?.[index]?.passingYear?.message}
                                            required
                                            className="flex-1"
                                        />
                                    )}
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
                        onClick={() => appendCertification({ ...initialCertification })}
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
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                                <Input
                                    {...register(`certifications.${index}.name`)}
                                    label="Certification Name"
                                    placeholder="e.g., Microsoft Certified Professional"
                                    error={errors.certifications?.[index]?.name?.message}
                                    required
                                />

                                <Input
                                    {...register(`certifications.${index}.issuingOrganization`)}
                                    label="Issuing Organization"
                                    placeholder="e.g., Microsoft"
                                    error={errors.certifications?.[index]?.issuingOrganization?.message}
                                    required
                                />

                                <div className="flex gap-2">
                                    <Controller
                                        name={`certifications.${index}.year`}
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <YearSelect
                                                label="Year"
                                                placeholder="e.g., 2020"
                                                value={value}
                                                onChange={onChange}
                                                startYear={50}
                                                endYear={10}
                                                error={errors.certifications?.[index]?.year?.message}
                                                required
                                                className="flex-1"
                                            />
                                        )}
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
                        className="cursor-pointer"
                        onClick={() => appendCourse({ ...initialCourse })}
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
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                                <Input
                                    {...register(`courses.${index}.name`)}
                                    label="Course Name"
                                    placeholder="e.g., Introduction to Programming"
                                    error={errors.courses?.[index]?.name?.message}
                                    required
                                />

                                <Input
                                    {...register(`courses.${index}.provider`)}
                                    label="Provider"
                                    placeholder="e.g., Coursera"
                                    error={errors.courses?.[index]?.provider?.message}
                                    required
                                />

                                <div className="flex gap-2">
                                    <Input
                                        {...register(`courses.${index}.completionDate`)}
                                        type="date"
                                        label="Completion Date"
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
        </div>
    );
}