// src\lib\hooks\useSkillCategoryRequests.ts
import { useState, useEffect } from 'react';
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
    where,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase/config';

export interface SkillCategoryRequest {
    id: string;
    name: string;
    requestedBy: string;
    requestedByEmail: string;
    status: 'pending' | 'approved' | 'rejected';
    adminComment?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface SkillRequest {
    id: string;
    name: string;
    categoryId: string;
    requestedBy: string;
    requestedByEmail: string;
    status: 'pending' | 'approved' | 'rejected';
    adminComment?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export const useSkillCategoryRequests = () => {
    const [categoryRequests, setCategoryRequests] = useState<SkillCategoryRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const categoryRequestsQuery = query(
            collection(db, 'skillCategoryRequests'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            categoryRequestsQuery,
            (snapshot) => {
                const requestsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as SkillCategoryRequest));

                setCategoryRequests(requestsList);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching category requests:', error);
                setError('Failed to fetch category requests');
                setLoading(false);
            }
        );

        return unsubscribe;
    }, []);

    const createCategoryRequest = async (
        name: string,
        requestedBy: string,
        requestedByEmail: string
    ): Promise<void> => {
        if (!name.trim()) {
            throw new Error('Category name is required');
        }
        if (!requestedBy.trim()) {
            throw new Error('Requester name is required');
        }
        if (!requestedByEmail.trim()) {
            throw new Error('Requester email is required');
        }

        try {
            await addDoc(collection(db, 'skillCategoryRequests'), {
                name: name.trim(),
                requestedBy: requestedBy.trim(),
                requestedByEmail: requestedByEmail.trim(),
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error creating category request:', error);
            throw new Error('Failed to create category request');
        }
    };

    const approveCategoryRequest = async (requestId: string): Promise<void> => {
        try {
            const request = categoryRequests.find(r => r.id === requestId);
            if (!request) {
                throw new Error('Request not found');
            }

            await addDoc(collection(db, 'skillCategories'), {
                name: request.name,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            await updateDoc(doc(db, 'skillCategoryRequests', requestId), {
                status: 'approved',
                adminComment: 'Approved by admin',
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error approving category request:', error);
            throw new Error('Failed to approve category request');
        }
    };

    const rejectCategoryRequest = async (requestId: string, adminComment?: string): Promise<void> => {
        try {
            await updateDoc(doc(db, 'skillCategoryRequests', requestId), {
                status: 'rejected',
                adminComment: adminComment || 'Rejected by admin',
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error rejecting category request:', error);
            throw new Error('Failed to reject category request');
        }
    };

    const deleteCategoryRequest = async (requestId: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'skillCategoryRequests', requestId));
        } catch (error) {
            console.error('Error deleting category request:', error);
            throw new Error('Failed to delete category request');
        }
    };

    const getPendingCategoryRequests = (): SkillCategoryRequest[] => {
        return categoryRequests.filter(request => request.status === 'pending');
    };

    return {
        categoryRequests,
        loading,
        error,
        createCategoryRequest,
        approveCategoryRequest,
        rejectCategoryRequest,
        deleteCategoryRequest,
        getPendingCategoryRequests,
    };
};

export const useSkillRequests = () => {
    const [skillRequests, setSkillRequests] = useState<SkillRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const auth = getAuth();
    const currentUser = auth.currentUser;

    useEffect(() => {
        if (!currentUser) {
            setError('User not authenticated');
            setLoading(false);
            return;
        }

        const setupListener = async () => {
            try {
                // Check if user is admin
                let isAdmin = false;

                // Check email first (simpler check)
                if (currentUser.email === 'admin@portfolio-collection.com') {
                    isAdmin = true;
                } else {
                    // Check custom claims
                    try {
                        const idTokenResult = await currentUser.getIdTokenResult();
                        isAdmin = idTokenResult.claims.admin === true;
                    } catch (claimsError) {
                        console.log('Could not check admin claims:', claimsError);
                        isAdmin = false;
                    }
                }

                let skillRequestsQuery;

                if (isAdmin) {
                    // Admins can fetch all skill requests
                    skillRequestsQuery = query(
                        collection(db, 'skillRequests'),
                        orderBy('createdAt', 'desc')
                    );
                } else {
                    // Non-admins can only fetch their own requests
                    skillRequestsQuery = query(
                        collection(db, 'skillRequests'),
                        where('requestedBy', '==', currentUser.uid),
                        where('status', '==', 'pending'),
                        orderBy('createdAt', 'desc')
                    );
                }

                const unsubscribe = onSnapshot(
                    skillRequestsQuery,
                    (snapshot) => {
                        const requestsList = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        } as SkillRequest));

                        setSkillRequests(requestsList);
                        setLoading(false);
                    },
                    (error) => {
                        console.error('Error fetching skill requests:', error);
                        setError('Failed to fetch skill requests');
                        setLoading(false);
                    }
                );

                return unsubscribe;
            } catch (error) {
                console.error('Error setting up skill requests listener:', error);
                setError('Failed to setup skill requests listener');
                setLoading(false);
            }
        };

        let unsubscribe: (() => void) | undefined;

        setupListener().then((unsub) => {
            unsubscribe = unsub;
        });

        // Cleanup function
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [currentUser]);

    const createSkillRequest = async (
        name: string,
        categoryId: string,
    ): Promise<void> => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('User not authenticated');
        }

        if (!name.trim()) {
            throw new Error('Skill name is required');
        }
        if (!categoryId) {
            throw new Error('Category is required');
        }

        try {
            await addDoc(collection(db, 'skillRequests'), {
                name: name.trim(),
                categoryId,
                requestedBy: currentUser.uid,
                requestedByEmail: currentUser.email,
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error creating skill request:', error);
            throw new Error('Failed to create skill request');
        }
    };

    const approveSkillRequest = async (requestId: string): Promise<void> => {
        try {
            const request = skillRequests.find(r => r.id === requestId);
            if (!request) {
                throw new Error('Request not found');
            }

            await addDoc(collection(db, 'skills'), {
                name: request.name,
                categoryId: request.categoryId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            await updateDoc(doc(db, 'skillRequests', requestId), {
                status: 'approved',
                adminComment: 'Approved by admin',
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error approving skill request:', error);
            throw new Error('Failed to approve skill request');
        }
    };

    const rejectSkillRequest = async (requestId: string, adminComment?: string): Promise<void> => {
        try {
            await updateDoc(doc(db, 'skillRequests', requestId), {
                status: 'rejected',
                adminComment: adminComment || 'Rejected by admin',
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error rejecting skill request:', error);
            throw new Error('Failed to reject skill request');
        }
    };

    const deleteSkillRequest = async (requestId: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'skillRequests', requestId));
        } catch (error) {
            console.error('Error deleting skill request:', error);
            throw new Error('Failed to delete skill request');
        }
    };

    const getPendingSkillRequests = (): SkillRequest[] => {
        return skillRequests.filter(request => request.status === 'pending');
    };

    const getSkillRequestsByCategory = (categoryId: string): SkillRequest[] => {
        return skillRequests.filter(request => request.categoryId === categoryId);
    };

    return {
        skillRequests,
        loading,
        error,
        createSkillRequest,
        approveSkillRequest,
        rejectSkillRequest,
        deleteSkillRequest,
        getPendingSkillRequests,
        getSkillRequestsByCategory,
    };
};