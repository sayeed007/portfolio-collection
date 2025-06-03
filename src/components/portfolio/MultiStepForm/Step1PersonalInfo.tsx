// src/components/portfolio/MultiStepForm/Step1PersonalInfo.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';
import { RootState } from '@/lib/redux/store';
import { updateFormData, validateStep } from '@/lib/redux/slices/portfolioSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/lib/contexts/ToastContext';
import { User, Phone, Mail, FileText, Users, Plus, Trash2, Upload, X } from 'lucide-react';

const step1Schema = z.object({
    employeeCode: z.string().min(1, 'Employee code is required'),
    designation: z.string().min(1, 'Designation is required'),
    yearsOfExperience: z.number().nonnegative('Years of experience must be positive'),
    nationality: z.string().min(1, 'Nationality is required'),
    languageProficiency: z.array(z.string().min(1, 'Language cannot be empty')).min(1, 'At least one language is required'),
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
    // .min(1, 'At least one reference is required'),
});

type Step1FormData = z.infer<typeof step1Schema>;

export function Step1PersonalInfo() {
    const dispatch = useDispatch();
    const toast = useToast();
    const { formData } = useSelector((state: RootState) => state.portfolio);
    const [profileImagePreview, setProfileImagePreview] = useState<string>('');

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<Step1FormData>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            employeeCode: '200054',
            designation: 'Sr. Engineer',
            yearsOfExperience: 4,
            nationality: 'Bangladeshi',
            languageProficiency: ['Bangla', 'English'],
            email: 'sayeed.bappy@neural-semiconductor.com',
            mobileNo: '+8801934939844',
            profileImage: '',
            summary: 'Mobile App Developer with 4+ years of experience delivering cross-platform apps for enterprise and consumer use. Skilled in React Native, Angular, Bluetooth integration, and offline-first design. Adept at collaborating with UI/UX teams and ensuring performance and scalability in mobile applications.',
            references: [{ name: 'Md. X', contactInfo: '+8801626443576', relationship: 'Teacher' }],
            // Remove upper part in production
            // employeeCode: formData.employeeCode || '',
            // designation: formData.designation || '',
            // yearsOfExperience: formData.yearsOfExperience || 0,
            // nationality: formData.nationality || '',
            // languageProficiency: formData.languageProficiency || [''],
            // email: formData.email || '',
            // mobileNo: formData.mobileNo || '',
            // profileImage: formData.profileImage || '',
            // summary: formData.summary || '',
            // references: formData.references || [{ name: '', contactInfo: '', relationship: '' }],
        },
    });

    const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
        control,
        name: 'languageProficiency',
    });

    const { fields: referenceFields, append: appendReference, remove: removeReference } = useFieldArray({
        control,
        name: 'references',
    });

    // Use specific field watches instead of watching all data
    const employeeCode = watch('employeeCode');
    const designation = watch('designation');
    const yearsOfExperience = watch('yearsOfExperience');
    const nationality = watch('nationality');
    const languageProficiency = watch('languageProficiency');
    const email = watch('email');
    const mobileNo = watch('mobileNo');
    const profileImage = watch('profileImage');
    const summary = watch('summary');
    const references = watch('references');

    // Memoize the form data object to prevent unnecessary re-renders
    const currentFormData = useCallback(() => ({
        employeeCode,
        designation,
        yearsOfExperience,
        nationality,
        languageProficiency,
        email,
        mobileNo,
        profileImage,
        summary,
        references,
    }), [
        employeeCode,
        designation,
        yearsOfExperience,
        nationality,
        languageProficiency,
        email,
        mobileNo,
        profileImage,
        summary,
        references,
    ]);

    // Update form data and validation with proper dependencies
    useEffect(() => {
        const formData = currentFormData();
        dispatch(updateFormData(formData));

        const errorsArray = Object.values(errors).flatMap((err) =>
            err ? [err.message] : []
        );

        dispatch(validateStep({
            step: 1,
            isValid: errorsArray.length === 0,
            errors: errorsArray,
        }));
    }, [
        employeeCode,
        designation,
        yearsOfExperience,
        nationality,
        languageProficiency,
        email,
        mobileNo,
        profileImage,
        summary,
        references,
        errors,
        dispatch,
        currentFormData,
    ]);

    useEffect(() => {
        if (formData.profileImage) {
            setProfileImagePreview(formData.profileImage);
        }
    }, [formData.profileImage]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        dispatch(updateFormData(data));
        dispatch(validateStep({ step: 1, isValid: true, errors: [] }));
        toast.success('Personal information saved');
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                            <img
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
                        onClick={() => appendLanguage('')}
                        className='cursor-pointer'
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Language
                    </Button>
                </div>
                <div className="flex flex-wrap gap-10 space-y-3">
                    {languageFields.map((field, index) => (
                        <div key={field.id} className="flex w-1/3 gap-2">
                            <Input
                                {...register(`languageProficiency.${index}`)}
                                placeholder="e.g., English, Bengali"
                                error={errors.languageProficiency?.[index]?.message}
                                className="flex-1"
                            />
                            {languageFields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeLanguage(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
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
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                            <Input
                                {...register(`references.${index}.name`)}
                                label="Name"
                                placeholder="Reference Name"
                                error={errors.references?.[index]?.name?.message}
                                required
                            />
                            <Input
                                {...register(`references.${index}.contactInfo`)}
                                label="Contact Info"
                                placeholder="Email or Phone"
                                error={errors.references?.[index]?.contactInfo?.message}
                                required
                            />
                            <div className="flex gap-2">
                                <Input
                                    {...register(`references.${index}.relationship`)}
                                    label="Relationship"
                                    placeholder="e.g., Former Manager"
                                    error={errors.references?.[index]?.relationship?.message}
                                    required
                                    className="flex-1"
                                />
                                {referenceFields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeReference(index)}
                                        className="my-auto cursor-pointer hover:bg-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
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