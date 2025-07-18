// src/components/portfolio/MultiStepForm/Step1PersonalInfo.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeleteButton } from '@/components/ui/DeleteButton';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/lib/contexts/ToastContext';
import { useLanguages } from '@/lib/hooks/useLanguages';
import { updateFormData, validateStep } from '@/lib/redux/slices/portfolioSlice';
import { RootState } from '@/lib/redux/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Mail, Phone, Plus, Upload, User, Users, X } from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';


const step1Schema = z.object({
    employeeCode: z.string().min(1, 'Employee code is required'),
    designation: z.string().min(1, 'Designation is required'),
    yearsOfExperience: z.number().nonnegative('Years of experience must be positive'),
    nationality: z.string().min(1, 'Nationality is required'),
    languageProficiency: z.array(
        z.object({
            language: z.string().min(1, 'Language name is required'),
            proficiency: z.string().min(1, 'Proficiency level is required'),
        })
    ).min(1, 'At least one language is required'),
    email: z.string().email('Please enter a valid email'),
    mobileNo: z.string().min(1, 'Mobile number is required'),
    profileImage: z.string().optional(),
    summary: z.string().min(50, 'Summary must be at least 50 characters'),
    references: z.array(
        z.object({
            name: z.string().min(1, 'Reference name is required'),
            contactInfo: z.string().min(1, 'Contact info is required'),
            relationship: z.string().min(1, 'Relationship is required'),
        })
    ).optional(),
});

type Step1FormData = z.infer<typeof step1Schema>;

// Proficiency level options
const proficiencyLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'professional', label: 'Professional' },
    { value: 'fluent', label: 'Fluent' },
    { value: 'native', label: 'Native' },
];

export function Step1PersonalInfo() {
    const dispatch = useDispatch();
    const toast = useToast();
    const { formData } = useSelector((state: RootState) => state.portfolio);
    const { languageOptions, loading: languagesLoading, error: languagesError } = useLanguages();
    const [profileImagePreview, setProfileImagePreview] = useState<string>('');
    const [isInitialized, setIsInitialized] = useState(false);

    // Ref to track all input elements in the form
    const formRef = useRef<HTMLFormElement>(null);

    // Helper function to trigger input component logic for all inputs
    const triggerInputComponentLogic = useCallback(() => {
        if (!formRef.current) return;

        // Get all input elements in the form
        const inputs = formRef.current.querySelectorAll('input[type="text"], input[type="email"], input[type="number"], textarea, select');

        inputs.forEach((input) => {
            if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement) {
                // Dispatch events to trigger Input component's internal state updates
                const inputEvent = new Event('input', { bubbles: true });
                const changeEvent = new Event('change', { bubbles: true });

                input.dispatchEvent(inputEvent);
                input.dispatchEvent(changeEvent);
            }
        });
    }, []);

    const normalizeFormData = useCallback((data: any): Step1FormData => {
        // Handle legacy languageProficiency format (array of strings) to new format (array of objects)
        let normalizedLanguageProficiency;
        if (Array.isArray(data.languageProficiency)) {
            if (data.languageProficiency.length > 0 && typeof data.languageProficiency[0] === 'string') {
                // Legacy format: convert strings to objects
                normalizedLanguageProficiency = data.languageProficiency.map((lang: string) => ({
                    language: lang,
                    proficiency: 'conversational' // default proficiency
                }));
            } else {
                // New format: ensure all objects have required properties
                normalizedLanguageProficiency = data.languageProficiency.map((item: any) => ({
                    language: item.language || '',
                    proficiency: item.proficiency || 'conversational'
                }));
            }
        } else {
            normalizedLanguageProficiency = [{ language: '', proficiency: 'conversational' }];
        }

        return {
            employeeCode: data.employeeCode || '',
            designation: data.designation || '',
            yearsOfExperience: Number(data.yearsOfExperience) || 0,
            nationality: data.nationality || '',
            languageProficiency: normalizedLanguageProficiency,
            email: data.email || '',
            mobileNo: data.mobileNo || '',
            profileImage: data.profileImage || '',
            summary: data.summary || '',
            references: Array.isArray(data.references)
                ? data.references.map((ref: any) => ({ ...ref }))
                : [{ name: '', contactInfo: '', relationship: '' }],
        };
    }, []);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<Step1FormData>({
        resolver: zodResolver(step1Schema),
        defaultValues: normalizeFormData(formData),
    });

    const { fields: referenceFields, append: appendReference, remove: removeReference } = useFieldArray<Step1FormData, "references">({
        control,
        name: 'references',
    });

    const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray<Step1FormData, "languageProficiency">({
        control,
        name: 'languageProficiency',
    });

    // Initialize form with Redux data on mount
    useEffect(() => {
        if (formData) {
            const normalizedData = normalizeFormData(formData);

            reset(normalizedData);

            if (normalizedData.profileImage) {
                setProfileImagePreview(normalizedData.profileImage);
            }

            // Trigger logic for all inputs after reset
            // setTimeout(() => {
            //     // Trigger Input component logic for all inputs
            //     triggerInputComponentLogic();
            // }, 0);

            // Move isInitialized inside this check if you really want to avoid re-inits
            if (!isInitialized) {
                setIsInitialized(true);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData, normalizeFormData, reset, triggerInputComponentLogic]);

    // Watch form changes and update Redux (only after initialization)
    useEffect(() => {
        if (!isInitialized) return;

        const subscription = watch((value) => {
            const normalizedValue = normalizeFormData(value);

            dispatch(updateFormData(normalizedValue));

            // Validate current form state
            const errorsArray = Object.values(errors)
                .flatMap((err) => err ? [err.message] : [])
                .filter((msg): msg is string => msg !== undefined);

            dispatch(validateStep({
                step: 1,
                isValid: errorsArray.length === 0,
                errors: errorsArray,
            }));
        });

        return () => subscription.unsubscribe();
    }, [watch, errors, dispatch, normalizeFormData, isInitialized]);

    const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            toast.error('Only JPG, PNG, and GIF formats are supported');
            return;
        }

        if (file.size > 1024 * 1024) {
            toast.error('Image size must be less than 1MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64String = e.target?.result as string;
            setValue('profileImage', base64String);
            setProfileImagePreview(base64String);
            toast.success('Profile image uploaded successfully');
        };
        reader.readAsDataURL(file);
    };

    const removeProfileImage = () => {
        setValue('profileImage', '');
        setProfileImagePreview('');
        toast.info('Profile image removed');
    };

    const onSubmit = (data: Step1FormData) => {
        const normalizedData = normalizeFormData(data);
        dispatch(updateFormData(normalizedData));
        dispatch(validateStep({ step: 1, isValid: true, errors: [] }));
        toast.success('Personal information saved');
    };

    // Show loading state during initialization
    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading form data...</p>
                </div>
            </div>
        );
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Personal Information
                    </h3>
                    <div className="space-y-4">
                        <Input
                            {...register('employeeCode')}
                            label="Employee Code"
                            placeholder="e.g., EMP001"
                            error={errors.employeeCode?.message}
                            required
                        />
                        <Input
                            {...register('designation')}
                            label="Designation"
                            placeholder="e.g., Software Engineer"
                            error={errors.designation?.message}
                            required
                        />
                        <Input
                            {...register('yearsOfExperience', { valueAsNumber: true })}
                            type="number"
                            label="Years of Experience"
                            placeholder="0"
                            error={errors.yearsOfExperience?.message}
                            required
                        />
                        <Input
                            {...register('nationality')}
                            label="Nationality"
                            placeholder="e.g., Bangladeshi"
                            error={errors.nationality?.message}
                            required
                        />
                    </div>
                </Card>

                {/* Contact Information */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Phone className="w-5 h-5 mr-2" />
                        Contact Information
                    </h3>
                    <div className="space-y-4">
                        <Input
                            {...register('email')}
                            type="email"
                            label="Email"
                            placeholder="your.email@example.com"
                            error={errors.email?.message}
                            icon={<Mail className="w-4 h-4" />}
                            required
                        />
                        <Input
                            {...register('mobileNo')}
                            label="Mobile Number"
                            placeholder="+880 1XXX-XXXXXX"
                            error={errors.mobileNo?.message}
                            icon={<Phone className="w-4 h-4" />}
                            required
                        />
                    </div>
                </Card>
            </div>

            {/* Profile Image */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Profile Image</h3>
                <div className="space-y-4">
                    {profileImagePreview ? (
                        <div className="relative inline-block">
                            <Image
                                width={128}
                                height={128}
                                src={profileImagePreview}
                                alt="Profile preview"
                                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                            />
                            <button
                                type="button"
                                onClick={removeProfileImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                aria-label="Remove profile image"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-12 h-12 text-gray-400" />
                        </div>
                    )}
                    <div>
                        <input
                            type="file"
                            id="profileImage"
                            accept="image/jpeg,image/png,image/gif"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <label htmlFor="profileImage" aria-label="Upload profile image">
                            <Button
                                type="button"
                                variant="outline"
                                className="cursor-pointer"
                                onClick={() => document.getElementById('profileImage')?.click()}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Image
                            </Button>
                        </label>
                        <p className="text-sm text-gray-500 mt-1">
                            Max size: 1MB. Supported formats: JPG, PNG, GIF
                        </p>
                    </div>
                </div>
            </Card>

            {/* Language Proficiency */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Language Proficiency</h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendLanguage({ language: '', proficiency: 'conversational' })}
                        className='cursor-pointer'
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Language
                    </Button>
                </div>

                {/* Show error if languages failed to load */}
                {languagesError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{languagesError}</p>
                    </div>
                )}

                <div className="space-y-4">
                    {languageFields.map((field, index) => (
                        <div key={`language-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg">
                            <div>
                                <Select
                                    label="Language"
                                    required
                                    options={languageOptions}
                                    loading={languagesLoading}
                                    searchable
                                    placeholder="Select or search language..."
                                    value={languageOptions.find(option => option.value === watch(`languageProficiency.${index}.language`)) || null}
                                    onChange={(selectedOption) => {
                                        if (selectedOption && 'value' in selectedOption) {
                                            setValue(`languageProficiency.${index}.language`, selectedOption.value || '');
                                        }
                                    }}
                                    error={errors.languageProficiency?.[index]?.language?.message}
                                />
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Select
                                        label="Proficiency Level"
                                        required
                                        options={proficiencyLevels}
                                        searchable={false}
                                        clearable={false}
                                        placeholder="Select proficiency..."
                                        value={proficiencyLevels.find(level => level.value === watch(`languageProficiency.${index}.proficiency`)) || proficiencyLevels[1]}
                                        onChange={(selectedOption) => {
                                            if (selectedOption && 'value' in selectedOption) {
                                                setValue(`languageProficiency.${index}.proficiency`, selectedOption.value || 'conversational');
                                            }
                                        }}
                                        error={errors.languageProficiency?.[index]?.proficiency?.message}
                                    />
                                </div>
                                {languageFields.length > 1 && (
                                    <DeleteButton
                                        alignWith="auto"
                                        onDelete={() => removeLanguage(index)}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Professional Summary */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Professional Summary
                </h3>
                <div>
                    <textarea
                        {...register('summary')}
                        rows={5}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Write a brief professional summary highlighting your key skills, experience, and career objectives..."
                    />
                    {errors.summary && (
                        <p className="text-red-500 text-sm mt-1">{errors.summary.message}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                        Minimum 50 characters required
                    </p>
                </div>
            </Card>

            {/* References */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        References
                    </h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendReference({ name: '', contactInfo: '', relationship: '' })}
                        className='cursor-pointer'
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Reference
                    </Button>
                </div>
                <div className="space-y-4">
                    {referenceFields.map((field, index) => (
                        <div key={`reference-${index}`} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                            <Input
                                {...register(`references.${index}.name`)}
                                label="Name"
                                placeholder="Reference Name"
                                error={errors.references?.[index]?.name?.message}
                            // required
                            />
                            <Input
                                {...register(`references.${index}.contactInfo`)}
                                label="Contact Info"
                                placeholder="Email or Phone"
                                error={errors.references?.[index]?.contactInfo?.message}
                            // required
                            />
                            <div className="flex gap-2">
                                <Input
                                    {...register(`references.${index}.relationship`)}
                                    label="Relationship"
                                    placeholder="e.g., Former Manager"
                                    error={errors.references?.[index]?.relationship?.message}
                                    // required
                                    className="flex-1"
                                />
                                {referenceFields.length > 1 && (
                                    <DeleteButton
                                        alignWith="floating-input"
                                        onDelete={() => removeReference(index)}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Button type="submit" className="hidden">Save Step</Button>
        </form>
    );
}