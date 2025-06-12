// src/components/auth/RegisterForm.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/lib/contexts/ToastContext';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils/helpers';
import { registerSchema, type RegisterFormData } from '@/lib/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PasswordStrength } from '../common/PasswordStrength';

export const RegisterForm: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { user, register: signup, loginWithGoogle, loading, error, clearError } = useAuth();
    const { success, error: showError } = useToast();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting, isValid }
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: 'onChange'
    });

    const password = watch('password', '');

    // Redirect if user auth already exits
    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    // Show toast when error changes
    useEffect(() => {
        if (error) {
            showError(error);
            clearError();
        }
    }, [error, showError, clearError]);

    // Redirect on successful auth
    useEffect(() => {
        if (isSuccess && user) {
            router.push('/dashboard'); // Redirect to dashboard
        }
    }, [isSuccess, user, router]);

    const onSubmit = async (data: RegisterFormData) => {
        try {
            clearError();
            await signup(data.email, data.password, data.displayName);
            setIsSuccess(true);
            success('Account created successfully! Please check your email to verify your account.');
        } catch (error) {
            // Error is handled by useAuth hook and useEffect above
            console.error('Registration failed because', error);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            clearError();
            await loginWithGoogle();
            setIsSuccess(true);
            success('Successfully signed up with Google!');
        } catch (error) {
            // Error is handled by useAuth hook and useEffect above
            console.error('Google Registration failed because', error);
        }
    };

    if (isSuccess) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Account Created!</h2>
                            <p className="text-gray-600 mt-2">
                                Please check your email to verify your account before signing in.
                            </p>
                        </div>
                        <Button
                            className="w-full"
                        >
                            <a href="/login">Continue to Sign In</a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/95 backdrop-blur">
            <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Create Account
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                    Join our professional community and showcase your portfolio
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Full Name Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Full Name *
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-4 h-4 w-4 text-gray-400 z-99" />
                            <Input
                                {...register('displayName')}
                                type="text"
                                placeholder="Enter your full name"
                                className={cn(
                                    "pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 border-gray-200",
                                    errors.displayName && "border-red-300 focus:ring-red-500/20"
                                )}
                                disabled={isSubmitting || loading}
                            />
                        </div>
                        {errors.displayName && (
                            <p className="text-sm text-red-600 flex items-center mt-1">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.displayName.message}
                            </p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Email Address *
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-4 h-4 w-4 text-gray-400 z-99" />
                            <Input
                                {...register('email')}
                                type="email"
                                placeholder="Enter your email"
                                className={cn(
                                    "pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 border-gray-200",
                                    errors.email && "border-red-300 focus:ring-red-500/20"
                                )}
                                disabled={isSubmitting || loading}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-red-600 flex items-center mt-1">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Password *
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-4 h-4 w-4 text-gray-400 z-99" />
                            <Input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a secure password"
                                className={cn(
                                    "pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 border-gray-200",
                                    errors.password && "border-red-300 focus:ring-red-500/20"
                                )}
                                disabled={isSubmitting || loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={isSubmitting || loading}
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-600 flex items-center mt-1">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.password.message}
                            </p>
                        )}
                        <PasswordStrength password={password} />
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Confirm Password *
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-4 h-4 w-4 text-gray-400 z-99" />
                            <Input
                                {...register('confirmPassword')}
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm your password"
                                className={cn(
                                    "pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 border-gray-200",
                                    errors.confirmPassword && "border-red-300 focus:ring-red-500/20"
                                )}
                                disabled={isSubmitting || loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={isSubmitting || loading}
                            >
                                {showConfirmPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-600 flex items-center mt-1">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className={cn(
                            "w-full h-11 text-white font-medium transition-all duration-200",
                            "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            "focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2"
                        )}
                        disabled={isSubmitting || loading || !isValid}
                    >
                        {isSubmitting || loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </form>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-gray-500 font-medium">
                            Or continue with
                        </span>
                    </div>
                </div>

                {/* Google Sign Up Button */}
                <Button
                    variant="outline"
                    className={cn(
                        "w-full h-11 border-gray-200 hover:bg-gray-50 transition-all duration-200",
                        "focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                    onClick={handleGoogleSignup}
                    disabled={loading || isSubmitting}
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                    )}
                    Continue with Google
                </Button>

                {/* Sign In Link */}
                <div className="text-center text-sm pt-2">
                    <span className="text-gray-600">Already have an account? </span>
                    <a
                        href="/login"
                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                    >
                        Sign in
                    </a>
                </div>

                {/* Terms and Privacy */}
                <div className="text-xs text-gray-500 text-center pt-2">
                    By creating an account, you agree to our{' '}
                    <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                </div>
            </CardContent>
        </Card>
    );
};