'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeleteButton } from '@/components/ui/DeleteButton';
import { Input } from '@/components/ui/input';
import { YearSelect } from '@/components/ui/YearSelect';
import { Award, Plus } from 'lucide-react';
import { Controller, useFieldArray, Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { z } from 'zod';

// Certifications schema
export const certificationsSchema = z.object({
    certifications: z.array(z.object({
        name: z.string().min(1, 'Certification name is required'),
        issuer: z.string(),
        year: z.number().min(1900, 'Year must be valid').max(new Date().getFullYear() + 10, 'Year cannot be too far in the future'),
        issuingOrganization: z.string().min(1, 'Issuing organization is required'),
        expiryDate: z.string().optional(),
        credentialId: z.string().optional(),
    })).optional(),
});

interface CertificationsSectionProps {
    control: Control<any>;
    errors: FieldErrors<any>;
    register: UseFormRegister<any>;
}

export function CertificationsSection({ control, errors, register }: CertificationsSectionProps) {
    const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
        control,
        name: 'certifications',
    });

    return (
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
                    onClick={() => appendCertification({
                        name: '',
                        issuer: '',
                        year: new Date().getFullYear(),
                        issuingOrganization: '',
                        expiryDate: '',
                        credentialId: ''
                    })}
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
                                error={(errors.certifications as any)?.[index]?.name?.message}
                                required
                            />

                            <Input
                                {...register(`certifications.${index}.issuingOrganization`)}
                                label="Issuing Organization"
                                placeholder="e.g., Microsoft"
                                error={(errors.certifications as any)?.[index]?.issuingOrganization?.message}
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
                                            error={(errors.certifications as any)?.[index]?.year?.message}
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
    );
}