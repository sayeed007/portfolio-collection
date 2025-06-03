// src/components/admin/AdminPanel.tsx
'use client';

import React, { useState } from 'react';
import { CategoryManagement } from './CategoryManagement';
import { RequestApproval } from './RequestApproval';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, FolderPlus, CheckCircle, Settings } from 'lucide-react';

type TabType = 'overview' | 'categories' | 'requests';

export const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', icon: Settings },
        { id: 'categories' as TabType, label: 'Categories', icon: FolderPlus },
        { id: 'requests' as TabType, label: 'Requests', icon: CheckCircle },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'categories':
                return <CategoryManagement />;
            case 'requests':
                return <RequestApproval />;
            default:
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
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="border-b bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {renderContent()}
            </div>
        </div>
    );
};