// src/components/common/LoadingSpinner.tsx
import React from 'react';
import { cn } from '@/lib/utils/helpers';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    className,
    text
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };

    return (
        <div className={cn('flex flex-col items-center justify-center', className)}>
            <div
                className={cn(
                    'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
                    sizeClasses[size]
                )}
            />
            {text && (
                <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            )}
        </div>
    );
};

// Full page loading component
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner size="lg" text={text} />
        </div>
    );
};