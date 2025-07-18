import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Institution, InstitutionFormData, useInstitution } from '@/lib/hooks/useInstitution';
import {
    AlertCircle,
    Building,
    CheckCircle,
    MapPin,
    Plus,
    Save,
    School,
    X
} from 'lucide-react';
import React, { useState } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ApproveButton } from '../ui/ApproveButton';
import { DeleteButton } from '../ui/DeleteButton';
import PrimaryButton from '../ui/PrimaryButton';
import { RejectButton } from '../ui/RejectButton';
import { EditButton } from '../ui/edit-button';

const INSTITUTION_TYPES = [
    'University',
    'Medical College',
    'Engineering College',
    'College',
    'School',
    'Institute',
    'Madrasa',
    'Technical Institute',
];

const BANGLADESH_DIVISIONS = [
    'Dhaka',
    'Chittagong',
    'Rajshahi',
    'Khulna',
    'Barisal',
    'Sylhet',
    'Rangpur',
    'Mymensingh',
];

const AdminInstitutionManagement = () => {
    const {
        institutions,
        institutionRequests,
        loading,
        error,
        success,
        addInstitution,
        updateInstitution,
        deleteInstitution,
        toggleInstitutionStatus,
        toggleInstitutionVerification,
        handleInstitutionRequest,
        getPendingRequestsCount,
        clearMessages,
    } = useInstitution();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'institutions' | 'requests'>('institutions');
    const [formData, setFormData] = useState<InstitutionFormData>({
        name: '',
        shortName: '',
        type: 'University',
        location: '',
        division: 'Dhaka',
        isActive: true,
        isVerified: true,
    });

    const resetForm = () => {
        setFormData({
            name: '',
            shortName: '',
            type: 'University',
            location: '',
            division: 'Dhaka',
            isActive: true,
            isVerified: true,
        });
        setEditingId(null);
        setShowAddForm(false);
        clearMessages();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let success;

        if (editingId) {
            success = await updateInstitution(editingId, formData);
        } else {
            success = await addInstitution(formData);
        }

        if (success) {
            resetForm();
        }
    };

    const handleEdit = (institution: Institution) => {
        setFormData({
            name: institution.name,
            shortName: institution.shortName || '',
            type: institution.type,
            location: institution.location,
            division: institution.division,
            isActive: institution.isActive,
            isVerified: institution.isVerified,
        });
        setEditingId(institution.id);
        setShowAddForm(true);
        setActiveTab('institutions');
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        await deleteInstitution(id);
    };

    if (loading) {
        return (
            <LoadingSpinner />
        );
    }

    const pendingRequests = getPendingRequestsCount();

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <School className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Institution Management</h1>
                        <p className="text-gray-600">Manage educational institutions and user requests</p>
                    </div>
                </div>

                {!showAddForm && (
                    <PrimaryButton onClick={() => setShowAddForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Institution
                    </PrimaryButton>
                )}
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6">
                <button
                    onClick={() => setActiveTab('institutions')}
                    className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'institutions' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Institutions ({institutions.length})
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors relative ${activeTab === 'requests' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Requests ({institutionRequests.length})
                    {pendingRequests > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {pendingRequests}
                        </span>
                    )}
                </button>
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
                                {editingId ? 'Edit Institution' : 'Add New Institution'}
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
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Institution Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g., University of Dhaka"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Short Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.shortName}
                                        onChange={e => setFormData(prev => ({ ...prev, shortName: e.target.value }))}
                                        placeholder="e.g., DU"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type *
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        {INSTITUTION_TYPES.map(type => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                        placeholder="e.g., Dhaka"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Division *
                                    </label>
                                    <select
                                        value={formData.division}
                                        onChange={e => setFormData(prev => ({ ...prev, division: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        {BANGLADESH_DIVISIONS.map(division => (
                                            <option key={division} value={division}>
                                                {division}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Active</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isVerified}
                                            onChange={e => setFormData(prev => ({ ...prev, isVerified: e.target.checked }))}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Verified</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <PrimaryButton type="submit">
                                    <Save className="w-4 h-4 mr-2" />
                                    {editingId ? 'Update Institution' : 'Add Institution'}
                                </PrimaryButton>
                                <Button size="lg" type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
            )}

            {/* Institutions List */}
            {activeTab === 'institutions' && (
                <Card className="overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Institutions ({institutions.length})</h2>
                    </div>

                    {institutions.length === 0 ? (
                        <div className="p-12 text-center">
                            <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Institutions Found</h3>
                            <p className="text-gray-600 mb-6">Get started by adding your first institution.</p>
                            <PrimaryButton onClick={() => setShowAddForm(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Institution
                            </PrimaryButton>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Institution
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Verified
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {institutions.map(institution => (
                                        <tr key={institution.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="font-medium text-gray-900">{institution.name}</div>
                                                    {institution.shortName && (
                                                        <div className="text-sm text-gray-500">{institution.shortName}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Building className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">{institution.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <div className="text-sm text-gray-900">{institution.location}</div>
                                                        <div className="text-xs text-gray-500">{institution.division}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => toggleInstitutionStatus(institution.id, institution.isActive)}
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${institution.isActive
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                        }`}
                                                >
                                                    {institution.isActive ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => toggleInstitutionVerification(institution.id, institution.isVerified)}
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${institution.isVerified
                                                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                        }`}
                                                >
                                                    {institution.isVerified ? 'Verified' : 'Unverified'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <EditButton onEdit={() => handleEdit(institution)} editData={institution} />
                                                    <DeleteButton
                                                        alignWith="auto"
                                                        onDelete={() => handleDelete(institution.id, institution.name)}
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
            )}

            {/* Institution Requests List */}
            {activeTab === 'requests' && (
                <Card className="overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Institution Requests ({institutionRequests.length})
                        </h2>
                    </div>

                    {institutionRequests.length === 0 ? (
                        <div className="p-12 text-center">
                            <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Institution Requests</h3>
                            <p className="text-gray-600">No pending institution requests at the moment.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Institution
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Requested By
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
                                    {institutionRequests.map(request => (
                                        <tr key={request.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="font-medium text-gray-900">{request.name}</div>
                                                    {request.shortName && (
                                                        <div className="text-sm text-gray-500">{request.shortName}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Building className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">{request.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <div className="text-sm text-gray-900">{request.location}</div>
                                                        <div className="text-xs text-gray-500">{request.division}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {request.requestedByEmail}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${request.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : request.status === 'approved'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {request.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {request.status === 'pending' && (
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <ApproveButton
                                                            onApprove={async () => { await handleInstitutionRequest(request.id, 'approve', 'Approved by admin'); }}
                                                            tooltip="Approve request"
                                                        />
                                                        <RejectButton
                                                            onReject={async () => { await handleInstitutionRequest(request.id, 'reject', 'Rejected by admin'); }}
                                                            tooltip="Reject request"
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default AdminInstitutionManagement;