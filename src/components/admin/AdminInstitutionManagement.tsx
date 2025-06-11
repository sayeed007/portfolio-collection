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
    writeBatch,
    where
} from 'firebase/firestore';
import {
    AlertCircle,
    CheckCircle,
    School,
    Plus,
    Save,
    X,
    Clock,
    CheckSquare,
    XSquare
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DeleteButton } from '../ui/DeleteButton';
import PrimaryButton from '../ui/PrimaryButton';
import { EditButton } from '../ui/edit-button';

interface Institution {
    id: string;
    name: string;
    shortName?: string;
    type: string; // University, College, School, Institute
    location: string; // City/District
    division: string; // Division in Bangladesh
    isActive: boolean;
    isVerified: boolean; // Admin verified
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

interface InstitutionRequest {
    id: string;
    name: string;
    shortName?: string;
    type: string;
    location: string;
    division: string;
    requestedBy: string; // User ID
    requestedByEmail: string;
    status: 'pending' | 'approved' | 'rejected';
    adminComment?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Comprehensive list of institutions in Bangladesh
const POPULAR_INSTITUTIONS = [
    // Major Public Universities
    { name: 'University of Dhaka', shortName: 'DU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Bangladesh University of Engineering and Technology', shortName: 'BUET', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Chittagong University', shortName: 'CU', type: 'University', location: 'Chittagong', division: 'Chittagong', isActive: true, isVerified: true },
    { name: 'Rajshahi University', shortName: 'RU', type: 'University', location: 'Rajshahi', division: 'Rajshahi', isActive: true, isVerified: true },
    { name: 'Jahangirnagar University', shortName: 'JU', type: 'University', location: 'Savar', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Bangladesh Agricultural University', shortName: 'BAU', type: 'University', location: 'Mymensingh', division: 'Mymensingh', isActive: true, isVerified: true },
    { name: 'Khulna University', shortName: 'KU', type: 'University', location: 'Khulna', division: 'Khulna', isActive: true, isVerified: true },
    { name: 'Shahjalal University of Science and Technology', shortName: 'SUST', type: 'University', location: 'Sylhet', division: 'Sylhet', isActive: true, isVerified: true },
    { name: 'Bangabandhu Sheikh Mujib Medical University', shortName: 'BSMMU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Hajee Mohammad Danesh Science and Technology University', shortName: 'HSTU', type: 'University', location: 'Dinajpur', division: 'Rangpur', isActive: true, isVerified: true },
    { name: 'Jessore University of Science and Technology', shortName: 'JUST', type: 'University', location: 'Jessore', division: 'Khulna', isActive: true, isVerified: true },
    { name: 'Comilla University', shortName: 'CoU', type: 'University', location: 'Comilla', division: 'Chittagong', isActive: true, isVerified: true },
    { name: 'Noakhali Science and Technology University', shortName: 'NSTU', type: 'University', location: 'Noakhali', division: 'Chittagong', isActive: true, isVerified: true },
    { name: 'Patuakhali Science and Technology University', shortName: 'PSTU', type: 'University', location: 'Patuakhali', division: 'Barisal', isActive: true, isVerified: true },
    { name: 'Mawlana Bhashani Science and Technology University', shortName: 'MBSTU', type: 'University', location: 'Tangail', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Rangamati Science and Technology University', shortName: 'RMSTU', type: 'University', location: 'Rangamati', division: 'Chittagong', isActive: true, isVerified: true },
    { name: 'Begum Rokeya University', shortName: 'BRUR', type: 'University', location: 'Rangpur', division: 'Rangpur', isActive: true, isVerified: true },
    { name: 'Jatiya Kabi Kazi Nazrul Islam University', shortName: 'JKKNIU', type: 'University', location: 'Mymensingh', division: 'Mymensingh', isActive: true, isVerified: true },
    { name: 'Jagannath University', shortName: 'JnU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Islamic University', shortName: 'IU', type: 'University', location: 'Kushtia', division: 'Khulna', isActive: true, isVerified: true },

    // Major Private Universities
    { name: 'North South University', shortName: 'NSU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'BRAC University', shortName: 'BRACU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Independent University, Bangladesh', shortName: 'IUB', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'American International University-Bangladesh', shortName: 'AIUB', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'East West University', shortName: 'EWU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'United International University', shortName: 'UIU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Daffodil International University', shortName: 'DIU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Ahsanullah University of Science and Technology', shortName: 'AUST', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Southeast University', shortName: 'SEU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'University of Asia Pacific', shortName: 'UAP', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Stamford University Bangladesh', shortName: 'SUB', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Bangladesh University of Business and Technology', shortName: 'BUBT', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Metropolitan University', shortName: 'MU', type: 'University', location: 'Sylhet', division: 'Sylhet', isActive: true, isVerified: true },
    { name: 'Premier University', shortName: 'PU', type: 'University', location: 'Chittagong', division: 'Chittagong', isActive: true, isVerified: true },
    { name: 'International University of Business Agriculture and Technology', shortName: 'IUBAT', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },

    // Medical Colleges
    { name: 'Dhaka Medical College', shortName: 'DMC', type: 'Medical College', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Chittagong Medical College', shortName: 'CMC', type: 'Medical College', location: 'Chittagong', division: 'Chittagong', isActive: true, isVerified: true },
    { name: 'Rajshahi Medical College', shortName: 'RMC', type: 'Medical College', location: 'Rajshahi', division: 'Rajshahi', isActive: true, isVerified: true },
    { name: 'Sylhet MAG Osmani Medical College', shortName: 'SOMC', type: 'Medical College', location: 'Sylhet', division: 'Sylhet', isActive: true, isVerified: true },
    { name: 'Mymensingh Medical College', shortName: 'MMC', type: 'Medical College', location: 'Mymensingh', division: 'Mymensingh', isActive: true, isVerified: true },
    { name: 'Sir Salimullah Medical College', shortName: 'SSMC', type: 'Medical College', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Sher-E-Bangla Medical College', shortName: 'SBMC', type: 'Medical College', location: 'Barisal', division: 'Barisal', isActive: true, isVerified: true },

    // Engineering Colleges
    { name: 'Military Institute of Science and Technology', shortName: 'MIST', type: 'Engineering College', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Chittagong University of Engineering & Technology', shortName: 'CUET', type: 'Engineering College', location: 'Chittagong', division: 'Chittagong', isActive: true, isVerified: true },
    { name: 'Rajshahi University of Engineering & Technology', shortName: 'RUET', type: 'Engineering College', location: 'Rajshahi', division: 'Rajshahi', isActive: true, isVerified: true },
    { name: 'Khulna University of Engineering & Technology', shortName: 'KUET', type: 'Engineering College', location: 'Khulna', division: 'Khulna', isActive: true, isVerified: true },
    { name: 'Dhaka University of Engineering & Technology', shortName: 'DUET', type: 'Engineering College', location: 'Gazipur', division: 'Dhaka', isActive: true, isVerified: true },

    // Prominent Colleges
    { name: 'Dhaka College', shortName: 'DC', type: 'College', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Notre Dame College', shortName: 'NDC', type: 'College', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Holy Cross College', shortName: 'HCC', type: 'College', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Adamjee Cantonment College', shortName: 'ACC', type: 'College', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Chittagong College', shortName: 'CC', type: 'College', location: 'Chittagong', division: 'Chittagong', isActive: true, isVerified: true },
    { name: 'Rajshahi College', shortName: 'RC', type: 'College', location: 'Rajshahi', division: 'Rajshahi', isActive: true, isVerified: true },
    { name: 'Government Edward College', shortName: 'GEC', type: 'College', location: 'Pabna', division: 'Rajshahi', isActive: true, isVerified: true },
    { name: 'MC College', shortName: 'MCC', type: 'College', location: 'Sylhet', division: 'Sylhet', isActive: true, isVerified: true },

    // Prominent Schools
    { name: 'Dhaka Residential Model College', shortName: 'DRMC', type: 'School', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Viqarunnisa Noon School and College', shortName: 'VNS', type: 'School', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Holy Cross Girls High School', shortName: 'HCGHS', type: 'School', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'St. Gregory\'s High School', shortName: 'SGHS', type: 'School', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Scholastica School', shortName: 'SS', type: 'School', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Maple Leaf International School', shortName: 'MLIS', type: 'School', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Chittagong Grammar School', shortName: 'CGS', type: 'School', location: 'Chittagong', division: 'Chittagong', isActive: true, isVerified: true },
];

const INSTITUTION_TYPES = [
    'University',
    'Medical College',
    'Engineering College',
    'College',
    'School',
    'Institute',
    'Madrasa',
    'Technical Institute'
];

const BANGLADESH_DIVISIONS = [
    'Dhaka',
    'Chittagong',
    'Rajshahi',
    'Khulna',
    'Barisal',
    'Sylhet',
    'Rangpur',
    'Mymensingh'
];

const AdminInstitutionManagement = () => {
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [institutionRequests, setInstitutionRequests] = useState<InstitutionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'institutions' | 'requests'>('institutions');
    const [formData, setFormData] = useState({
        name: '',
        shortName: '',
        type: 'University',
        location: '',
        division: 'Dhaka',
        isActive: true,
        isVerified: true
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch institutions and prefill if empty
    useEffect(() => {
        const institutionsQuery = query(
            collection(db, 'institutions'),
            orderBy('type'),
            orderBy('name', 'asc')
        );

        const unsubscribe = onSnapshot(institutionsQuery, async (snapshot) => {
            const institutionsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Institution[];

            setInstitutions(institutionsList);
            setLoading(false);

            // If no institutions exist, prefill with popular institutions
            if (institutionsList.length === 0) {
                try {
                    const batch = writeBatch(db);
                    POPULAR_INSTITUTIONS.forEach((institution) => {
                        const institutionRef = doc(collection(db, 'institutions'));
                        batch.set(institutionRef, {
                            name: institution.name,
                            shortName: institution.shortName,
                            type: institution.type,
                            location: institution.location,
                            division: institution.division,
                            isActive: institution.isActive,
                            isVerified: institution.isVerified,
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp()
                        });
                    });
                    await batch.commit();
                    setSuccess('Popular institutions added successfully');
                    setTimeout(() => setSuccess(''), 3000);
                } catch (error) {
                    console.error('Error prefilling institutions:', error);
                    setError('Failed to prefill institutions');
                }
            }
        }, (error) => {
            console.error('Error fetching institutions:', error);
            setError('Failed to fetch institutions');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Fetch institution requests
    useEffect(() => {
        const requestsQuery = query(
            collection(db, 'institutionRequests'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
            const requestsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as InstitutionRequest[];

            setInstitutionRequests(requestsList);
        }, (error) => {
            console.error('Error fetching institution requests:', error);
        });

        return () => unsubscribe();
    }, []);

    const resetForm = () => {
        setFormData({
            name: '',
            shortName: '',
            type: 'University',
            location: '',
            division: 'Dhaka',
            isActive: true,
            isVerified: true
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

        if (!formData.name.trim() || !formData.location.trim()) {
            setError('Institution name and location are required');
            return;
        }

        // Check for duplicate institution names
        const existingInstitution = institutions.find(institution =>
            institution.name.toLowerCase() === formData.name.toLowerCase() &&
            institution.id !== editingId
        );

        if (existingInstitution) {
            setError('Institution name already exists');
            return;
        }

        try {
            if (editingId) {
                // Update existing institution
                const institutionRef = doc(db, 'institutions', editingId);
                await updateDoc(institutionRef, {
                    name: formData.name.trim(),
                    shortName: formData.shortName.trim() || null,
                    type: formData.type,
                    location: formData.location.trim(),
                    division: formData.division,
                    isActive: formData.isActive,
                    isVerified: formData.isVerified,
                    updatedAt: serverTimestamp()
                });
                setSuccess('Institution updated successfully');
            } else {
                // Add new institution
                await addDoc(collection(db, 'institutions'), {
                    name: formData.name.trim(),
                    shortName: formData.shortName.trim() || null,
                    type: formData.type,
                    location: formData.location.trim(),
                    division: formData.division,
                    isActive: formData.isActive,
                    isVerified: formData.isVerified,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                setSuccess('Institution added successfully');
            }

            resetForm();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error saving institution:', error);
            setError('Failed to save institution');
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
            isVerified: institution.isVerified
        });
        setEditingId(institution.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'institutions', id));
            setSuccess('Institution deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error deleting institution:', error);
            setError('Failed to delete institution');
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const institutionRef = doc(db, 'institutions', id);
            await updateDoc(institutionRef, {
                isActive: !currentStatus,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating institution status:', error);
            setError('Failed to update institution status');
        }
    };

    const handleRequestAction = async (requestId: string, action: 'approve' | 'reject', adminComment?: string) => {
        try {
            const request = institutionRequests.find(req => req.id === requestId);
            if (!request) return;

            if (action === 'approve') {
                // Add institution to main collection
                await addDoc(collection(db, 'institutions'), {
                    name: request.name,
                    shortName: request.shortName || null,
                    type: request.type,
                    location: request.location,
                    division: request.division,
                    isActive: true,
                    isVerified: true,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }

            // Update request status
            const requestRef = doc(db, 'institutionRequests', requestId);
            await updateDoc(requestRef, {
                status: action === 'approve' ? 'approved' : 'rejected',
                adminComment: adminComment || null,
                updatedAt: serverTimestamp()
            });

            setSuccess(`Institution request ${action}d successfully`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error processing request:', error);
            setError('Failed to process request');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const pendingRequests = institutionRequests.filter(req => req.status === 'pending');

    return (
        <div className="max-w-6xl mx-auto p-6">
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
                    <PrimaryButton
                        onClick={() => setShowAddForm(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Institution
                    </PrimaryButton>
                )}
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6">
                <button
                    onClick={() => setActiveTab('institutions')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'institutions'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Institutions ({institutions.length})
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${activeTab === 'requests'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Requests ({institutionRequests.length})
                    {pendingRequests.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {pendingRequests.length}
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
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                                        onChange={(e) => setFormData(prev => ({ ...prev, shortName: e.target.value }))}
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
                                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        {INSTITUTION_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location *
                                    </label>