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