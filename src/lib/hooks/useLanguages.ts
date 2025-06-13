// hooks/useLanguages.ts
import {
    collection,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    where
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
// import { db } from '@/lib/firebase';

export interface Language {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface LanguageOption {
    value: string;
    label: string;
    code: string;
}

export const useLanguages = (activeOnly: boolean = true) => {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [languageOptions, setLanguageOptions] = useState<LanguageOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let q;

        if (activeOnly) {
            q = query(
                collection(db, 'languages'),
                where('isActive', '==', true),
                orderBy('name', 'asc')
            );
        } else {
            q = query(
                collection(db, 'languages'),
                orderBy('name', 'asc')
            );
        }

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const languagesList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Language[];

                setLanguages(languagesList);

                // Convert to options format for react-select
                const options = languagesList.map(lang => ({
                    value: lang.name,
                    label: lang.name,
                    code: lang.code
                }));

                setLanguageOptions(options);

                setLoading(false);
                setError(null);
            },
            (error) => {
                console.error('Error fetching languages:', error);
                setError('Failed to fetch languages');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [activeOnly]);

    return { languages, languageOptions, loading, error };
};