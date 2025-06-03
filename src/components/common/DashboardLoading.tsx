import React from 'react';
import { Zap } from 'lucide-react';
import BackgroundDecoration from './BackgroundDecoration';

const DashboardLoading = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
            {/* Enhanced Background decoration */}
            <BackgroundDecoration />


            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Loading Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-md rounded-full border border-purple-200/50 mb-8 shadow-lg">
                        <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                        <span className="text-sm font-medium text-gray-700">Loading your dashboard...</span>
                    </div>

                    <div className="space-y-4">
                        <div className="h-12 bg-gradient-to-r from-white/80 via-white/60 to-white/80 backdrop-blur-sm rounded-2xl shadow-lg animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer"></div>
                        </div>
                        <div className="h-6 bg-gradient-to-r from-white/70 via-white/50 to-white/70 backdrop-blur-sm rounded-xl shadow-md animate-pulse mx-auto w-2/3 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer animation-delay-300"></div>
                        </div>
                    </div>
                </div>

                {/* Loading Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="group">
                            <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 animate-pulse border border-white/20 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-shimmer" style={{ animationDelay: `${i * 200}ms` }}></div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl animate-pulse"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                                        <div className="h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded animate-pulse w-2/3"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Loading Action Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {[1, 2].map((i) => (
                        <div key={i} className="group">
                            <div className="p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 animate-pulse border border-white/20 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-shimmer" style={{ animationDelay: `${i * 400}ms` }}></div>
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-300 to-purple-300 rounded-2xl mr-4 animate-pulse"></div>
                                    <div className="h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded animate-pulse flex-1"></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-4/5"></div>
                                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-3/5"></div>
                                    <div className="flex gap-3 mt-6">
                                        <div className="h-10 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg animate-pulse flex-1"></div>
                                        <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse flex-1"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Loading Tips */}
                <div className="text-center">
                    <div className="inline-flex items-center px-6 py-3 bg-white/70 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-md">
                        <Zap className="w-4 h-4 text-blue-500 mr-2 animate-pulse" />
                        <span className="text-sm text-gray-600">
                            Setting up your professional workspace...
                        </span>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animation-delay-6000 { animation-delay: 6s; }
        .animation-delay-300 { animation-delay: 300ms; }
      `}</style>
        </div>
    );
};

export default DashboardLoading;