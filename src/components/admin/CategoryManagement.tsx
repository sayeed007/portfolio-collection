// src/components/admin/CategoryManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import {
    fetchSkillCategories,
    addSkillCategory,
    updateSkillCategory,
    deleteSkillCategory
} from '@/lib/redux/slices/skillCategoriesSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface CategoryFormData {
    name: string;
    skills: string[];
}

export const CategoryManagement: React.FC = () => {
    const dispatch = useDispatch();
    const { categories, loading, error } = useSelector((state: RootState) => state.skillCategories);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        skills: []
    });
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        dispatch(fetchSkillCategories() as any);
    }, [dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) return;

        try {
            if (editingCategory) {
                await dispatch(updateSkillCategory({
                    id: editingCategory,
                    updates: formData
                }) as any);
            } else {
                await dispatch(addSkillCategory(formData) as any);
            }

            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const handleDelete = async (categoryId: string) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await dispatch(deleteSkillCategory(categoryId) as any);
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    const handleEdit = (category: any) => {
        setEditingCategory(category.id);
        setFormData({
            name: category.name,
            skills: category.skills || []
        });
        setIsModalOpen(true);
    };

    const addSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData({
                ...formData,
                skills: [...formData.skills, newSkill.trim()]
            });
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(skill => skill !== skillToRemove)
        });
    };

    const resetForm = () => {
        setFormData({ name: '', skills: [] });
        setEditingCategory(null);
        setNewSkill('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    if (loading) return <div>Loading categories...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Skill Categories Management</h2>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                </Button>
            </div>

            <div className="grid gap-4">
                {categories.map((category) => (
                    <Card key={category.id} className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                                {category.skills && category.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {category.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(category)}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(category.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <div className="p-6 w-full max-w-md">
                    <h3 className="text-xl font-semibold mb-4">
                        {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Category Name
                            </label>
                            <Input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Programming Languages"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Skills (Optional)
                            </label>
                            <div className="flex space-x-2 mb-2">
                                <Input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    placeholder="Add a skill"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                />
                                <Button type="button" onClick={addSkill}>
                                    Add
                                </Button>
                            </div>

                            {formData.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="px-2 py-1 bg-gray-100 rounded-md text-sm flex items-center"
                                        >
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(skill)}
                                                className="ml-1 text-red-500 hover:text-red-700"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={handleCloseModal}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                <Save className="w-4 h-4 mr-2" />
                                Save
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};