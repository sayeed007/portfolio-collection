// src/components/common/ErrorBoundary.tsx
'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    retry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return <FallbackComponent error={this.state.error} retry={this.retry} />;
            }

            return <DefaultErrorFallback error={this.state.error} retry={this.retry} />;
        }

        return this.props.children;
    }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error?: Error; retry: () => void }> = ({
    error,
    retry
}) => {
    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="mt-4">Something went wrong</CardTitle>
                    <CardDescription>
                        We encountered an unexpected error. Please try refreshing the page.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && process.env.NODE_ENV === 'development' && (
                        <div className="p-3 bg-gray-100 rounded-md">
                            <p className="text-sm font-mono text-gray-800">
                                {error.message}
                            </p>
                        </div>
                    )}
                    <div className="flex space-x-2">
                        <Button onClick={retry} className="flex-1">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try again
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                            className="flex-1"
                        >
                            Refresh page
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Error message component for smaller errors
export const ErrorMessage: React.FC<{
    title?: string;
    message: string;
    onRetry?: () => void;
    className?: string;
}> = ({ title = 'Error', message, onRetry, className }) => {
    return (
        <div className={cn('rounded-md border border-red-200 bg-red-50 p-4', className)}>
            <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{title}</h3>
                    <p className="mt-1 text-sm text-red-700">{message}</p>
                    {onRetry && (
                        <div className="mt-3">
                            <Button size="sm" variant="outline" onClick={onRetry}>
                                Try again
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
