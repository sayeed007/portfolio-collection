// src/components/auth/LoginForm.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/lib/contexts/ToastContext';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils/helpers';
import { loginSchema, type LoginFormData } from '@/lib/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export const LoginForm: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { user, login, loginWithGoogle, loading, error, clearError } = useAuth();
    const { success, error: showError } = useToast();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
        setValue,
        watch
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const watchedEmail = watch('email');
    const watchedPassword = watch('password');

    // Load saved credentials if remember me was checked
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setValue('email', savedEmail);
            setRememberMe(true);
        }
    }, [setValue]);

    // Show toast when error changes
    useEffect(() => {
        if (error) {
            showError(error);
            clearError();
        }
    }, [error, showError, clearError]);

    // Redirect on successful auth
    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    const onSubmit = async (data: LoginFormData) => {
        try {
            clearError();

            // Handle remember me functionality
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', data.email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            await login(data.email, data.password);
            success('Welcome back! You have been signed in successfully.');
        } catch (error) {
            // Error is handled by useAuth hook and useEffect above
            console.error('Log in failed because', error);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            clearError();
            await loginWithGoogle();
            success('Successfully signed in with Google!');
        } catch (error) {
            // Error is handled by useAuth hook and useEffect above
            console.error('Google Log in failed because', error);
        }
    };

    const handleForgotPassword = () => {
        if (watchedEmail) {
            // Pass email to forgot password page via URL params
            router.push(`/forgot-password?email=${encodeURIComponent(watchedEmail)}`);
        } else {
            router.push('/forgot-password');
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome Back
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                    Sign in to access your professional dashboard
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                                    "pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 border-gray-200 h-11",
                                    errors.email && "border-red-300 focus:ring-red-500/20",
                                    watchedEmail && !errors.email && "border-green-300 focus:ring-green-500/20"
                                )}
                                disabled={isSubmitting || loading}
                                autoComplete="email"
                            />
                            {watchedEmail && !errors.email && (
                                <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                            )}
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
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">
                                Password *
                            </label>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-1"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-4 h-4 w-4 text-gray-400 z-99" />
                            <Input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                className={cn(
                                    "pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 border-gray-200 h-11",
                                    errors.password && "border-red-300 focus:ring-red-500/20",
                                    watchedPassword && !errors.password && "border-green-300 focus:ring-green-500/20"
                                )}
                                disabled={isSubmitting || loading}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                disabled={isSubmitting || loading}
                                aria-label={showPassword ? "Hide password" : "Show password"}
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
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="remember-me"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            disabled={isSubmitting || loading}
                        />
                        <label htmlFor="remember-me" className="text-sm text-gray-600 cursor-pointer">
                            Remember me
                        </label>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className={cn(
                            "w-full h-12 text-white font-medium transition-all duration-200",
                            "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            "focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2",
                            "shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                        )}
                        disabled={isSubmitting || loading || !isValid}
                    >
                        {isSubmitting || loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Signing In...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </Button>
                </form>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-4 text-gray-500 font-medium">
                            Or continue with
                        </span>
                    </div>
                </div>

                {/* Google Sign In Button */}
                <Button
                    variant="outline"
                    className={cn(
                        "w-full h-12 border-gray-200 hover:bg-gray-50 transition-all duration-200",
                        "focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "shadow-sm hover:shadow-md transform hover:scale-[1.01] active:scale-[0.99]"
                    )}
                    onClick={handleGoogleLogin}
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

                {/* Sign Up Link */}
                <div className="text-center text-sm pt-2">
                    <span className="text-gray-600">{"Don't have an account?"}</span>
                    <a
                        href="/register"
                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-1"
                    >
                        Sign up
                    </a>
                </div>

                {/* Terms and Privacy */}
                <div className="text-xs text-gray-500 text-center pt-2 leading-relaxed">
                    By signing in, you agree to our{' '}
                    <a
                        href="/terms"
                        className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-1"
                    >
                        Terms of Service
                    </a>
                    {' '}and{' '}
                    <a
                        href="/privacy"
                        className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-1"
                    >
                        Privacy Policy
                    </a>
                </div>
            </CardContent>
        </Card>
    );
};