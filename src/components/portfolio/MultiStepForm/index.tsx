// src\components\portfolio\MultiStepForm\index.tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { usePortfolio } from '@/lib/hooks/usePortfolio';
import {
    fetchUserPortfolio,
    savePortfolioDraft,
    setFormData,
    setIsEditing,
    submitPortfolio,
    validateStep
} from '@/lib/redux/slices/portfolioSlice';
import { RootState } from '@/lib/redux/store';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import BackgroundDecoration from '@/components/common/BackgroundDecoration';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card } from '@/components/ui/card';
import { useToast } from '@/lib/contexts/ToastContext';
import { validatePortfolioStep } from '@/lib/utils/validation';
import {
    Briefcase,
    CheckCircle,
    Clock,
    Edit3,
    FolderOpen,
    GraduationCap,
    Plus,
    Star,
    User
} from 'lucide-react';
import { FormNavigation } from './FormNavigation';
import { Step1PersonalInfo } from './Step1PersonalInfo';
import { Step2Education } from './Step2Education';
import { Step3SkillsExperience } from './Step3SkillsExperience';
import { Step4Projects } from './Step4Projects';

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

    // Steps configuration
    const steps = [
        {
            number: 1,
            title: "Personal Info",
            description: "Basic information and contact details",
            icon: User,
            color: "blue"
        },
        {
            number: 2,
            title: "Education",
            description: "Academic background and certifications",
            icon: GraduationCap,
            color: "green"
        },
        {
            number: 3,
            title: "Skills & Experience",
            description: "Professional skills and work history",
            icon: Briefcase,
            color: "purple"
        },
        {
            number: 4,
            title: "Projects",
            description: "Showcase your work and achievements",
            icon: FolderOpen,
            color: "orange"
        }
    ];

    // Load existing portfolio data for editing
    useEffect(() => {
        const loadPortfolioData = async () => {
            if (mode === 'edit' && portfolioId && user?.uid) {
                setIsLoading(true);
                try {
                    // Use thunk for consistency
                    const result = await dispatch(getPortfolio(portfolioId));

                    if (getPortfolio.fulfilled.match(result)) {
                        const portfolio = result.payload;
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
            } else if (user?.uid) {
                // For create mode, load user's existing portfolio if any
                const result = await dispatch(fetchUserPortfolio(user.uid));

                if (fetchUserPortfolio.fulfilled.match(result)) {
                    // console.info('User portfolio loaded:', result.payload);
                    // Optionally set as form data if you want to pre-populate
                    dispatch(setFormData(result.payload));
                } else if (fetchUserPortfolio.rejected.match(result)) {
                    console.info('No existing portfolio found or error:', result.payload);
                    // This might be expected for new users
                }
            }
        };

        loadPortfolioData();
    }, [mode, portfolioId, dispatch, router, user?.uid]); // Removed getPortfolio and toast

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
        // return <Step3SkillsExperience />;
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

    const getStepStatus = (stepNumber: number) => {
        if (stepNumber < currentStep) return 'completed';
        if (stepNumber === currentStep) return 'current';
        return 'upcoming';
    };

    const getStepColorClasses = (color: string, status: string) => {
        const colorMap = {
            blue: {
                completed: "bg-blue-600 text-white border-blue-600",
                current: "bg-blue-100 text-blue-600 border-blue-200 ring-4 ring-blue-100",
                upcoming: "bg-gray-100 text-gray-400 border-gray-200"
            },
            green: {
                completed: "bg-green-600 text-white border-green-600",
                current: "bg-green-100 text-green-600 border-green-200 ring-4 ring-green-100",
                upcoming: "bg-gray-100 text-gray-400 border-gray-200"
            },
            purple: {
                completed: "bg-purple-600 text-white border-purple-600",
                current: "bg-purple-100 text-purple-600 border-purple-200 ring-4 ring-purple-100",
                upcoming: "bg-gray-100 text-gray-400 border-gray-200"
            },
            orange: {
                completed: "bg-orange-600 text-white border-orange-600",
                current: "bg-orange-100 text-orange-600 border-orange-200 ring-4 ring-orange-100",
                upcoming: "bg-gray-100 text-gray-400 border-gray-200"
            }
        };
        return colorMap[color as keyof typeof colorMap][status as keyof typeof colorMap['blue']];
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <BackgroundDecoration />
                <div className="relative z-10">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600 text-center">Loading portfolio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Background decoration */}
            <BackgroundDecoration />

            <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-purple-200">
                            {mode === 'edit' ? (
                                <Edit3 className="w-4 h-4 text-purple-600 mr-2" />
                            ) : (
                                <Plus className="w-4 h-4 text-blue-600 mr-2" />
                            )}
                            <span className="text-sm font-medium text-gray-700">
                                {mode === 'edit' ? 'Edit Portfolio' : 'Create Portfolio'}
                            </span>
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                            {mode === 'edit' ? (
                                <>
                                    Update Your
                                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                        {" "}Portfolio
                                    </span>
                                </>
                            ) : (
                                <>
                                    Build Your
                                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {" "}Professional{" "}
                                    </span>
                                    Portfolio
                                </>
                            )}
                        </h1>

                        <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                            {mode === 'edit'
                                ? 'Make changes to your professional portfolio and keep it up to date'
                                : 'Create a stunning professional portfolio in 4 simple steps'
                            }
                        </p>

                        {hasUnsavedChanges && (
                            <div className="mt-6 inline-flex items-center px-4 py-2 rounded-full text-sm bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200">
                                <Clock className="w-4 h-4 mr-2 animate-pulse" />
                                You have unsaved changes
                            </div>
                        )}
                    </div>

                    {/* Main Form Content */}
                    <div className="max-w-4xl mx-auto">
                        <Card className="bg-white/80 backdrop-blur border-0 shadow-2xl">
                            <div className="p-6 sm:p-8 lg:p-12">
                                {/* Current Step Header */}
                                <div className="mb-8">
                                    <div className="flex items-center mb-4">
                                        {React.createElement(steps[currentStep - 1].icon, {
                                            className: `w-8 h-8 text-${steps[currentStep - 1].color}-600 mr-3`
                                        })}
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                Step {currentStep}: {steps[currentStep - 1].title}
                                            </h2>
                                            <p className="text-gray-600 mt-1">
                                                {steps[currentStep - 1].description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${(currentStep / 4) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                                        <span>Step {currentStep} of 4</span>
                                        <span>{Math.round((currentStep / 4) * 100)}% Complete</span>
                                    </div>
                                </div>

                                {/* Step Content */}
                                <div className="mb-8">
                                    {renderCurrentStep()}
                                </div>

                                {/* Error Display */}
                                {submitError && (
                                    <div className="mb-6 p-4 border border-red-200 rounded-xl bg-red-50 backdrop-blur">
                                        <p className="text-red-700 text-sm font-medium">{submitError}</p>
                                    </div>
                                )}
                            </div>

                            {/* Navigation */}
                            <div className="border-t border-gray-100 bg-gray-50/50 backdrop-blur">
                                <FormNavigation
                                    onSubmit={handleSubmit}
                                    onSave={handleSaveDraft}
                                    isSubmitting={isSubmitting}
                                    isSaving={isSaving}
                                />
                            </div>
                        </Card>

                        {/* Footer Information */}
                        <div className="mt-8 text-center">
                            <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur rounded-full border border-gray-200">
                                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                                <span className="text-sm text-gray-600">
                                    Your portfolio will be {mode === 'edit' ? 'updated' : 'created'} and available in the directory
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                You can always edit your portfolio later from your dashboard
                            </p>
                        </div>
                    </div>

                    {/* Step Progress */}
                    <div className="mb-8">
                        <div className="flex justify-center">
                            <div className="flex items-center space-x-4 lg:space-x-8 overflow-x-auto pb-4">
                                {steps.map((step, index) => {
                                    const Icon = step.icon;
                                    const status = getStepStatus(step.number);

                                    return (
                                        <div key={step.number} className="flex items-center flex-shrink-0 pt-4">
                                            <div className="flex flex-col items-center">
                                                <div className={`
                                                    w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 
                                                    ${getStepColorClasses(step.color, status)}
                                                    ${status === 'current' ? 'transform scale-110 shadow-lg' : ''}
                                                `}>
                                                    {status === 'completed' ? (
                                                        <CheckCircle className="w-8 h-8" />
                                                    ) : (
                                                        <Icon className="w-8 h-8" />
                                                    )}
                                                </div>
                                                <div className="mt-3 text-center">
                                                    <div className={`font-semibold text-sm ${status === 'current' ? 'text-gray-900' :
                                                        status === 'completed' ? 'text-gray-700' : 'text-gray-400'
                                                        }`}>
                                                        {step.title}
                                                    </div>
                                                    <div className={`text-xs mt-1 max-w-24 ${status === 'current' ? 'text-gray-600' : 'text-gray-400'
                                                        }`}>
                                                        {step.description}
                                                    </div>
                                                </div>
                                            </div>

                                            {index < steps.length - 1 && (
                                                <div className={`w-12 h-px mx-4 ${index < currentStep - 1 ? 'bg-gray-300' : 'bg-gray-200'
                                                    }`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
            `}</style>
        </div>
    );
}

export default MultiStepForm;