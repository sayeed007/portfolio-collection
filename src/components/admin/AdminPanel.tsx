// src/components/admin/AdminPanel.tsx
'use client';

import { CheckCircle, FolderPlus, GraduationCap, Languages, Settings } from 'lucide-react';
import React, { useState } from 'react';
import BackgroundDecoration from '../common/BackgroundDecoration';
// import { CategoryManagement } from './CategoryManagement';
import { Overview } from './Overview';
// import { RequestApproval } from './RequestApproval';
import AdminLanguageManagement from './AdminLanguageManagement';
import AdminDegreeManagement from './AdminDegreeManagement';

type TabType = 'overview' | 'languages' | 'degrees' | 'categories' | 'requests';

export const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('degrees');

    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', icon: Settings },
        { id: 'languages' as TabType, label: 'Language', icon: Languages },
        { id: 'degrees' as TabType, label: 'Degrees', icon: GraduationCap },
        { id: 'categories' as TabType, label: 'Categories', icon: FolderPlus },
        { id: 'requests' as TabType, label: 'Requests', icon: CheckCircle },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'languages':
                return <AdminLanguageManagement />;
            case 'degrees':
                return <AdminDegreeManagement />;
            // case 'categories':
            //     return <CategoryManagement />;
            // case 'requests':
            //     return <RequestApproval />;
            default:
                return <Overview setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <BackgroundDecoration />

            {/* TABS */}
            <div className="border-b border-gray-500 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`cursor-pointer flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${activeTab === tab.id
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

            {/* TAB- Content */}
            <div className="container mx-auto px-4 py-8">
                {renderContent()}
            </div>
        </div>
    );
};