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
} from 'firebase/firestore';
import {
    AlertCircle,
    CheckCircle,
    School,
    Plus,
    Save,
    X,
    CheckSquare,
    XSquare,
    MapPin,
    Building,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DeleteButton } from '../ui/DeleteButton';
import PrimaryButton from '../ui/PrimaryButton';
import { EditButton } from '../ui/edit-button';

interface Institution {
    id: string;
    name: string;
    shortName?: string;
    type: string;
    location: string;
    division: string;
    isActive: boolean;
    isVerified: boolean;
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
    requestedBy: string;
    requestedByEmail: string;
    status: 'pending' | 'approved' | 'rejected';
    adminComment?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

const POPULAR_INSTITUTIONS = [
    // Public Universities
    { name: 'University of Dhaka', shortName: 'DU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Bangladesh University of Engineering and Technology', shortName: 'BUET', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'University of Chittagong', shortName: 'CU', type: 'University', location: 'Chittagong', division: 'Chittagong', isActive: true, isVerified: true },
    { name: 'University of Rajshahi', shortName: 'RU', type: 'University', location: 'Rajshahi', division: 'Rajshahi', isActive: true, isVerified: true },
    { name: 'Jahangirnagar University', shortName: 'JU', type: 'University', location: 'Savar', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Bangladesh Agricultural University', shortName: 'BAU', type: 'University', location: 'Mymensingh', division: 'Mymensingh', isActive: true, isVerified: true },
    { name: 'Khulna University', shortName: 'KU', type: 'University', location: 'Khulna', division: 'Khulna', isActive: true, isVerified: true },
    { name: 'Shahjalal University of Science and Technology', shortName: 'SUST', type: 'University', location: 'Sylhet', division: 'Sylhet', isActive: true, isVerified: true },
    { name: 'Islamic University', shortName: 'IU', type: 'University', location: 'Kushtia', division: 'Khulna', isActive: true, isVerified: true },
    { name: 'Jagannath University', shortName: 'JnU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Barisal University', shortName: 'BU', type: 'University', location: 'Barisal', division: 'Barisal', isActive: true, isVerified: true },
    { name: 'Comilla University', shortName: 'CoU', type: 'University', location: 'Comilla', division: 'Chittagong', isActive: true, isVerified: true },
    { name: 'Jatiya Kabi Kazi Nazrul Islam University', shortName: 'JKKNIU', type: 'University', location: 'Mymensingh', division: 'Mymensingh', isActive: true, isVerified: true },
    { name: 'Begum Rokeya University', shortName: 'BRUR', type: 'University', location: 'Rangpur', division: 'Rangpur', isActive: true, isVerified: true },
    { name: 'Hajee Mohammad Danesh Science and Technology University', shortName: 'HSTU', type: 'University', location: 'Dinajpur', division: 'Rangpur', isActive: true, isVerified: true },
    { name: 'Mawlana Bhashani Science and Technology University', shortName: 'MBSTU', type: 'University', location: 'Tangail', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Noakhali Science and Technology University', shortName: 'NSTU', type: 'University', location: 'Noakhali', division: 'Chittagong', isActive: true, isVerified: true },
    { name: 'Jessore University of Science and Technology', shortName: 'JUST', type: 'University', location: 'Jessore', division: 'Khulna', isActive: true, isVerified: true },
    { name: 'Pabna University of Science and Technology', shortName: 'PUST', type: 'University', location: 'Pabna', division: 'Rajshahi', isActive: true, isVerified: true },
    { name: 'Patuakhali Science and Technology University', shortName: 'PSTU', type: 'University', location: 'Patuakhali', division: 'Barisal', isActive: true, isVerified: true },
    { name: 'Rangamati Science and Technology University', shortName: 'RMSTU', type: 'University', location: 'Rangamati', division: 'Chittagong', isActive: true, isVerified: true },
    { name: 'Sylhet Agricultural University', shortName: 'SAU', type: 'University', location: 'Sylhet', division: 'Sylhet', isActive: true, isVerified: true },
    { name: 'Sher-e-Bangla Agricultural University', shortName: 'SBAU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Bangabandhu Sheikh Mujibur Rahman Agricultural University', shortName: 'BSMRAU', type: 'University', location: 'Gazipur', division: 'Dhaka', isActive: true, isVerified: true },

    // Private Universities
    { name: 'North South University', shortName: 'NSU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'BRAC University', shortName: 'VU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Independent University, Bangladesh', shortName: 'IUB', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'American International University-Bangladesh', shortName: 'AIU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'United International University', shortName: 'UIU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'East West University', shortName: 'EWU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Daffodil International University', shortName: 'DIU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Ahsanullah University of Science and Technology', shortName: 'AUST', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Southeast University', shortName: 'SEU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'University of Asia Pacific', shortName: 'UAP', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Stamford University Bangladesh', shortName: 'SUB', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Bangladesh University of Business and Technology', shortName: 'BUBT', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Metropolitan University', shortName: 'MU', type: 'University', location: 'Sylhet', division: 'Sylhet', isActive: true, isVerified: true },
    { name: 'Premier University', shortName: 'PU', type: 'University', location: 'Chittagong', division: 'Chittagong', isActive: true, isVerified: true },
    { name: 'International University of Business Agriculture and Technology', shortName: 'IUBAT', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Eastern University', shortName: 'EU', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Green University of Bangladesh', shortName: 'GUB', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'World University of Bangladesh', shortName: 'WUB', type: 'University', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },

    // Medical Colleges
    { name: 'Dhaka Medical College', shortName: 'DMC', type: 'Medical College', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Chittagong Medical College', shortName: 'CMC', type: 'Medical College', location: 'Chittagong', division: 'Chittagong', isActive: true, isVerified: true },
    { name: 'Rajshahi Medical College', shortName: 'RMC', type: 'Medical College', location: 'Rajshahi', division: 'Rajshahi', isActive: true, isVerified: true },
    { name: 'Sylhet MAG Osmani Medical College', shortName: 'SOMC', type: 'Medical College', location: 'Sylhet', division: 'Sylhet', isActive: true, isVerified: true },
    { name: 'Mymensingh Medical College', shortName: 'MMC', type: 'Medical College', location: 'Mymensingh', division: 'Mymensingh', isActive: true, isVerified: true },
    { name: 'Sir Salimullah Medical College', shortName: 'SSMC', type: 'Medical College', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Sher-E-Bangla Medical College', shortName: 'SBMC', type: 'Medical College', location: 'Barisal', division: 'Barisal', isActive: true, isVerified: true },
    { name: 'Rangpur Medical College', shortName: 'RpMC', type: 'Medical College', location: 'Rangpur', division: 'Rangpur', isActive: true, isVerified: true },
    { name: 'Dinajpur Medical College', shortName: 'DjMC', type: 'Medical College', location: 'Dinajpur', division: 'Rangpur', isActive: true, isVerified: true },

    // Engineering Colleges
    { name: 'Chittagong University of Engineering & Technology', shortName: 'CUET', type: 'Engineering College', location: 'Chittagong', division: 'Chittagong', isActive: true, isVerified: true },
    { name: 'Rajshahi University of Engineering & Technology', shortName: 'RUET', type: 'Engineering College', location: 'Rajshahi', division: 'Rajshahi', isActive: true, isVerified: true },
    { name: 'Khulna University of Engineering & Technology', shortName: 'KUET', type: 'Engineering College', location: 'Khulna', division: 'Khulna', isActive: true, isVerified: true },
    { name: 'Dhaka University of Engineering & Technology', shortName: 'DUET', type: 'Engineering College', location: 'Gazipur', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Military Institute of Science and Technology', shortName: 'MIST', type: 'Engineering College', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },

    // Colleges
    { name: 'Dhaka College', shortName: 'DC', type: 'College', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Notre Dame College', shortName: 'NDC', type: 'College', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Holy Cross College', shortName: 'HCC', type: 'College', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Adamjee Cantonment College', shortName: 'ACC', type: 'College', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Chittagong College', shortName: 'CC', type: 'College', location: 'Chittagong', division: 'Chittagong', isActive: true, isVerified: true },
    { name: 'Rajshahi College', shortName: 'RC', type: 'College', location: 'Rajshahi', division: 'Rajshahi', isActive: true, isVerified: true },
    { name: 'Government Edward College', shortName: 'GEC', type: 'College', location: 'Pabna', division: 'Rajshahi', isActive: true, isVerified: true },
    { name: 'MC College', shortName: 'MCC', type: 'College', location: 'Sylhet', division: 'Sylhet', isActive: true, isVerified: true },
    { name: 'Ananda Mohan College', shortName: 'AMC', type: 'College', location: 'Mymensingh', division: 'Mymensingh', isActive: true, isVerified: true },
    { name: 'Carmichael College', shortName: 'CC', type: 'College', location: 'Rangpur', division: 'Rangpur', isActive: true, isVerified: true },

    // Schools
    { name: 'Dhaka Residential Model College', shortName: 'DRMC', type: 'School', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Viqarunnisa Noon School and College', shortName: 'VNS', type: 'School', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Holy Cross Girls High School', shortName: 'HCGHS', type: 'School', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: "St. Gregory's High School", shortName: 'SGHS', type: 'School', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Scholastica School', shortName: 'SS', type: 'School', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Maple Leaf International School', shortName: 'MLIS', type: 'School', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Chittagong Grammar School', shortName: 'CGS', type: 'School', location: 'Chittagong', division: 'Chittagong', isActive: true, isVerified: true },
    { name: 'Ideal School and College', shortName: 'ISC', type: 'School', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: "Motijheel Government Boys' High School", shortName: 'MGBHS', type: 'School', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Sylhet Government Pilot High School', shortName: 'SGPHS', type: 'School', location: 'Sylhet', division: 'Sylhet', isActive: true, isVerified: true },

    // Technical Institutes
    { name: 'Dhaka Polytechnic Institute', shortName: 'DPI', type: 'Technical Institute', location: 'Dhaka', division: 'Dhaka', isActive: true, isVerified: true },
    { name: 'Chittagong Polytechnic Institute', shortName: 'CPI', type: 'Technical Institute', location: 'Chittagong', division: 'Chittagong', isActive: true, isVerified: true },
    { name: 'Rajshahi Polytechnic Institute', shortName: 'RPI', type: 'Technical Institute', location: 'Rajshahi', division: 'Rajshahi', isActive: true, isVerified: true },
    { name: 'Khulna Polytechnic Institute', shortName: 'KPI', type: 'Technical Institute', location: 'Khulna', division: 'Khulna', isActive: true, isVerified: true },
];

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
        isVerified: true,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch institutions and prefill if empty
    useEffect(() => {
        const institutionsQuery = query(collection(db, 'institutions'), orderBy('type'), orderBy('name', 'asc'));

        const unsubscribe = onSnapshot(
            institutionsQuery,
            async snapshot => {
                const institutionsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Institution[];

                setInstitutions(institutionsList);
                setLoading(false);

                if (institutionsList.length === 0) {
                    try {
                        const batch = writeBatch(db);
                        POPULAR_INSTITUTIONS.forEach(institution => {
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
                                updatedAt: serverTimestamp(),
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
            },
            error => {
                console.error('Error fetching institutions:', error);
                setError('Failed to fetch institutions');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Fetch institution requests
    useEffect(() => {
        const requestsQuery = query(collection(db, 'institutionRequests'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(
            requestsQuery,
            snapshot => {
                const requestsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as InstitutionRequest[];

                setInstitutionRequests(requestsList);
            },
            error => {
                console.error('Error fetching institution requests:', error);
                setError('Failed to fetch institution requests');
            }
        );

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
            isVerified: true,
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

        if (!formData.name.trim() || !formData.location.trim() || !formData.division.trim()) {
            setError('Institution name, location, and division are required');
            return;
        }

        const existingInstitution = institutions.find(
            institution =>
                institution.name.toLowerCase() === formData.name.toLowerCase() && institution.id !== editingId
        );

        if (existingInstitution) {
            setError('Institution name already exists');
            return;
        }

        try {
            if (editingId) {
                const institutionRef = doc(db, 'institutions', editingId);
                await updateDoc(institutionRef, {
                    name: formData.name.trim(),
                    shortName: formData.shortName.trim() || null,
                    type: formData.type,
                    location: formData.location.trim(),
                    division: formData.division,
                    isActive: formData.isActive,
                    isVerified: formData.isVerified,
                    updatedAt: serverTimestamp(),
                });
                setSuccess('Institution updated successfully');
            } else {
                await addDoc(collection(db, 'institutions'), {
                    name: formData.name.trim(),
                    shortName: formData.shortName.trim() || null,
                    type: formData.type,
                    location: formData.location.trim(),
                    division: formData.division,
                    isActive: formData.isActive,
                    isVerified: formData.isVerified,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
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
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error updating institution status:', error);
            setError('Failed to update institution status');
        }
    };

    const toggleVerification = async (id: string, currentStatus: boolean) => {
        try {
            const institutionRef = doc(db, 'institutions', id);
            await updateDoc(institutionRef, {
                isVerified: !currentStatus,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error updating institution verification:', error);
            setError('Failed to update institution verification');
        }
    };

    const handleRequestAction = async (requestId: string, action: 'approve' | 'reject', adminComment?: string) => {
        try {
            const request = institutionRequests.find(req => req.id === requestId);
            if (!request) return;

            if (action === 'approve') {
                await addDoc(collection(db, 'institutions'), {
                    name: request.name,
                    shortName: request.shortName || null,
                    type: request.type,
                    location: request.location,
                    division: request.division,
                    isActive: true,
                    isVerified: true,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            }

            const requestRef = doc(db, 'institutionRequests', requestId);
            await updateDoc(requestRef, {
                status: action === 'approve' ? 'approved' : 'rejected',
                adminComment: adminComment || null,
                updatedAt: serverTimestamp(),
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
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'institutions' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Institutions ({institutions.length})
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${activeTab === 'requests' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
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
                                                    onClick={() => toggleStatus(institution.id, institution.isActive)}
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
                                                    onClick={() => toggleVerification(institution.id, institution.isVerified)}
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
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                handleRequestAction(request.id, 'approve', 'Approved by admin')
                                                            }
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            <CheckSquare className="w-4 h-4 mr-2" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleRequestAction(request.id, 'reject', 'Rejected by admin')
                                                            }
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <XSquare className="w-4 h-4 mr-2" />
                                                            Reject
                                                        </Button>
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