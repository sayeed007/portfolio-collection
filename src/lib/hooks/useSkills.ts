// src\lib\hooks\useSkills.ts
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
import { useEffect, useState } from 'react';
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