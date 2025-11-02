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
    Languages,
    Plus,
    Save,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DeleteButton } from '../ui/DeleteButton';
import PrimaryButton from '../ui/PrimaryButton';
import { EditButton } from '../ui/edit-button';

interface Language {
    id: string;
    name: string;
    code: string; // ISO language code like 'en', 'es', 'fr'
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Predefined list of popular languages
// Extended list of popular languages including continental/regional languages
const POPULAR_LANGUAGES = [
    { name: 'English', code: 'en', isActive: true },
    { name: 'Spanish', code: 'es', isActive: true },
    { name: 'French', code: 'fr', isActive: true },
    { name: 'German', code: 'de', isActive: true },
    { name: 'Chinese (Simplified)', code: 'zh', isActive: true },
    { name: 'Arabic', code: 'ar', isActive: true },
    { name: 'Portuguese', code: 'pt', isActive: true },
    { name: 'Russian', code: 'ru', isActive: true },
    { name: 'Japanese', code: 'ja', isActive: true },
    { name: 'Hindi', code: 'hi', isActive: true },
    { name: 'Bengali', code: 'bn', isActive: true },
    { name: 'Urdu', code: 'ur', isActive: true },
    { name: 'Tamil', code: 'ta', isActive: true },
    { name: 'Telugu', code: 'te', isActive: true },
    { name: 'Marathi', code: 'mr', isActive: true }
];

interface BulkLanguageItem {
    name: string;
    code: string;
    isActive: boolean;
}

const AdminLanguageManagement = () => {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showBulkForm, setShowBulkForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        isActive: true
    });
    const [bulkItems, setBulkItems] = useState<BulkLanguageItem[]>([
        { name: '', code: '', isActive: true },
        { name: '', code: '', isActive: true },
        { name: '', code: '', isActive: true },
    ]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch languages and prefill if empty
    useEffect(() => {
        const q = query(collection(db, 'languages'), orderBy('name', 'asc'));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const languagesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Language[];

            setLanguages(languagesList);
            setLoading(false);

            // If no languages exist, prefill with popular languages
            if (languagesList.length === 0) {
                try {
                    const batch = writeBatch(db);
                    POPULAR_LANGUAGES.forEach((lang) => {
                        const langRef = doc(collection(db, 'languages'));
                        batch.set(langRef, {
                            name: lang.name,
                            code: lang.code.toLowerCase(),
                            isActive: lang.isActive,
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp()
                        });
                    });
                    await batch.commit();
                    setSuccess('Popular languages added successfully');
                    setTimeout(() => setSuccess(''), 3000);
                } catch (error) {
                    console.error('Error prefilling languages:', error);
                    setError('Failed to prefill languages');
                }
            }
        }, (error) => {
            console.error('Error fetching languages:', error);
            setError('Failed to fetch languages');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const resetForm = () => {
        setFormData({ name: '', code: '', isActive: true });
        setEditingId(null);
        setShowAddForm(false);
        setError('');
        setSuccess('');
    };

    const resetBulkForm = () => {
        setBulkItems([
            { name: '', code: '', isActive: true },
            { name: '', code: '', isActive: true },
            { name: '', code: '', isActive: true },
        ]);
        setShowBulkForm(false);
        setError('');
        setSuccess('');
    };

    const addBulkRow = () => {
        setBulkItems([...bulkItems, { name: '', code: '', isActive: true }]);
    };

    const removeBulkRow = (index: number) => {
        if (bulkItems.length > 1) {
            setBulkItems(bulkItems.filter((_, i) => i !== index));
        }
    };

    const updateBulkItem = (index: number, field: keyof BulkLanguageItem, value: string | boolean) => {
        const updatedItems = [...bulkItems];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setBulkItems(updatedItems);
    };

    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Filter out empty rows
        const validItems = bulkItems.filter(item => item.name.trim() && item.code.trim());

        if (validItems.length === 0) {
            setError('Please fill in at least one language with name and code');
            return;
        }

        // Validate for duplicates within the bulk items
        const codes = validItems.map(item => item.code.toLowerCase());
        const hasDuplicates = codes.some((code, index) => codes.indexOf(code) !== index);

        if (hasDuplicates) {
            setError('Duplicate language codes found in your entries');
            return;
        }

        // Check for existing languages
        const existingCodes = languages.map(lang => lang.code.toLowerCase());
        const conflictingItems = validItems.filter(item =>
            existingCodes.includes(item.code.toLowerCase())
        );

        if (conflictingItems.length > 0) {
            setError(`Language codes already exist: ${conflictingItems.map(i => i.code).join(', ')}`);
            return;
        }

        try {
            const batch = writeBatch(db);

            validItems.forEach((item) => {
                const langRef = doc(collection(db, 'languages'));
                batch.set(langRef, {
                    name: item.name.trim(),
                    code: item.code.toLowerCase().trim(),
                    isActive: item.isActive,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            });

            await batch.commit();
            setSuccess(`Successfully added ${validItems.length} language(s)`);
            resetBulkForm();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error bulk adding languages:', error);
            setError('Failed to add languages');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.name.trim() || !formData.code.trim()) {
            setError('Language name and code are required');
            return;
        }

        // Check for duplicate language codes
        const existingLanguage = languages.find(lang =>
            lang.code.toLowerCase() === formData.code.toLowerCase() &&
            lang.id !== editingId
        );

        if (existingLanguage) {
            setError('Language code already exists');
            return;
        }

        try {
            if (editingId) {
                // Update existing language
                const languageRef = doc(db, 'languages', editingId);
                await updateDoc(languageRef, {
                    name: formData.name.trim(),
                    code: formData.code.toLowerCase().trim(),
                    isActive: formData.isActive,
                    updatedAt: serverTimestamp()
                });
                setSuccess('Language updated successfully');
            } else {
                // Add new language
                await addDoc(collection(db, 'languages'), {
                    name: formData.name.trim(),
                    code: formData.code.toLowerCase().trim(),
                    isActive: formData.isActive,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                setSuccess('Language added successfully');
            }

            resetForm();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error saving language:', error);
            setError('Failed to save language');
        }
    };

    const handleEdit = (language: Language) => {
        setFormData({
            name: language.name,
            code: language.code,
            isActive: language.isActive
        });
        setEditingId(language.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'languages', id));
            setSuccess('Language deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error deleting language:', error);
            setError('Failed to delete language');
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const languageRef = doc(db, 'languages', id);
            await updateDoc(languageRef, {
                isActive: !currentStatus,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating language status:', error);
            setError('Failed to update language status');
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
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <Languages className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Language Management</h1>
                        <p className="text-gray-600">Manage languages available for user portfolio language proficiency</p>
                    </div>
                </div>

                {!showAddForm && !showBulkForm && (
                    <div className="flex gap-3">
                        <PrimaryButton
                            onClick={() => setShowAddForm(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Language
                        </PrimaryButton>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => setShowBulkForm(true)}
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Bulk Create
                        </Button>
                    </div>
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

            {/* Bulk Create Form */}
            {showBulkForm && (
                <Card className="mb-8 p-6">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Bulk Create Languages</h2>
                                <p className="text-sm text-gray-500 mt-1">Add multiple languages at once. Empty rows will be ignored.</p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetBulkForm}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleBulkSubmit}>
                            <div className="space-y-4 mb-6">
                                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider px-2">
                                    <div className="col-span-5">Language Name *</div>
                                    <div className="col-span-3">Code *</div>
                                    <div className="col-span-2">Active</div>
                                    <div className="col-span-2">Actions</div>
                                </div>

                                {bulkItems.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-5">
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => updateBulkItem(index, 'name', e.target.value)}
                                                placeholder="e.g., English"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <input
                                                type="text"
                                                value={item.code}
                                                onChange={(e) => updateBulkItem(index, 'code', e.target.value)}
                                                placeholder="e.g., en"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={item.isActive}
                                                    onChange={(e) => updateBulkItem(index, 'isActive', e.target.checked)}
                                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">Active</span>
                                            </label>
                                        </div>
                                        <div className="col-span-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeBulkRow(index)}
                                                disabled={bulkItems.length === 1}
                                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addBulkRow}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Row
                                </Button>
                                <div className="flex-1"></div>
                                <Button size='lg' type="button" variant="outline" onClick={resetBulkForm}>
                                    Cancel
                                </Button>
                                <PrimaryButton type="submit">
                                    <Save className="w-4 h-4 mr-2" />
                                    Create All Languages
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </Card>
            )}

            {/* Add/Edit Form */}
            {showAddForm && (
                <Card className="mb-8 p-6">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingId ? 'Edit Language' : 'Add New Language'}
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Language Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., English"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Language Code *
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                                    placeholder="e.g., en"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">ISO language code (e.g., en, es, fr)</p>
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
                        </div>

                        <div className="flex gap-3 mt-6">
                            <PrimaryButton onClick={handleSubmit}>
                                <Save className="w-4 h-4 mr-2" />
                                {editingId ? 'Update Language' : 'Add Language'}
                            </PrimaryButton>
                            <Button size='lg' type="button" variant="outline" onClick={resetForm}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Languages List */}
            <Card className="overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Languages ({languages.length})
                    </h2>
                </div>

                {languages.length === 0 ? (
                    <div className="p-12 text-center">
                        <Languages className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Languages Found</h3>
                        <p className="text-gray-600 mb-6">Get started by adding your first language.</p>
                        <PrimaryButton
                            onClick={() => setShowAddForm(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Language
                        </PrimaryButton>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Language
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Code
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
                                {languages.map((language) => (
                                    <tr key={language.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{language.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                                                {language.code}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleStatus(language.id, language.isActive)}
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${language.isActive
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                            >
                                                {language.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {language.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center gap-2 justify-end">
                                                <EditButton
                                                    onEdit={(language) => handleEdit(language)}
                                                    editData={language}
                                                />
                                                <DeleteButton
                                                    alignWith="auto"
                                                    onDelete={() => handleDelete(language.id, language.name)}
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

export default AdminLanguageManagement;