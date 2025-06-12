// src\components\admin\Overview.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, FolderPlus, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

// Define the possible tab values
type TabType = 'overview' | 'languages' | 'degrees' | 'institutions' | 'categories';

// Define the props interface
interface OverviewProps {
    setActiveTab: (tab: TabType) => void;
}

export const Overview: React.FC<OverviewProps> = ({ setActiveTab }) => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCategories: 0,
        pendingInstitutionRequests: 0,
        pendingCategoryRequests: 0,
        pendingSkillRequests: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate total users count (replace with actual user collection query if available)
        const usersQuery = query(collection(db, 'users'));
        const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
            setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
        });

        // Total categories count
        const categoriesQuery = query(collection(db, 'skillCategories'));
        const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
            setStats(prev => ({ ...prev, totalCategories: snapshot.size }));
        });

        // Pending institution requests count
        const institutionRequestsQuery = query(
            collection(db, 'institutionRequests'),
            where('status', '==', 'pending')
        );
        const unsubscribeInstitutionRequests = onSnapshot(institutionRequestsQuery, (snapshot) => {
            setStats(prev => ({ ...prev, pendingInstitutionRequests: snapshot.size }));
        });

        // Pending category requests count
        const categoryRequestsQuery = query(
            collection(db, 'skillCategoryRequests'),
            where('status', '==', 'pending')
        );
        const unsubscribeCategoryRequests = onSnapshot(categoryRequestsQuery, (snapshot) => {
            setStats(prev => ({ ...prev, pendingCategoryRequests: snapshot.size }));
        });

        // Pending skill requests count
        const skillRequestsQuery = query(
            collection(db, 'skillRequests'),
            where('status', '==', 'pending')
        );
        const unsubscribeSkillRequests = onSnapshot(skillRequestsQuery, (snapshot) => {
            setStats(prev => ({ ...prev, pendingSkillRequests: snapshot.size }));
        });

        setLoading(false);

        return () => {
            unsubscribeUsers();
            unsubscribeCategories();
            unsubscribeInstitutionRequests();
            unsubscribeCategoryRequests();
            unsubscribeSkillRequests();
        };
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center py-12">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Total Users</h3>
                            <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <FolderPlus className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Skill Categories</h3>
                            <p className="text-2xl font-bold text-green-600">{stats.totalCategories}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Pending Requests</h3>
                            <p className="text-2xl font-bold text-yellow-600">
                                {stats.pendingInstitutionRequests + stats.pendingCategoryRequests + stats.pendingSkillRequests}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <Button onClick={() => setActiveTab('institutions')} className="w-full md:w-auto">
                        Manage Institutions ({stats.pendingInstitutionRequests} Pending)
                    </Button>
                    <Button onClick={() => setActiveTab('categories')} className="w-full md:w-auto">
                        Manage Categories ({stats.pendingCategoryRequests} Pending)
                    </Button>
                </div>
            </Card>
        </div>
    );
};
