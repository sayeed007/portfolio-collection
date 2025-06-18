// src\lib\hooks\useSkillCategories.ts
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
    writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface SkillCategory {
    id: string;
    name: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

const POPULAR_CATEGORIES = [
    { name: 'Programming Languages' },
    { name: 'Database Management' },
    { name: 'Frameworks / Library' },
    { name: 'Testing' },
    { name: 'Tools' },
    { name: 'Others' },
];

export const useSkillCategories = () => {
    const [categories, setCategories] = useState<SkillCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const categoriesQuery = query(collection(db, 'skillCategories'), orderBy('name', 'asc'));

        const unsubscribe = onSnapshot(
            categoriesQuery,
            (snapshot) => {
                const categoriesList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as SkillCategory));

                setCategories(categoriesList);
                setLoading(false);

                // Auto-populate if empty
                if (categoriesList.length === 0) {
                    prefillCategories();
                }
            },
            (error) => {
                console.error('Error fetching categories:', error);
                setError('Failed to fetch categories');
                setLoading(false);
            }
        );

        return unsubscribe;
    }, []);

    const prefillCategories = async () => {
        try {
            const batch = writeBatch(db);
            POPULAR_CATEGORIES.forEach(category => {
                const categoryRef = doc(collection(db, 'skillCategories'));
                batch.set(categoryRef, {
                    name: category.name,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            });
            await batch.commit();
        } catch (error) {
            console.error('Error prefilling categories:', error);
            setError('Failed to prefill categories');
        }
    };

    const addCategory = async (name: string): Promise<void> => {
        if (!name.trim()) {
            throw new Error('Category name is required');
        }

        try {
            await addDoc(collection(db, 'skillCategories'), {
                name: name.trim(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error adding category:', error);
            throw new Error('Failed to add category');
        }
    };

    const updateCategory = async (id: string, name: string): Promise<void> => {
        if (!name.trim()) {
            throw new Error('Category name is required');
        }

        try {
            await updateDoc(doc(db, 'skillCategories', id), {
                name: name.trim(),
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error updating category:', error);
            throw new Error('Failed to update category');
        }
    };

    const deleteCategory = async (id: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'skillCategories', id));
        } catch (error) {
            console.error('Error deleting category:', error);
            throw new Error('Failed to delete category');
        }
    };

    const getCategoryById = (id: string): SkillCategory | undefined => {
        return categories.find(category => category.id === id);
    };

    const getCategoryByName = (name: string): SkillCategory | undefined => {
        return categories.find(category => category.name.toLowerCase() === name.toLowerCase());
    };

    return {
        categories,
        loading,
        error,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
        getCategoryByName,
        refetch: () => setLoading(true), // Trigger re-fetch if needed
    };
};



// src\lib\hooks\useSkills.ts
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
    writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { SkillCategory } from './useSkillCategories';

export interface Skill {
    id: string;
    name: string;
    categoryId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

const POPULAR_SKILLS = [
    { name: 'JavaScript(ES6)', categoryName: 'Programming Languages' },
    { name: 'TypeScript', categoryName: 'Programming Languages' },
    { name: 'Python', categoryName: 'Programming Languages' },
    { name: 'Node', categoryName: 'Programming Languages' },
    { name: 'MongoDB', categoryName: 'Database Management' },
    { name: 'SQLite3', categoryName: 'Database Management' },
    { name: 'jQuery', categoryName: 'Frameworks / Library' },
    { name: 'React-17/18', categoryName: 'Frameworks / Library' },
    { name: 'Next-13/14', categoryName: 'Frameworks / Library' },
    { name: 'React Native', categoryName: 'Frameworks / Library' },
    { name: 'Angular', categoryName: 'Frameworks / Library' },
    { name: 'Ionic', categoryName: 'Frameworks / Library' },
    { name: 'Cordova', categoryName: 'Frameworks / Library' },
    { name: 'Vue3', categoryName: 'Frameworks / Library' },
    { name: 'ExpressJS', categoryName: 'Frameworks / Library' },
    { name: 'CSS3', categoryName: 'Frameworks / Library' },
    { name: 'Bootstrap-3/4/5', categoryName: 'Frameworks / Library' },
    { name: 'Tailwind', categoryName: 'Frameworks / Library' },
    { name: 'SCSS', categoryName: 'Frameworks / Library' },
    { name: 'GIT', categoryName: 'Tools' },
    { name: 'VS Code', categoryName: 'Tools' },
    { name: 'Android Studio', categoryName: 'Tools' },
    { name: 'Object-Oriented Programming (OOP)', categoryName: 'Others' },
    { name: 'Software Architecture', categoryName: 'Others' },
    { name: 'Agile Development', categoryName: 'Others' },
    { name: 'API Development & Integration', categoryName: 'Others' },
    { name: 'Enterprise Resource Planning (ERP)', categoryName: 'Others' },
    { name: 'Agile/Scrum Methodologies', categoryName: 'Others' },
    { name: 'Problem Solving and Analytical Skills', categoryName: 'Others' },
];

export const useSkills = (categories: SkillCategory[] = []) => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const skillsQuery = query(collection(db, 'skills'), orderBy('name', 'asc'));

        const unsubscribe = onSnapshot(
            skillsQuery,
            (snapshot) => {
                const skillsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Skill));

                setSkills(skillsList);
                setLoading(false);

                // Auto-populate if empty and categories are available
                if (skillsList.length === 0 && categories.length > 0) {
                    prefillSkills(categories);
                }
            },
            (error) => {
                console.error('Error fetching skills:', error);
                setError('Failed to fetch skills');
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [categories.length]);

    const prefillSkills = async (availableCategories: SkillCategory[]) => {
        try {
            const batch = writeBatch(db);
            POPULAR_SKILLS.forEach(skill => {
                const category = availableCategories.find(c => c.name === skill.categoryName);
                if (category) {
                    const skillRef = doc(collection(db, 'skills'));
                    batch.set(skillRef, {
                        name: skill.name,
                        categoryId: category.id,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    });
                }
            });
            await batch.commit();
        } catch (error) {
            console.error('Error prefilling skills:', error);
            setError('Failed to prefill skills');
        }
    };

    const addSkill = async (name: string, categoryId: string): Promise<void> => {
        if (!name.trim()) {
            throw new Error('Skill name is required');
        }
        if (!categoryId) {
            throw new Error('Category is required');
        }

        try {
            await addDoc(collection(db, 'skills'), {
                name: name.trim(),
                categoryId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error adding skill:', error);
            throw new Error('Failed to add skill');
        }
    };

    const updateSkill = async (id: string, name: string, categoryId: string): Promise<void> => {
        if (!name.trim()) {
            throw new Error('Skill name is required');
        }
        if (!categoryId) {
            throw new Error('Category is required');
        }

        try {
            await updateDoc(doc(db, 'skills', id), {
                name: name.trim(),
                categoryId,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error updating skill:', error);
            throw new Error('Failed to update skill');
        }
    };

    const deleteSkill = async (id: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'skills', id));
        } catch (error) {
            console.error('Error deleting skill:', error);
            throw new Error('Failed to delete skill');
        }
    };

    const getSkillById = (id: string): Skill | undefined => {
        return skills.find(skill => skill.id === id);
    };

    const getSkillsByCategory = (categoryId: string): Skill[] => {
        return skills.filter(skill => skill.categoryId === categoryId);
    };

    const getSkillByName = (name: string): Skill | undefined => {
        return skills.find(skill => skill.name.toLowerCase() === name.toLowerCase());
    };

    return {
        skills,
        loading,
        error,
        addSkill,
        updateSkill,
        deleteSkill,
        getSkillById,
        getSkillsByCategory,
        getSkillByName,
        refetch: () => setLoading(true), // Trigger re-fetch if needed
    };
};


// src/lib/hooks/useCategoryRequests.ts
import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import {
    submitCategoryRequest,
    fetchCategoryRequests,
    updateRequestStatus,
} from "../redux/slices/categoryRequestsSlice";
import { CategoryRequest } from "../types";

export const useCategoryRequests = () => {
    const dispatch = useDispatch<AppDispatch>();
    const categoryRequestsState = useSelector(
        (state: RootState) => state.categoryRequests
    );
    const { user } = useSelector((state: RootState) => state.auth);

    // Submit new category request
    const submitRequest = useCallback(
        (requestData: Omit<CategoryRequest, "id" | "createdAt" | "userId">) => {
            if (user?.uid) {
                return dispatch(
                    submitCategoryRequest({ ...requestData, userId: user.uid })
                );
            }
            return Promise.reject(new Error("User not authenticated"));
        },
        [dispatch, user?.uid]
    );

    // Fetch all requests (admin only)
    const fetchRequests = useCallback(() => {
        return dispatch(fetchCategoryRequests());
    }, [dispatch]);

    // Update request status (admin only)
    const updateStatus = useCallback(
        (
            requestId: string,
            status: "Approved" | "Rejected",
            adminComment?: string
        ) => {
            return dispatch(updateRequestStatus({ requestId, status, adminComment }));
        },
        [dispatch]
    );

    useEffect(() => {
        // Fetch requests if user is admin
        if (user?.isAdmin && categoryRequestsState.requests.length === 0) {
            fetchRequests();
        }
    }, [user?.isAdmin, categoryRequestsState.requests.length, fetchRequests]);

    return {
        ...categoryRequestsState,
        submitRequest,
        fetchRequests,
        updateStatus,
    };
};


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
        requestedBy: string,
        requestedByEmail: string
    ): Promise<void> => {
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
                requestedBy: currentUser.uid, // Use current user's UID
                requestedByEmail: currentUser.email || requestedByEmail, // Use current user's email
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