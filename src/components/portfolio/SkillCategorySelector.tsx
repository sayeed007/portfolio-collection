// SkillCategorySelector.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSkillCategories } from '@/lib/hooks/useSkillCategories';
import { Search, Tag } from 'lucide-react';
import { useState } from 'react';

interface SkillCategorySelectorProps {
    onCategorySelect: (categoryId: string) => void;
    onCancel: () => void;
}

export function SkillCategorySelector({ onCategorySelect, onCancel }: SkillCategorySelectorProps) {
    const { categories, loading, error } = useSkillCategories();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading categories...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">Error loading categories: {error}</p>
                <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={onCancel}>
                        Close
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Categories Grid */}
            <div className="max-h-96 overflow-y-auto">
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No categories found matching your search.' : 'No categories available.'}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {filteredCategories.map((category) => (
                            <Button
                                key={category.id}
                                variant="outline"
                                className="h-auto p-4 flex items-center justify-start text-left hover:bg-blue-50 hover:border-blue-300"
                                onClick={() => onCategorySelect(category.id)}
                            >
                                <Tag className="w-4 h-4 mr-2 text-blue-600" />
                                <span className="font-medium">{category.name}</span>
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}