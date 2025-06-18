import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Types
export interface Degree {
    id: string;
    name: string;
    shortName: string;
    level: string;
    description?: string;
    isActive: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface SelectOption {
    value: string;
    label: string;
}

export interface DegreeFormData {
    name: string;
    shortName: string;
    level: string;
    description: string;
    isActive: boolean;
}

// Predefined degrees for initial setup
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

export const DEGREE_LEVELS = [
    'Certificate',
    'Diploma',
    'Undergraduate',
    'Graduate',
    'Postgraduate'
];

// Hook configuration options
interface UseDegreeOptions {
    activeOnly?: boolean; // Only fetch active degrees
    autoPopulate?: boolean; // Auto-populate with popular degrees if empty
}

// Hook return type
interface UseDegreeReturn {
    degrees: Degree[];
    degreeOptions: SelectOption[];
    loading: boolean;
    error: string;
    success: string;

    // CRUD operations
    addDegree: (data: Omit<DegreeFormData, 'id'>) => Promise<void>;
    updateDegree: (id: string, data: Partial<DegreeFormData>) => Promise<void>;
    deleteDegree: (id: string) => Promise<void>;
    toggleDegreeStatus: (id: string, currentStatus: boolean) => Promise<void>;

    // Utility functions
    clearMessages: () => void;
    validateDegree: (data: DegreeFormData, existingId?: string) => string | null;
}

export const useDegree = (options: UseDegreeOptions = {}): UseDegreeReturn => {
    const { activeOnly = false, autoPopulate = false } = options;

    const [degrees, setDegrees] = useState<Degree[]>([]);
    const [degreeOptions, setDegreeOptions] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Auto-clear messages after 3 seconds
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    // Fetch degrees from Firebase
    useEffect(() => {
        let q = query(
            collection(db, 'degrees'),
            orderBy('level'),
            orderBy('name', 'asc')
        );

        // Filter for active degrees only if specified
        if (activeOnly) {
            q = query(
                collection(db, 'degrees'),
                where('isActive', '==', true),
                orderBy('level'),
                orderBy('name', 'asc')
            );
        }

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const degreesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Degree[];

            setDegrees(degreesList);

            // Convert to select options
            const options: SelectOption[] = degreesList.map(degree => ({
                value: degree.name,
                label: `${degree.name} (${degree.shortName})`,
            }));

            setDegreeOptions(options);
            setLoading(false);

            // Auto-populate with popular degrees if empty and enabled
            if (degreesList.length === 0 && autoPopulate) {
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
    }, [activeOnly, autoPopulate]);

    // Validate degree data
    const validateDegree = (data: DegreeFormData, existingId?: string): string | null => {
        if (!data.name.trim() || !data.shortName.trim()) {
            return 'Degree name and short name are required';
        }

        // Check for duplicate degree names or short names
        const existingDegree = degrees.find(degree =>
            (degree.name.toLowerCase() === data.name.toLowerCase() ||
                degree.shortName.toLowerCase() === data.shortName.toLowerCase()) &&
            degree.id !== existingId
        );

        if (existingDegree) {
            return 'Degree name or short name already exists';
        }

        return null;
    };

    // Add new degree
    const addDegree = async (data: Omit<DegreeFormData, 'id'>): Promise<void> => {
        setError('');
        setSuccess('');

        const validationError = validateDegree(data as DegreeFormData);
        if (validationError) {
            setError(validationError);
            throw new Error(validationError);
        }

        try {
            await addDoc(collection(db, 'degrees'), {
                name: data.name.trim(),
                shortName: data.shortName.trim(),
                level: data.level,
                description: data.description.trim(),
                isActive: data.isActive,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            setSuccess('Degree added successfully');
        } catch (error) {
            console.error('Error adding degree:', error);
            const errorMessage = 'Failed to add degree';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // Update existing degree
    const updateDegree = async (id: string, data: Partial<DegreeFormData>): Promise<void> => {
        setError('');
        setSuccess('');

        if (data.name || data.shortName) {
            const validationError = validateDegree(data as DegreeFormData, id);
            if (validationError) {
                setError(validationError);
                throw new Error(validationError);
            }
        }

        try {
            const degreeRef = doc(db, 'degrees', id);
            const updateData: any = {
                updatedAt: serverTimestamp()
            };

            // Only update provided fields
            if (data.name !== undefined) updateData.name = data.name.trim();
            if (data.shortName !== undefined) updateData.shortName = data.shortName.trim();
            if (data.level !== undefined) updateData.level = data.level;
            if (data.description !== undefined) updateData.description = data.description.trim();
            if (data.isActive !== undefined) updateData.isActive = data.isActive;

            await updateDoc(degreeRef, updateData);
            setSuccess('Degree updated successfully');
        } catch (error) {
            console.error('Error updating degree:', error);
            const errorMessage = 'Failed to update degree';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // Delete degree
    const deleteDegree = async (id: string): Promise<void> => {
        setError('');
        setSuccess('');

        try {
            await deleteDoc(doc(db, 'degrees', id));
            setSuccess('Degree deleted successfully');
        } catch (error) {
            console.error('Error deleting degree:', error);
            const errorMessage = 'Failed to delete degree';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // Toggle degree active status
    const toggleDegreeStatus = async (id: string, currentStatus: boolean): Promise<void> => {
        try {
            await updateDegree(id, { isActive: !currentStatus });
        } catch (error) {
            // Error is already handled in updateDegree
            throw error;
        }
    };

    // Clear success/error messages
    const clearMessages = (): void => {
        setError('');
        setSuccess('');
    };

    return {
        degrees,
        degreeOptions,
        loading,
        error,
        success,
        addDegree,
        updateDegree,
        deleteDegree,
        toggleDegreeStatus,
        clearMessages,
        validateDegree
    };
};