// src\components\portfolio\MultiStepForm\index.tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { usePortfolio } from '@/lib/hooks/usePortfolio';
import {
    resetForm,
    savePortfolioDraft,
    setCurrentStep,
    setFormData,
    setIsEditing,
    submitPortfolio,
    validateStep
} from '@/lib/redux/slices/portfolioSlice';
import { RootState } from '@/lib/redux/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card } from '@/components/ui/card';
import { useToast } from '@/lib/contexts/ToastContext';
import { FormNavigation } from './FormNavigation';
import { Step1PersonalInfo } from './Step1PersonalInfo';
import { Step2Education } from './Step2Education';
import { Step3SkillsExperience } from './Step3SkillsExperience_v2';
import { Step4Projects } from './Step4Projects';
import { validatePortfolioStep } from '@/lib/utils/validation';

interface MultiStepFormProps {
    portfolioId?: string;
    mode?: 'create' | 'edit';
}

export function MultiStepForm({ portfolioId, mode = 'create' }: MultiStepFormProps) {
    const dispatch = useDispatch();
    const router = useRouter();
    const { user } = useAuth();
    const { getPortfolio } = usePortfolio();
    const toast = useToast();

    const {
        currentStep,
        formData,
        isSubmitting,
        isSaving,
        submitError,
        isEditing,
        stepValidation
    } = useSelector((state: RootState) => state.portfolio);

    const [isLoading, setIsLoading] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Load existing portfolio data for editing
    useEffect(() => {
        const loadPortfolioData = async () => {
            if (mode === 'edit' && portfolioId && user?.uid) {
                setIsLoading(true);
                try {
                    const portfolio = await getPortfolio(portfolioId);
                    if (portfolio) {
                        dispatch(setFormData(portfolio));
                        dispatch(setIsEditing(true));
                        // Validate all steps for existing data
                        for (let step = 1; step <= 4; step++) {
                            const validation = validatePortfolioStep(step, portfolio);
                            dispatch(validateStep({
                                step,
                                isValid: validation.isValid,
                                errors: validation.errors
                            }));
                        }
                    } else {
                        toast.error('Portfolio not found');
                        router.push('/dashboard');
                    }
                } catch (error) {
                    console.error('Error loading portfolio:', error);
                    toast.error('Failed to load portfolio data');
                    router.push('/dashboard');
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadPortfolioData();
    }, [mode, portfolioId, dispatch, getPortfolio, router, toast, user?.uid]);

    // Initialize form for create mode
    useEffect(() => {
        if (mode === 'create' && !isEditing) {
            dispatch(resetForm());
            dispatch(setCurrentStep(1));
        }
    }, [mode, isEditing, dispatch]);

    // Track unsaved changes - Fixed to check for meaningful data
    useEffect(() => {
        const hasChanges = Object.values(formData).some(value => {
            if (Array.isArray(value)) {
                return value.length > 0 && value.some(item =>
                    typeof item === 'string' ? item.trim() !== '' :
                        typeof item === 'object' ? Object.values(item).some(v => v && v !== '') :
                            false
                );
            }
            return value && value !== '' && value !== 0;
        });
        setHasUnsavedChanges(hasChanges);
    }, [formData]);

    // Handle page unload warning
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges && !isSubmitting) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges, isSubmitting]);

    const handleSubmit = async () => {
        if (!user) {
            toast.error('You must be logged in to submit a portfolio');
            return;
        }

        // Final validation of all steps
        let allStepsValid = true;
        for (let step = 1; step <= 4; step++) {
            const validation = validatePortfolioStep(step, formData);
            dispatch(validateStep({
                step,
                isValid: validation.isValid,
                errors: validation.errors
            }));
            if (!validation.isValid) {
                allStepsValid = false;
            }
        }

        if (!allStepsValid) {
            toast.error('Please complete all required fields in all steps');
            return;
        }

        try {
            const result = await dispatch(submitPortfolio({
                portfolioData: formData,
                userId: user.uid,
                portfolioId: mode === 'edit' ? portfolioId : undefined
            }));

            if (submitPortfolio.fulfilled.match(result)) {
                toast.success(
                    mode === 'edit'
                        ? 'Portfolio updated successfully!'
                        : 'Portfolio created successfully!'
                );
                setHasUnsavedChanges(false);
                router.push('/dashboard');
            } else {
                const errorMessage = result.payload as string || 'Failed to submit portfolio';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('An unexpected error occurred');
        }
    };

    const handleSaveDraft = async () => {
        if (!user) {
            toast.error('You must be logged in to save a draft');
            return;
        }

        try {
            const result = await dispatch(savePortfolioDraft({
                portfolioData: formData,
                userId: user.uid,
                portfolioId: mode === 'edit' ? portfolioId : undefined
            }));

            if (savePortfolioDraft.fulfilled.match(result)) {
                toast.success('Draft saved successfully!');
                setHasUnsavedChanges(false);
            } else {
                const errorMessage = result.payload as string || 'Failed to save draft';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Save draft error:', error);
            toast.error('Failed to save draft');
        }
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1PersonalInfo />;
            case 2:
                return <Step2Education />;
            case 3:
                return <Step3SkillsExperience />;
            case 4:
                return <Step4Projects />;
            default:
                return <Step1PersonalInfo />;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {mode === 'edit' ? 'Edit Portfolio' : 'Create Your Portfolio'}
                    </h1>
                    <p className="text-gray-600">
                        {mode === 'edit'
                            ? 'Update your professional portfolio information'
                            : 'Build your professional portfolio in 4 easy steps'
                        }
                    </p>
                    {hasUnsavedChanges && (
                        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                            Unsaved changes
                        </div>
                    )}
                </div>

                {/* Form Container */}
                <Card className="bg-white shadow-lg">
                    <div className="p-6 sm:p-8">
                        {/* Step Content */}
                        {/* <div className="mb-8">
                            {renderCurrentStep()}
                        </div> */}

                        {/* Error Display */}
                        {submitError && (
                            <div className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50">
                                <p className="text-red-700 text-sm">{submitError}</p>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <FormNavigation
                        onSubmit={handleSubmit}
                        onSave={handleSaveDraft}
                        isSubmitting={isSubmitting}
                        isSaving={isSaving}
                    />
                </Card>

                {/* Additional Information */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Your portfolio will be {mode === 'edit' ? 'updated' : 'created'} and made available in the directory.
                        You can always edit it later from your dashboard.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default MultiStepForm;