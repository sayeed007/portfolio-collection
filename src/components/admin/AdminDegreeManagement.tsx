import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    AlertCircle,
    CheckCircle,
    GraduationCap,
    Plus,
    Save,
    X
} from 'lucide-react';
import React, { useState } from 'react';
import { DeleteButton } from '../ui/DeleteButton';
import PrimaryButton from '../ui/PrimaryButton';
import { EditButton } from '../ui/edit-button';
import { useDegree, type Degree, type DegreeFormData, DEGREE_LEVELS } from '@/lib/hooks/useDegree';
// import { useDegree, type Degree, type DegreeFormData, DEGREE_LEVELS } from '@/hooks/useDegree';

const AdminDegreeManagement = () => {
    const {
        degrees,
        loading,
        error,
        success,
        addDegree,
        updateDegree,
        deleteDegree,
        toggleDegreeStatus,
        clearMessages,
    } = useDegree({ autoPopulate: true });

    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState<DegreeFormData>({
        name: '',
        shortName: '',
        level: 'Undergraduate',
        description: '',
        isActive: true
    });

    const resetForm = () => {
        setFormData({
            name: '',
            shortName: '',
            level: 'Undergraduate',
            description: '',
            isActive: true
        });
        setEditingId(null);
        setShowAddForm(false);
        clearMessages();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingId) {
                await updateDegree(editingId, formData);
            } else {
                await addDegree(formData);
            }
            resetForm();
        } catch (error) {
            // Error is already handled by the hook
            console.error('Form submission error:', error);
        }
    };

    const handleEdit = (degree: Degree) => {
        setFormData({
            name: degree.name,
            shortName: degree.shortName,
            level: degree.level,
            description: degree.description || '',
            isActive: degree.isActive
        });
        setEditingId(degree.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteDegree(id);
        } catch (error) {
            // Error is already handled by the hook
            console.error('Delete error:', error);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await toggleDegreeStatus(id, currentStatus);
        } catch (error) {
            // Error is already handled by the hook
            console.error('Toggle status error:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <GraduationCap className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Degree Management</h1>
                        <p className="text-gray-600">Manage degrees available for user portfolio education section</p>
                    </div>
                </div>

                {!showAddForm && (
                    <PrimaryButton
                        onClick={() => setShowAddForm(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Degree
                    </PrimaryButton>
                )}
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800">{success}</span>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800">{error}</span>
                </div>
            )}

            {/* Add/Edit Form */}
            {showAddForm && (
                <Card className="mb-8 p-6">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingId ? 'Edit Degree' : 'Add New Degree'}
                            </h2>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetForm}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Degree Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., Bachelor of Science"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Short Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.shortName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, shortName: e.target.value }))}
                                        placeholder="e.g., BSc"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Level *
                                    </label>
                                    <select
                                        value={formData.level}
                                        onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        {DEGREE_LEVELS.map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Active</span>
                                    </label>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Optional description of the degree"
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <PrimaryButton type="submit">
                                    <Save className="w-4 h-4 mr-2" />
                                    {editingId ? 'Update Degree' : 'Add Degree'}
                                </PrimaryButton>
                                <Button size='lg' type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
            )}

            {/* Degrees List */}
            <Card className="overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Degrees ({degrees.length})
                    </h2>
                </div>

                {degrees.length === 0 ? (
                    <div className="p-12 text-center">
                        <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Degrees Found</h3>
                        <p className="text-gray-600 mb-6">Get started by adding your first degree.</p>
                        <PrimaryButton
                            onClick={() => setShowAddForm(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Degree
                        </PrimaryButton>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Degree
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Short Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created At
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {degrees.map((degree) => (
                                    <tr key={degree.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{degree.name}</div>
                                            {degree.description && (
                                                <div className="text-sm text-gray-500">{degree.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                                                {degree.shortName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {degree.level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggleStatus(degree.id, degree.isActive)}
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${degree.isActive
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                            >
                                                {degree.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {degree.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center gap-2 justify-end">
                                                <EditButton
                                                    onEdit={() => handleEdit(degree)}
                                                    editData={degree}
                                                />
                                                <DeleteButton
                                                    alignWith="auto"
                                                    onDelete={() => handleDelete(degree.id, degree.name)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminDegreeManagement;