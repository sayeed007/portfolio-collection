// src\components\portfolio\MultiStepForm\FormNavigation.tsx
'use client';

import { Button } from '@/components/ui/button';
import { setCurrentStep, validateStep } from '@/lib/redux/slices/portfolioSlice';
import { RootState } from '@/lib/redux/store';
import { validatePortfolioStep } from '@/lib/utils/validation';
import { ChevronLeft, ChevronRight, Save, Upload } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

interface FormNavigationProps {
    onSubmit?: () => void;
    onSave?: () => void;
    isSubmitting?: boolean;
    isSaving?: boolean;
}

const STEP_TITLES = [
    { title: 'Personal Information', subtitle: 'Basic details and references' },
    { title: 'Education & Certifications', subtitle: 'Academic background and achievements' },
    { title: 'Skills & Experience', subtitle: 'Technical skills and work history' },
    { title: 'Projects Portfolio', subtitle: 'Your key projects and contributions' },
];

export function FormNavigation({
    onSubmit,
    onSave,
    isSubmitting = false,
    isSaving = false
}: FormNavigationProps) {
    const dispatch = useDispatch();
    const { currentStep, formData, stepValidation = {} } = useSelector((state: RootState) => state.portfolio);

    const handleNext = () => {
        // Validate current step
        const validation = validatePortfolioStep(currentStep, formData);
        dispatch(validateStep({ step: currentStep, isValid: validation.isValid, errors: validation.errors }));

        if (validation.isValid && currentStep < 4) {
            dispatch(setCurrentStep(currentStep + 1));
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            dispatch(setCurrentStep(currentStep - 1));
        }
    };

    const handleStepClick = (step: number) => {
        // Allow navigation to any step (removed restriction)
        dispatch(setCurrentStep(step));
    };

    const isCurrentStepValid = stepValidation[currentStep]?.isValid ?? false;
    const canProceed = currentStep < 4;
    const canSubmit = currentStep === 4;

    return (
        <div className="bg-white border-t border-gray-200 px-6 py-4">
            {/* Validation Status */}
            {!isCurrentStepValid && stepValidation[currentStep] && stepValidation[currentStep].errors.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium mb-2">
                        Please address the following issues:
                    </p>
                    <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                        {stepValidation[currentStep].errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className="flex items-center"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                    </Button>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Save Draft Button */}
                    {onSave && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onSave}
                            disabled={isSaving}
                            className="flex items-center"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Draft'}
                        </Button>
                    )}

                    {/* Next/Submit Button */}
                    {canProceed ? (
                        <Button
                            type="button"
                            onClick={handleNext}
                            className="flex items-center"
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : canSubmit ? (
                        <Button
                            type="button"
                            onClick={onSubmit}
                            disabled={isSubmitting}
                            className="flex items-center bg-green-600 hover:bg-green-700"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {isSubmitting ? 'Submitting...' : 'Submit Portfolio'}
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}