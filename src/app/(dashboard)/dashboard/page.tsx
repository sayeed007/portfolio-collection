// src/app/(dashboard)/dashboard/page.tsx
"use client";

import BackgroundDecoration from "@/components/common/BackgroundDecoration";
import DashboardLoading from "@/components/common/DashboardLoading";
import ErrorStateCard from "@/components/dashboard/ErrorStateCard";
import ExploreConnectCard from "@/components/dashboard/ExploreConnectCard";
import PortfolioManagementCard from "@/components/dashboard/PortfolioManagementCard";
import PortfolioOverviewCard from "@/components/dashboard/PortfolioOverviewCard";
import StatsCard from "@/components/dashboard/StatsCard";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePortfolio } from "@/lib/hooks/usePortfolio";
import { Award, Eye, FileText, User } from "lucide-react";

export default function DashboardPage() {
    const { user } = useAuth();
    const {
        currentPortfolio: portfolio,
        loading,
        error,
        shouldShowLoading,
        isPortfolioNotFound,
        retryFetch,
    } = usePortfolio();

    // If portfolio not found, show the friendly "No Portfolio Yet" UI immediately (no loading)
    if (isPortfolioNotFound) {
        return (
            <ErrorStateCard
                type="not-found"
                title="No Portfolio Found"
                message="You haven't created a portfolio yet. Create one to showcase your skills and projects!"
            />
        );
    }

    // Show loading state only if actively fetching AND NOT portfolio not found
    if (shouldShowLoading) {
        return <DashboardLoading />;
    }

    // Show error state (but not for "portfolio not found" errors)
    if (error) {
        return (
            <ErrorStateCard
                type="error"
                title="Error Loading Dashboard"
                message={error}
                onRetry={retryFetch}
                loading={loading}
            />
        );
    }

    const stats = [
        {
            icon: User,
            label: "Portfolio Status",
            value: portfolio ? "Active" : "Not Created",
            color: "blue" as const,
        },
        {
            icon: Eye,
            label: "Profile Views",
            value: portfolio?.visitCount?.toString() || "0",
            color: "green" as const,
        },
        {
            icon: FileText,
            label: "Projects",
            value: portfolio?.projects?.length?.toString() || "0",
            color: "purple" as const,
        },
        {
            icon: Award,
            label: "Skills",
            value: portfolio?.technicalSkills?.reduce(
                (acc, cat) => acc + cat.skills.length,
                0
            )?.toString() || "0",
            color: "orange" as const,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <BackgroundDecoration />

            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Welcome Header */}
                <WelcomeHeader
                    userName={user?.displayName || ''}
                    userEmail={user?.email || ''}
                />

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, index) => (
                        <StatsCard
                            key={index}
                            icon={stat.icon}
                            label={stat.label}
                            value={stat.value}
                            color={stat.color}
                        />
                    ))}
                </div>

                {/* Main Action Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Portfolio Management */}
                    <PortfolioManagementCard
                        hasPortfolio={!!portfolio}
                        userId={user?.uid}
                    />

                    {/* Explore & Connect */}
                    <ExploreConnectCard />
                </div>

                {/* Portfolio Overview - Only show if portfolio exists */}
                {portfolio && (
                    <PortfolioOverviewCard
                        portfolio={portfolio}
                        userId={user?.uid}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
}