// src/components/admin/AdminPanel.tsx
'use client';

import { FolderPlus, GraduationCap, Languages, School, Settings, Users } from 'lucide-react';
import React, { useState } from 'react';
import BackgroundDecoration from '../common/BackgroundDecoration';
import AdminDegreeManagement from './AdminDegreeManagement';
import AdminInstitutionManagement from './AdminInstitutionManagement';
import AdminLanguageManagement from './AdminLanguageManagement';
import AdminSkillManagement from './AdminSkillManagement';
import AdminUserManagement from './AdminUserManagement';
import { Overview } from './Overview';

type TabType = 'overview' | 'users' | 'languages' | 'degrees' | 'institutions' | 'categories';

export const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', icon: Settings },
        { id: 'users' as TabType, label: 'Users', icon: Users },
        { id: 'languages' as TabType, label: 'Language', icon: Languages },
        { id: 'degrees' as TabType, label: 'Degrees', icon: GraduationCap },
        { id: 'institutions' as TabType, label: 'Institutions', icon: School },
        { id: 'categories' as TabType, label: 'Categories', icon: FolderPlus },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <AdminUserManagement />;
            case 'languages':
                return <AdminLanguageManagement />;
            case 'degrees':
                return <AdminDegreeManagement />;
            case 'institutions':
                return <AdminInstitutionManagement />;
            case 'categories':
                return <AdminSkillManagement />;
            default:
                return <Overview setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <BackgroundDecoration />

            {/* TABS */}
            <div className="bg-white">
                <div className="container mx-auto px-4 border-b border-blue-200">
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