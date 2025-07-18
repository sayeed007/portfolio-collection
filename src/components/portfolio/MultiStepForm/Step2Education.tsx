'use client';

import { updateFormData } from '@/lib/redux/slices/portfolioSlice';
import { RootState } from '@/lib/redux/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';
import { EducationSection, educationSchema } from './EducationSection';
import { CertificationsSection, certificationsSchema } from './CertificationsSection';
import { CoursesSection, coursesSchema } from './CoursesSection';

// Combined validation schema for Step2Education.tsx
const step2Schema = educationSchema.merge(certificationsSchema).merge(coursesSchema);

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
                    year: cert.year.toString(),
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
            <EducationSection control={control} errors={errors} />
            <CertificationsSection control={control} errors={errors} register={register} />
            <CoursesSection control={control} errors={errors} register={register} />
        </div>
    );
}