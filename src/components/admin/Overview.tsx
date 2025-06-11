// src/components/admin/AdminPanel.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, FolderPlus, Users } from 'lucide-react';
import React from 'react';
// Define the possible tab values
type TabType = 'categories' | 'requests' | 'overview'; // Adjust based on your actual tab values

// Define the props interface
interface OverviewProps {
    setActiveTab: (tab: TabType) => void;
}

export const Overview: React.FC<OverviewProps> = ({ setActiveTab }) => {
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
                            <p className="text-2xl font-bold text-blue-600">-</p>
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
                            <p className="text-2xl font-bold text-green-600">-</p>
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
                            <p className="text-2xl font-bold text-yellow-600">-</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="flex space-x-4">
                    <Button onClick={() => setActiveTab('categories')}>
                        Manage Categories
                    </Button>
                    <Button onClick={() => setActiveTab('requests')} variant="outline">
                        Review Requests
                    </Button>
                </div>
            </Card>
        </div>
    );

};