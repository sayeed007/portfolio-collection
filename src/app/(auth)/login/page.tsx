// src/app/(auth)/login/page.tsx
'use client';

import { LoginForm } from "@/components/auth/LoginForm";
import BackgroundDecoration from "@/components/common/BackgroundDecoration";
import { ArrowLeft, Users, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Background decoration */}
            <BackgroundDecoration />

            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Navigation */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                    {/* Left side - Marketing content */}
                    <div className="space-y-8 lg:pr-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                                Welcome
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {" "}Back{" "}
                                </span>
                                to Your Portfolio
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed">
                                Sign in to access your professional dashboard, manage your portfolio, and connect with your network.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Your Network
                                    </h3>
                                    <p className="text-gray-600">
                                        Access your professional connections and discover new opportunities.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Secure Access
                                    </h3>
                                    <p className="text-gray-600">
                                        Your account and data are protected with enterprise-grade security.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Quick Access
                                    </h3>
                                    <p className="text-gray-600">
                                        Jump right back into managing and updating your professional portfolio.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">10K+</div>
                                <div className="text-sm text-gray-600 mt-1">Active Users</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">50+</div>
                                <div className="text-sm text-gray-600 mt-1">Companies</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">98%</div>
                                <div className="text-sm text-gray-600 mt-1">Satisfaction</div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Login form */}
                    <div className="flex justify-center lg:justify-end">
                        <LoginForm />
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
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}