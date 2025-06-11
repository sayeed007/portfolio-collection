import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { db } from '@/lib/firebase/config';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    writeBatch
} from 'firebase/firestore';
import {
    AlertCircle,
    CheckCircle,
    GraduationCap,
    Plus,
    Save,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DeleteButton } from '../ui/DeleteButton';
import PrimaryButton from '../ui/PrimaryButton';
import { EditButton } from '../ui/edit-button';

interface Degree {
    id: string;
    name: string;
    shortName: string; // e.g., BSc, MSc, PhD
    level: string; // e.g., Undergraduate, Graduate, Postgraduate
    description?: string;
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Predefined list of popular degrees in Bangladesh
const POPULAR_DEGREES = [
    // Undergraduate Degrees
    { name: 'Bachelor of Science', shortName: 'BSc', level: 'Undergraduate', description: 'Bachelor of Science degree', isActive: true },
    { name: 'Bachelor of Arts', shortName: 'BA', level: 'Undergraduate', description: 'Bachelor of Arts degree', isActive: true },
    { name: 'Bachelor of Commerce', shortName: 'BCom', level: 'Undergraduate', description: 'Bachelor of Commerce degree', isActive: true },
    { name: 'Bachelor of Business Administration', shortName: 'BBA', level: 'Undergraduate', description: 'Bachelor of Business Administration degree', isActive: true },
    { name: 'Bachelor of Computer Science', shortName: 'BCS', level: 'Undergraduate', description: 'Bachelor of Computer Science degree', isActive: true },
    { name: 'Bachelor of Engineering', shortName: 'BE', level: 'Undergraduate', description: 'Bachelor of Engineering degree', isActive: true },
    { name: 'Bachelor of Technology', shortName: 'BTech', level: 'Undergraduate', description: 'Bachelor of Technology degree', isActive: true },
    { name: 'Bachelor of Medicine', shortName: 'MBBS', level: 'Undergraduate', description: 'Bachelor of Medicine and Bachelor of Surgery', isActive: true },
    { name: 'Bachelor of Pharmacy', shortName: 'BPharm', level: 'Undergraduate', description: 'Bachelor of Pharmacy degree', isActive: true },
    { name: 'Bachelor of Laws', shortName: 'LLB', level: 'Undergraduate', description: 'Bachelor of Laws degree', isActive: true },
    { name: 'Bachelor of Social Science', shortName: 'BSS', level: 'Undergraduate', description: 'Bachelor of Social Science degree', isActive: true },
    { name: 'Bachelor of Fine Arts', shortName: 'BFA', level: 'Undergraduate', description: 'Bachelor of Fine Arts degree', isActive: true },
    { name: 'Bachelor of Architecture', shortName: 'BArch', level: 'Undergraduate', description: 'Bachelor of Architecture degree', isActive: true },

    // Graduate/Masters Degrees
    { name: 'Master of Science', shortName: 'MSc', level: 'Graduate', description: 'Master of Science degree', isActive: true },
    { name: 'Master of Arts', shortName: 'MA', level: 'Graduate', description: 'Master of Arts degree', isActive: true },
    { name: 'Master of Commerce', shortName: 'MCom', level: 'Graduate', description: 'Master of Commerce degree', isActive: true },
    { name: 'Master of Business Administration', shortName: 'MBA', level: 'Graduate', description: 'Master of Business Administration degree', isActive: true },
    { name: 'Master of Computer Science', shortName: 'MCS', level: 'Graduate', description: 'Master of Computer Science degree', isActive: true },
    { name: 'Master of Engineering', shortName: 'ME', level: 'Graduate', description: 'Master of Engineering degree', isActive: true },
    { name: 'Master of Technology', shortName: 'MTech', level: 'Graduate', description: 'Master of Technology degree', isActive: true },
    { name: 'Master of Philosophy', shortName: 'MPhil', level: 'Graduate', description: 'Master of Philosophy degree', isActive: true },
    { name: 'Master of Laws', shortName: 'LLM', level: 'Graduate', description: 'Master of Laws degree', isActive: true },
    { name: 'Master of Social Science', shortName: 'MSS', level: 'Graduate', description: 'Master of Social Science degree', isActive: true },
    { name: 'Master of Fine Arts', shortName: 'MFA', level: 'Graduate', description: 'Master of Fine Arts degree', isActive: true },
    { name: 'Master of Architecture', shortName: 'MArch', level: 'Graduate', description: 'Master of Architecture degree', isActive: true },

    // Postgraduate/Doctoral Degrees
    { name: 'Doctor of Philosophy', shortName: 'PhD', level: 'Postgraduate', description: 'Doctor of Philosophy degree', isActive: true },
    { name: 'Doctor of Medicine', shortName: 'MD', level: 'Postgraduate', description: 'Doctor of Medicine degree', isActive: true },
    { name: 'Doctor of Science', shortName: 'DSc', level: 'Postgraduate', description: 'Doctor of Science degree', isActive: true },
    { name: 'Doctor of Engineering', shortName: 'DEng', level: 'Postgraduate', description: 'Doctor of Engineering degree', isActive: true },

    // Diploma Degrees
    { name: 'Diploma in Engineering', shortName: 'Diploma', level: 'Diploma', description: 'Diploma in Engineering', isActive: true },
    { name: 'Diploma in Computer Science', shortName: 'DCS', level: 'Diploma', description: 'Diploma in Computer Science', isActive: true },
    { name: 'Diploma in Business Studies', shortName: 'DBS', level: 'Diploma', description: 'Diploma in Business Studies', isActive: true },

    // Certificate Degrees
    { name: 'Higher Secondary Certificate', shortName: 'HSC', level: 'Certificate', description: 'Higher Secondary Certificate', isActive: true },
    { name: 'Secondary School Certificate', shortName: 'SSC', level: 'Certificate', description: 'Secondary School Certificate', isActive: true },
];

const DEGREE_LEVELS = [
    'Certificate',
    'Diploma',
    'Undergraduate',
    'Graduate',
    'Postgraduate'
];

const AdminDegreeManagement = () => {
    const [degrees, setDegrees] = useState<Degree[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        shortName: '',
        level: 'Undergraduate',
        description: '',
        isActive: true
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch degrees and prefill if empty
    useEffect(() => {
        const q = query(collection(db, 'degrees'), orderBy('level'), orderBy('name', 'asc'));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const degreesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Degree[];

            setDegrees(degreesList);
            setLoading(false);

            // If no degrees exist, prefill with popular degrees
            if (degreesList.length === 0) {
                try {
                    const batch = writeBatch(db);
                    POPULAR_DEGREES.forEach((degree) => {
                        const degreeRef = doc(collection(db, 'degrees'));
                        batch.set(degreeRef, {
                            name: degree.name,
                            shortName: degree.shortName,
                            level: degree.level,
                            description: degree.description,
                            isActive: degree.isActive,
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp()
                        });
                    });
                    await batch.commit();
                    setSuccess('Popular degrees added successfully');
                    setTimeout(() => setSuccess(''), 3000);
                } catch (error) {
                    console.error('Error prefilling degrees:', error);
                    setError('Failed to prefill degrees');
                }
            }
        }, (error) => {
            console.error('Error fetching degrees:', error);
            setError('Failed to fetch degrees');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

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
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.name.trim() || !formData.shortName.trim()) {
            setError('Degree name and short name are required');
            return;
        }

        // Check for duplicate degree names or short names
        const existingDegree = degrees.find(degree =>
            (degree.name.toLowerCase() === formData.name.toLowerCase() ||
                degree.shortName.toLowerCase() === formData.shortName.toLowerCase()) &&
            degree.id !== editingId
        );

        if (existingDegree) {
            setError('Degree name or short name already exists');
            return;
        }

        try {
            if (editingId) {
                // Update existing degree
                const degreeRef = doc(db, 'degrees', editingId);
                await updateDoc(degreeRef, {
                    name: formData.name.trim(),
                    shortName: formData.shortName.trim(),
                    level: formData.level,
                    description: formData.description.trim(),
                    isActive: formData.isActive,
                    updatedAt: serverTimestamp()
                });
                setSuccess('Degree updated successfully');
            } else {
                // Add new degree
                await addDoc(collection(db, 'degrees'), {
                    name: formData.name.trim(),
                    shortName: formData.shortName.trim(),
                    level: formData.level,
                    description: formData.description.trim(),
                    isActive: formData.isActive,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                setSuccess('Degree added successfully');
            }

            resetForm();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error saving degree:', error);
            setError('Failed to save degree');
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
            await deleteDoc(doc(db, 'degrees', id));
            setSuccess('Degree deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error deleting degree:', error);
            setError('Failed to delete degree');
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const degreeRef = doc(db, 'degrees', id);
            await updateDoc(degreeRef, {
                isActive: !currentStatus,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating degree status:', error);
            setError('Failed to update degree status');
        }
    };

    // Group degrees by level for better organization
    // const groupedDegrees =
    degrees.reduce((acc, degree) => {
        if (!acc[degree.level]) {
            acc[degree.level] = [];
        }
        acc[degree.level].push(degree);
        return acc;
    }, {} as Record<string, Degree[]>);


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
                                                onClick={() => toggleStatus(degree.id, degree.isActive)}
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