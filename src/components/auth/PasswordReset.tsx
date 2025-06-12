// src/components/auth/PasswordReset.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/lib/contexts/ToastContext';
import { auth } from '@/lib/firebase/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ArrowLeft, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const resetSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});

type ResetFormData = z.infer<typeof resetSchema>;

interface PasswordResetProps {
    onBack: () => void;
}

export function PasswordReset({ onBack }: PasswordResetProps) {
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetFormData>({
        resolver: zodResolver(resetSchema),
    });

    const onSubmit = async (data: ResetFormData) => {
        setIsLoading(true);

        try {
            await sendPasswordResetEmail(auth, data.email);
            setEmailSent(true);
            toast.success('Check your email for password reset instructions.');
        } catch (error: any) {
            console.error('Password reset error:', error);
            toast.error(error.message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <Card className="w-full max-w-md mx-auto p-6">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
                    <p className="text-gray-600">
                        {`We've sent password reset instructions to your email address.`}
                    </p>
                    <Button
                        onClick={onBack}
                        variant="outline"
                        className="w-full"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto p-6">
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Reset your password</h2>
                    <p className="text-gray-600 mt-2">
                        {`Enter your email address and we'll send you a link to reset your password.`}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Input
                            {...register('email')}
                            type="email"
                            placeholder="Enter your email"
                            error={errors.email?.message}
                            icon={<Mail className="w-4 h-4" />}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        // loading={isLoading}
                        disabled={isLoading}
                    >
                        Send Reset Email
                    </Button>
                </form>

                <Button
                    onClick={onBack}
                    variant="outline"
                    className="w-full"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                </Button>
            </div>
        </Card>
    );
}