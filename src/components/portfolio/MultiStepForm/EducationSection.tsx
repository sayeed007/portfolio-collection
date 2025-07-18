'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeleteButton } from '@/components/ui/DeleteButton';
import { Select } from '@/components/ui/Select';
import { YearSelect } from '@/components/ui/YearSelect';
import { useDegree } from '@/lib/hooks/useDegree';
import { useInstitution } from '@/lib/hooks/useInstitution';
import { GraduationCap, Plus, Building2, Send } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Controller, useFieldArray, Control, FieldErrors, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { getAuth } from 'firebase/auth';

// Education schema
export const educationSchema = z.object({
    education: z.array(z.object({
        degree: z.string().min(1, 'Degree is required'),
        institution: z.string().min(1, 'Institution is required'),
        passingYear: z.number().min(1900, 'Year must be valid').max(new Date().getFullYear() + 10, 'Year cannot be too far in the future'),
        grade: z.string().optional(),
    })).min(1, 'At least one education entry is required'),
});

// Institution request form schema
const institutionRequestSchema = z.object({
    name: z.string().min(1, 'Institution name is required'),
    shortName: z.string().optional(),
    type: z.string().min(1, 'Institution type is required'),
    location: z.string().min(1, 'Location is required'),
    division: z.string().min(1, 'Division is required'),
    requestedBy: z.string().min(1, 'User ID is required'),
    requestedByEmail: z.string().email('Valid email is required'),
});

type InstitutionRequestFormData = z.infer<typeof institutionRequestSchema>;

// Institution types
const INSTITUTION_TYPES = [
    { value: 'University', label: 'University' },
    { value: 'College', label: 'College' },
    { value: 'School', label: 'School' },
    { value: 'Medical College', label: 'Medical College' },
    { value: 'Engineering College', label: 'Engineering College' },
    { value: 'Technical Institute', label: 'Technical Institute' },
    { value: 'Other', label: 'Other' },
];

// Bangladesh divisions
const DIVISIONS = [
    { value: 'Dhaka', label: 'Dhaka' },
    { value: 'Chittagong', label: 'Chittagong' },
    { value: 'Rajshahi', label: 'Rajshahi' },
    { value: 'Khulna', label: 'Khulna' },
    { value: 'Barisal', label: 'Barisal' },
    { value: 'Sylhet', label: 'Sylhet' },
    { value: 'Rangpur', label: 'Rangpur' },
    { value: 'Mymensingh', label: 'Mymensingh' },
];

interface EducationSectionProps {
    control: Control<any>;
    errors: FieldErrors<any>;
}

export function EducationSection({ control, errors }: EducationSectionProps) {
    const [showInstitutionRequest, setShowInstitutionRequest] = useState(false);
    const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

    // Get current user
    const auth = getAuth();
    const currentUser = auth.currentUser;

    // Use the custom degree hook - only fetch active degrees for user selection
    const { degreeOptions, loading: degreesLoading } = useDegree({
        activeOnly: true
    });

    // Add institution hook - fetch active and verified institutions
    const {
        getInstitutionsByFilter,
        loading: institutionsLoading,
        requestInstitution,
        success: institutionSuccess,
        error: institutionError,
        clearMessages,
        institutionRequests
    } = useInstitution();

    // Get institution options for dropdown - use useMemo to prevent recreation
    const institutionOptions = useMemo(() => {
        const institutions = getInstitutionsByFilter({
            isActive: true,
            isVerified: true
        });

        return [...institutionRequests, ...institutions].map(institution => ({
            value: institution.name,
            label: `${institution.name}${institution.shortName ? ` (${institution.shortName})` : ''}`,
            searchableText: `${institution.name} ${institution.shortName || ''} ${institution.location} ${institution.type}`.toLowerCase()
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getInstitutionsByFilter]);

    // Institution request form
    const {
        register: registerRequest,
        handleSubmit: handleSubmitRequest,
        control: requestControl,
        formState: { errors: requestErrors },
        reset: resetRequestForm,
    } = useForm<InstitutionRequestFormData>({
        resolver: zodResolver(institutionRequestSchema),
        defaultValues: {
            name: '',
            shortName: '',
            type: '',
            location: '',
            division: '',
            requestedBy: currentUser?.uid || '',
            requestedByEmail: currentUser?.email || '',
        }
    });

    const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
        control,
        name: 'education',
    });

    // Handle institution request submission
    const onSubmitInstitutionRequest = async (data: InstitutionRequestFormData) => {
        if (!currentUser) {
            alert('You must be logged in to request an institution');
            return;
        }

        setIsSubmittingRequest(true);
        clearMessages();

        // Ensure the required fields are included
        const requestData = {
            ...data,
            requestedBy: currentUser.uid,
            requestedByEmail: currentUser.email || '',
        };

        console.log('Submitting institution request:', requestData);

        const success = await requestInstitution(requestData);

        if (success) {
            resetRequestForm();
            setShowInstitutionRequest(false);
        }

        setIsSubmittingRequest(false);
    };

    // Clear messages when component unmounts or success/error changes
    useEffect(() => {
        if (institutionSuccess || institutionError) {
            const timer = setTimeout(() => {
                clearMessages();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [institutionSuccess, institutionError, clearMessages]);

    return (
        <div className="space-y-6">
            {/* Success/Error Messages */}
            {institutionSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
                    {institutionSuccess}
                </div>
            )}
            {institutionError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                    {institutionError}
                </div>
            )}

            {/* Institution Request Modal/Form */}
            {showInstitutionRequest && (
                <Card className="p-6 border-2 border-blue-200 bg-blue-50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                            <Building2 className="w-5 h-5 mr-2" />
                            Request New Institution
                        </h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setShowInstitutionRequest(false);
                                resetRequestForm();
                                clearMessages();
                            }}
                        >
                            Cancel
                        </Button>
                    </div>

                    <form onSubmit={handleSubmitRequest(onSubmitInstitutionRequest)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                {...registerRequest('name')}
                                label="Institution Name"
                                placeholder="e.g., ABC University"
                                error={requestErrors.name?.message}
                                required
                            />

                            <Input
                                {...registerRequest('shortName')}
                                label="Short Name (Optional)"
                                placeholder="e.g., ABC"
                                error={requestErrors.shortName?.message}
                            />

                            <Controller
                                name="type"
                                control={requestControl}
                                render={({ field: { onChange, value } }) => (
                                    <Select
                                        label="Institution Type"
                                        placeholder="Select type..."
                                        options={INSTITUTION_TYPES}
                                        value={INSTITUTION_TYPES.find(option => option.value === value) || null}
                                        onChange={(selectedOption: any) => onChange(selectedOption?.value || '')}
                                        error={requestErrors.type?.message}
                                        required
                                    />
                                )}
                            />

                            <Controller
                                name="division"
                                control={requestControl}
                                render={({ field: { onChange, value } }) => (
                                    <Select
                                        label="Division"
                                        placeholder="Select division..."
                                        options={DIVISIONS}
                                        value={DIVISIONS.find(option => option.value === value) || null}
                                        onChange={(selectedOption: any) => onChange(selectedOption?.value || '')}
                                        error={requestErrors.division?.message}
                                        required
                                    />
                                )}
                            />

                            <Input
                                {...registerRequest('location')}
                                label="Location"
                                placeholder="e.g., Dhaka, Chittagong"
                                error={requestErrors.location?.message}
                                required
                                className="md:col-span-2"
                            />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowInstitutionRequest(false);
                                    resetRequestForm();
                                    clearMessages();
                                }}
                                disabled={isSubmittingRequest}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmittingRequest}
                                className="flex items-center"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {isSubmittingRequest ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Education */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Education
                    </h3>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => setShowInstitutionRequest(true)}
                        >
                            <Building2 className="w-4 h-4 mr-2" />
                            Request Institution
                        </Button>
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
                                        error={(errors.education as any)?.[index]?.degree?.message}
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
                                        error={(errors.education as any)?.[index]?.institution?.message}
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
                                            error={(errors.education as any)?.[index]?.passingYear?.message}
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
        </div>
    );
}