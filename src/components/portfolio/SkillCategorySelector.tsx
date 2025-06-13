// First, update the SkillCategorySelector component to support the expected props
'use client';

import { Button, Card, Input, Modal } from '@/components/ui';
import { useCategoryRequests } from '@/lib/hooks/useCategoryRequests';
import { useSkillCategories } from '@/lib/hooks/useSkillCategories';
import { TechnicalSkill } from '@/lib/redux/slices/portfolioSlice';
import { Edit2, Plus, Send, Star, Trash2, Users, X, Zap } from 'lucide-react';
import React, { useState } from 'react';

interface SkillCategorySelectorProps {
    // Support both usage patterns
    selectedSkills?: TechnicalSkill[];
    onChange?: (skills: TechnicalSkill[]) => void;
    onCategorySelect?: (category: string) => void;
    onCancel?: () => void;
    disabled?: boolean;
}

export const SkillCategorySelector: React.FC<SkillCategorySelectorProps> = ({
    selectedSkills,
    onChange,
    onCategorySelect,
    onCancel,
    disabled = false
}) => {
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [suggestedSkills, setSuggestedSkills] = useState<string[]>(['']);
    const [editingCategory, setEditingCategory] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('');

    const { categories } = useSkillCategories();
    const { submitRequest, loading: requestLoading } = useCategoryRequests();

    // If this is being used as a category selector modal (onCategorySelect exists)
    const isModalMode = !!onCategorySelect;

    // Handle category selection in modal mode
    const handleCategorySelection = (categoryName: string) => {
        if (onCategorySelect) {
            onCategorySelect(categoryName);
        }
    };

    // Add a new skill category to the selected skills (full form mode)
    const addSkillCategory = () => {
        if (!onChange || !selectedSkills) return;

        const newCategory: TechnicalSkill = {
            category: '',
            skills: [''],
            proficiency: 'Beginner'
        };
        onChange([...selectedSkills, newCategory]);
        setEditingCategory(selectedSkills.length);
    };

    // Remove a skill category
    const removeSkillCategory = (index: number) => {
        if (!onChange || !selectedSkills) return;

        const updatedSkills = selectedSkills.filter((_, i) => i !== index);
        onChange(updatedSkills);
        if (editingCategory === index) {
            setEditingCategory(null);
        }
    };

    // Update skill category
    const updateSkillCategory = (index: number, updates: Partial<TechnicalSkill>) => {
        if (!onChange || !selectedSkills) return;

        const updatedSkills = selectedSkills.map((skill, i) =>
            i === index ? { ...skill, ...updates } : skill
        );
        onChange(updatedSkills);
    };

    // Add a skill to a category
    const addSkillToCategory = (categoryIndex: number) => {
        if (!onChange || !selectedSkills) return;

        const updatedSkills = [...selectedSkills];
        updatedSkills[categoryIndex].skills.push('');
        onChange(updatedSkills);
    };

    // Remove a skill from a category
    const removeSkillFromCategory = (categoryIndex: number, skillIndex: number) => {
        if (!onChange || !selectedSkills) return;

        const updatedSkills = [...selectedSkills];
        updatedSkills[categoryIndex].skills = updatedSkills[categoryIndex].skills.filter(
            (_, i) => i !== skillIndex
        );
        onChange(updatedSkills);
    };

    // Update a specific skill in a category
    const updateSkillInCategory = (categoryIndex: number, skillIndex: number, value: string) => {
        if (!onChange || !selectedSkills) return;

        const updatedSkills = [...selectedSkills];
        updatedSkills[categoryIndex].skills[skillIndex] = value;
        onChange(updatedSkills);
    };

    // Handle category request submission
    const handleRequestSubmit = async () => {
        if (!newCategoryName.trim()) return;

        const filteredSkills = suggestedSkills.filter(skill => skill?.trim());

        try {
            await submitRequest({
                categoryName: newCategoryName,
                suggestedSkills: filteredSkills,
                status: 'Pending'
            });

            // Reset form only after successful submission
            setNewCategoryName('');
            setSuggestedSkills(['']);
            setShowRequestModal(false);
        } catch (error) {
            console.error('Failed to submit category request:', error);
        }
    };

    // Add suggested skill input
    const addSuggestedSkill = () => {
        setSuggestedSkills([...suggestedSkills, '']);
    };

    // Remove suggested skill input
    const removeSuggestedSkill = (index: number) => {
        setSuggestedSkills(suggestedSkills.filter((_, i) => i !== index));
    };

    // Update suggested skill
    const updateSuggestedSkill = (index: number, value: string) => {
        const updated = [...suggestedSkills];
        updated[index] = value;
        setSuggestedSkills(updated);
    };

    // Render modal mode (for category selection)
    if (isModalMode) {
        return (
            <div className="space-y-6 p-6">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Select Skill Category
                    </h3>
                    <p className="text-gray-600">
                        Choose a category or request a new one
                    </p>
                </div>

                {/* Available Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                    {categories?.map(category => (
                        <Button
                            key={category.categoryId}
                            type="button"
                            onClick={() => handleCategorySelection(category.name)}
                            className="p-4 h-auto text-left bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200"
                        >
                            <div className="font-medium text-gray-900">
                                {category.name}
                            </div>
                            {/* {category.description && (
                                <div className="text-sm text-gray-600 mt-1">
                                    {category.description}
                                </div>
                            )} */}
                        </Button>
                    ))}
                </div>

                {/* Custom Category Input */}
                <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Or enter a custom category
                    </label>
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            placeholder="Enter custom category name"
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            onClick={() => handleCategorySelection(selectedCategory)}
                            disabled={!selectedCategory.trim()}
                            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                        >
                            Use Custom
                        </Button>
                    </div>
                </div>

                {/* Request New Category */}
                <div className="border-t pt-4">
                    <Button
                        type="button"
                        onClick={() => setShowRequestModal(true)}
                        className="w-full h-12 bg-purple-100 text-purple-700 hover:bg-purple-200 border-2 border-purple-300 rounded-xl"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Request New Category
                    </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 h-12 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl"
                    >
                        Cancel
                    </Button>
                </div>

                {/* Request New Category Modal */}
                <Modal
                    isOpen={showRequestModal}
                    onClose={() => setShowRequestModal(false)}
                    title=""
                    size="2xl"
                >
                    <div className="p-8">
                        {/* Modal Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full mb-4">
                                <Users className="w-4 h-4 text-purple-600 mr-2" />
                                <span className="text-sm font-medium text-purple-700">Community Request</span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">
                                Request New
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {" "}Category
                                </span>
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                Help expand our platform by suggesting a new skill category
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Category Name *
                                </label>
                                <Input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="e.g., Cloud Computing, Mobile Development, DevOps"
                                    required
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 backdrop-blur text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Suggested Skills (Optional)
                                </label>
                                <div className="space-y-3">
                                    {suggestedSkills.map((skill, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <Input
                                                type="text"
                                                value={skill}
                                                onChange={(e) => updateSuggestedSkill(index, e.target.value)}
                                                placeholder="Enter skill name"
                                                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur text-gray-900"
                                            />
                                            {suggestedSkills.length > 1 && (
                                                <Button
                                                    type="button"
                                                    onClick={() => removeSuggestedSkill(index)}
                                                    className="w-10 h-10 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 p-0 flex items-center justify-center"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        onClick={addSuggestedSkill}
                                        className="w-full h-12 bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-2 border-dashed border-gray-300 hover:border-blue-300 rounded-xl transition-all duration-300"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Another Skill
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <Star className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900 mb-1">
                                            Community Contribution
                                        </p>
                                        <p className="text-sm text-blue-800 leading-relaxed">
                                            Your request will be reviewed by our team. Once approved, this category will be available for all users.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={() => setShowRequestModal(false)}
                                    disabled={requestLoading}
                                    className="flex-1 h-12 bg-white text-gray-600 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl transition-all duration-300"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleRequestSubmit}
                                    disabled={requestLoading || !newCategoryName.trim()}
                                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    {requestLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Submit Request
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }

    // Render full form mode (original functionality)
    return (
        <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 rounded-3xl border-0 shadow-xl">
            {/* Header Section */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-purple-200 mb-6">
                    <Zap className="w-4 h-4 text-purple-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Showcase Your Expertise</span>
                </div>

                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    Technical
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {" "}Skills
                    </span>
                </h3>

                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Organize your technical expertise into categories to showcase your professional capabilities
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        type="button"
                        onClick={() => setShowRequestModal(true)}
                        disabled={disabled}
                        className="h-12 px-6 text-base bg-white/80 backdrop-blur text-purple-600 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Request New Category
                    </Button>
                    <Button
                        type="button"
                        onClick={addSkillCategory}
                        disabled={disabled}
                        className="h-12 px-6 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Skill Category
                    </Button>
                </div>
            </div>

            {/* Selected Skills */}
            <div className="space-y-6">
                {selectedSkills?.map((skillCategory, categoryIndex) => (
                    <Card
                        key={categoryIndex}
                        className="p-8 border-0 bg-white/80 backdrop-blur hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl group"
                    >
                        <div className="flex items-start gap-6">
                            <div className="flex-1 space-y-6">
                                {/* Category Selection */}
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Skill Category
                                        </label>
                                        <select
                                            value={skillCategory.category}
                                            onChange={(e) => updateSkillCategory(categoryIndex, { category: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 backdrop-blur transition-all duration-200 text-gray-900 font-medium"
                                            disabled={disabled}
                                        >
                                            <option value="">Select a category...</option>
                                            {categories?.map(category => (
                                                <option key={category.categoryId} value={category.name}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Proficiency
                                        </label>
                                        <select
                                            value={skillCategory.proficiency}
                                            onChange={(e) => updateSkillCategory(categoryIndex, { proficiency: e.target.value as TechnicalSkill['proficiency'] })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 backdrop-blur transition-all duration-200 text-gray-900 font-medium"
                                            disabled={disabled}
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                            <option value="Expert">Expert</option>
                                        </select>
                                    </div>
                                    <div className="pt-7">
                                        <Button
                                            type="button"
                                            onClick={() => setEditingCategory(
                                                editingCategory === categoryIndex ? null : categoryIndex
                                            )}
                                            className="w-12 h-12 bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-300 p-0 flex items-center justify-center"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Skills in this category
                                    </label>
                                    <div className="space-y-3">
                                        {skillCategory.skills.map((skill, skillIndex) => (
                                            <div key={skillIndex} className="flex items-center gap-3 group/skill">
                                                <div className="flex-1">
                                                    <Input
                                                        type="text"
                                                        value={skill}
                                                        onChange={(e) => updateSkillInCategory(categoryIndex, skillIndex, e.target.value)}
                                                        placeholder="Enter skill name (e.g., React, Node.js, Python)"
                                                        disabled={disabled}
                                                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur transition-all duration-200 text-gray-900"
                                                    />
                                                </div>
                                                {skillCategory.skills.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeSkillFromCategory(categoryIndex, skillIndex)}
                                                        disabled={disabled}
                                                        className="w-10 h-10 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 p-0 flex items-center justify-center opacity-0 group-hover/skill:opacity-100"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            onClick={() => addSkillToCategory(categoryIndex)}
                                            disabled={disabled}
                                            className="w-full h-12 bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-2 border-dashed border-gray-300 hover:border-blue-300 rounded-xl transition-all duration-300"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Another Skill
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Remove Category Button */}
                            <div className="pt-2">
                                <Button
                                    type="button"
                                    onClick={() => removeSkillCategory(categoryIndex)}
                                    disabled={disabled}
                                    className="w-12 h-12 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}

                {/* Empty State */}
                {selectedSkills?.length === 0 && (
                    <Card className="p-12 text-center bg-white/60 backdrop-blur rounded-2xl border-2 border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Star className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">No Skills Added Yet</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Start building your professional profile by adding your technical skills and expertise
                        </p>
                        <Button
                            type="button"
                            onClick={addSkillCategory}
                            disabled={disabled}
                            className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Category
                        </Button>
                    </Card>
                )}
            </div>

            {/* Request New Category Modal */}
            <Modal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
                title=""
                size="2xl"
            >
                <div className="p-8">
                    {/* Modal Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full mb-4">
                            <Users className="w-4 h-4 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-purple-700">Community Request</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            Request New
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {" "}Category
                            </span>
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Help expand our platform by suggesting a new skill category for the community
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Category Name *
                            </label>
                            <Input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="e.g., Cloud Computing, Mobile Development, DevOps"
                                required
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 backdrop-blur text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Suggested Skills (Optional)
                            </label>
                            <div className="space-y-3">
                                {suggestedSkills.map((skill, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <Input
                                            type="text"
                                            value={skill}
                                            onChange={(e) => updateSuggestedSkill(index, e.target.value)}
                                            placeholder="Enter skill name"
                                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur text-gray-900"
                                        />
                                        {suggestedSkills.length > 1 && (
                                            <Button
                                                type="button"
                                                onClick={() => removeSuggestedSkill(index)}
                                                className="w-10 h-10 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 p-0 flex items-center justify-center"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    onClick={addSuggestedSkill}
                                    className="w-full h-12 bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-2 border-dashed border-gray-300 hover:border-blue-300 rounded-xl transition-all duration-300"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Another Skill
                                </Button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <Star className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-blue-900 mb-1">
                                        Community Contribution
                                    </p>
                                    <p className="text-sm text-blue-800 leading-relaxed">
                                        Your request will be reviewed by our team. Once approved, this category will be available for all users to help build their professional portfolios.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button
                                type="button"
                                onClick={() => setShowRequestModal(false)}
                                disabled={requestLoading}
                                className="flex-1 h-12 bg-white text-gray-600 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl transition-all duration-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleRequestSubmit}
                                disabled={requestLoading || !newCategoryName.trim()}
                                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                {requestLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Submit Request
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SkillCategorySelector;

















// 'use client';

// import { Button, Card, Input, Modal } from '@/components/ui';
// import { useCategoryRequests } from '@/lib/hooks/useCategoryRequests';
// import { useSkillCategories } from '@/lib/hooks/useSkillCategories';
// import { TechnicalSkill } from '@/lib/redux/slices/portfolioSlice';
// import { Edit2, Plus, Send, Star, Trash2, Users, X, Zap } from 'lucide-react';
// import React, { useState } from 'react';

// interface SkillCategorySelectorProps {
//     selectedSkills: TechnicalSkill[];
//     onChange: (skills: TechnicalSkill[]) => void;
//     disabled?: boolean;
// }

// export const SkillCategorySelector: React.FC<SkillCategorySelectorProps> = ({
//     selectedSkills,
//     onChange,
//     disabled = false
// }) => {
//     const [showRequestModal, setShowRequestModal] = useState(false);
//     const [newCategoryName, setNewCategoryName] = useState('');
//     const [suggestedSkills, setSuggestedSkills] = useState<string[]>(['']);
//     const [editingCategory, setEditingCategory] = useState<number | null>(null);

//     const { categories } = useSkillCategories();
//     const { submitRequest, loading: requestLoading } = useCategoryRequests();

//     // Add a new skill category to the selected skills
//     const addSkillCategory = () => {
//         const newCategory: TechnicalSkill = {
//             category: '',
//             skills: [''],
//             proficiency: 'Beginner'
//         };
//         onChange([...selectedSkills, newCategory]);
//         setEditingCategory(selectedSkills.length);
//     };

//     // Remove a skill category
//     const removeSkillCategory = (index: number) => {
//         const updatedSkills = selectedSkills.filter((_, i) => i !== index);
//         onChange(updatedSkills);
//         if (editingCategory === index) {
//             setEditingCategory(null);
//         }
//     };

//     // Update skill category
//     const updateSkillCategory = (index: number, updates: Partial<TechnicalSkill>) => {
//         const updatedSkills = selectedSkills.map((skill, i) =>
//             i === index ? { ...skill, ...updates } : skill
//         );
//         onChange(updatedSkills);
//     };

//     // Add a skill to a category
//     const addSkillToCategory = (categoryIndex: number) => {
//         const updatedSkills = [...selectedSkills];
//         updatedSkills[categoryIndex].skills.push('');
//         onChange(updatedSkills);
//     };

//     // Remove a skill from a category
//     const removeSkillFromCategory = (categoryIndex: number, skillIndex: number) => {
//         const updatedSkills = [...selectedSkills];
//         updatedSkills[categoryIndex].skills = updatedSkills[categoryIndex].skills.filter(
//             (_, i) => i !== skillIndex
//         );
//         onChange(updatedSkills);
//     };

//     // Update a specific skill in a category
//     const updateSkillInCategory = (categoryIndex: number, skillIndex: number, value: string) => {
//         const updatedSkills = [...selectedSkills];
//         updatedSkills[categoryIndex].skills[skillIndex] = value;
//         onChange(updatedSkills);
//     };

//     // Handle category request submission
//     const handleRequestSubmit = async () => {
//         if (!newCategoryName.trim()) return;

//         const filteredSkills = suggestedSkills.filter(skill => skill?.trim());

//         try {
//             await submitRequest({
//                 categoryName: newCategoryName,
//                 suggestedSkills: filteredSkills,
//                 status: 'Pending'
//             });

//             // Reset form only after successful submission
//             setNewCategoryName('');
//             setSuggestedSkills(['']);
//             setShowRequestModal(false);
//         } catch (error) {
//             console.error('Failed to submit category request:', error);
//             // Optionally show error message to user
//             // You might want to add error handling UI here
//         }
//     };

//     // Add suggested skill input
//     const addSuggestedSkill = () => {
//         setSuggestedSkills([...suggestedSkills, '']);
//     };

//     // Remove suggested skill input
//     const removeSuggestedSkill = (index: number) => {
//         setSuggestedSkills(suggestedSkills.filter((_, i) => i !== index));
//     };

//     // Update suggested skill
//     const updateSuggestedSkill = (index: number, value: string) => {
//         const updated = [...suggestedSkills];
//         updated[index] = value;
//         setSuggestedSkills(updated);
//     };

//     return (
//         <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 rounded-3xl border-0 shadow-xl">
//             {/* Header Section */}
//             <div className="text-center mb-8">
//                 <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-purple-200 mb-6">
//                     <Zap className="w-4 h-4 text-purple-500 mr-2" />
//                     <span className="text-sm font-medium text-gray-700">Showcase Your Expertise</span>
//                 </div>

//                 <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
//                     Technical
//                     <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                         {" "}Skills
//                     </span>
//                 </h3>

//                 <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
//                     Organize your technical expertise into categories to showcase your professional capabilities
//                 </p>

//                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                     <Button
//                         type="button"
//                         onClick={() => setShowRequestModal(true)}
//                         disabled={disabled}
//                         className="h-12 px-6 text-base bg-white/80 backdrop-blur text-purple-600 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
//                     >
//                         <Send className="w-4 h-4 mr-2" />
//                         Request New Category
//                     </Button>
//                     <Button
//                         type="button"
//                         onClick={addSkillCategory}
//                         disabled={disabled}
//                         className="h-12 px-6 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
//                     >
//                         <Plus className="w-4 h-4 mr-2" />
//                         Add Skill Category
//                     </Button>
//                 </div>
//             </div>

//             {/* Selected Skills */}
//             <div className="space-y-6">
//                 {selectedSkills?.map((skillCategory, categoryIndex) => (
//                     <Card
//                         key={categoryIndex}
//                         className="p-8 border-0 bg-white/80 backdrop-blur hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl group"
//                     >
//                         <div className="flex items-start gap-6">
//                             <div className="flex-1 space-y-6">
//                                 {/* Category Selection */}
//                                 <div className="flex items-center gap-4">
//                                     <div className="flex-1">
//                                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                             Skill Category
//                                         </label>
//                                         <select
//                                             value={skillCategory.category}
//                                             onChange={(e) => updateSkillCategory(categoryIndex, { category: e.target.value })}
//                                             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 backdrop-blur transition-all duration-200 text-gray-900 font-medium"
//                                             disabled={disabled}
//                                         >
//                                             <option value="">Select a category...</option>
//                                             {categories?.map(category => (
//                                                 <option key={category.categoryId} value={category.name}>
//                                                     {category.name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                     <div className="flex-1">
//                                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                             Proficiency
//                                         </label>
//                                         <select
//                                             value={skillCategory.proficiency}
//                                             onChange={(e) => updateSkillCategory(categoryIndex, { proficiency: e.target.value as TechnicalSkill['proficiency'] })}
//                                             className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 backdrop-blur transition-all duration-200 text-gray-900 font-medium"
//                                             disabled={disabled}
//                                         >
//                                             <option value="Beginner">Beginner</option>
//                                             <option value="Intermediate">Intermediate</option>
//                                             <option value="Advanced">Advanced</option>
//                                             <option value="Expert">Expert</option>
//                                         </select>
//                                     </div>
//                                     <div className="pt-7">
//                                         <Button
//                                             type="button"
//                                             onClick={() => setEditingCategory(
//                                                 editingCategory === categoryIndex ? null : categoryIndex
//                                             )}
//                                             className="w-12 h-12 bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-300 p-0 flex items-center justify-center"
//                                         >
//                                             <Edit2 className="w-4 h-4" />
//                                         </Button>
//                                     </div>
//                                 </div>

//                                 {/* Skills */}
//                                 <div className="space-y-4">
//                                     <label className="block text-sm font-semibold text-gray-700">
//                                         Skills in this category
//                                     </label>
//                                     <div className="space-y-3">
//                                         {skillCategory.skills.map((skill, skillIndex) => (
//                                             <div key={skillIndex} className="flex items-center gap-3 group/skill">
//                                                 <div className="flex-1">
//                                                     <Input
//                                                         type="text"
//                                                         value={skill}
//                                                         onChange={(e) => updateSkillInCategory(categoryIndex, skillIndex, e.target.value)}
//                                                         placeholder="Enter skill name (e.g., React, Node.js, Python)"
//                                                         disabled={disabled}
//                                                         className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur transition-all duration-200 text-gray-900"
//                                                     />
//                                                 </div>
//                                                 {skillCategory.skills.length > 1 && (
//                                                     <Button
//                                                         type="button"
//                                                         onClick={() => removeSkillFromCategory(categoryIndex, skillIndex)}
//                                                         disabled={disabled}
//                                                         className="w-10 h-10 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 p-0 flex items-center justify-center opacity-0 group-hover/skill:opacity-100"
//                                                     >
//                                                         <X className="w-4 h-4" />
//                                                     </Button>
//                                                 )}
//                                             </div>
//                                         ))}

//                                         <Button
//                                             type="button"
//                                             onClick={() => addSkillToCategory(categoryIndex)}
//                                             disabled={disabled}
//                                             className="w-full h-12 bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-2 border-dashed border-gray-300 hover:border-blue-300 rounded-xl transition-all duration-300"
//                                         >
//                                             <Plus className="w-4 h-4 mr-2" />
//                                             Add Another Skill
//                                         </Button>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Remove Category Button */}
//                             <div className="pt-2">
//                                 <Button
//                                     type="button"
//                                     onClick={() => removeSkillCategory(categoryIndex)}
//                                     disabled={disabled}
//                                     className="w-12 h-12 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
//                                 >
//                                     <Trash2 className="w-4 h-4" />
//                                 </Button>
//                             </div>
//                         </div>
//                     </Card>
//                 ))}

//                 {/* Empty State */}
//                 {selectedSkills?.length === 0 && (
//                     <Card className="p-12 text-center bg-white/60 backdrop-blur rounded-2xl border-2 border-dashed border-gray-300">
//                         <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
//                             <Star className="w-8 h-8 text-purple-600" />
//                         </div>
//                         <h3 className="text-xl font-bold text-gray-900 mb-3">No Skills Added Yet</h3>
//                         <p className="text-gray-600 mb-6 max-w-md mx-auto">
//                             Start building your professional profile by adding your technical skills and expertise
//                         </p>
//                         <Button
//                             type="button"
//                             onClick={addSkillCategory}
//                             disabled={disabled}
//                             className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
//                         >
//                             <Plus className="w-4 h-4 mr-2" />
//                             Add Your First Category
//                         </Button>
//                     </Card>
//                 )}
//             </div>

//             {/* Request New Category Modal */}
//             <Modal
//                 isOpen={showRequestModal}
//                 onClose={() => setShowRequestModal(false)}
//                 title=""
//                 size="2xl"
//             >
//                 <div className="p-8">
//                     {/* Modal Header */}
//                     <div className="text-center mb-8">
//                         <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full mb-4">
//                             <Users className="w-4 h-4 text-purple-600 mr-2" />
//                             <span className="text-sm font-medium text-purple-700">Community Request</span>
//                         </div>
//                         <h2 className="text-3xl font-bold text-gray-900 mb-3">
//                             Request New
//                             <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                                 {" "}Category
//                             </span>
//                         </h2>
//                         <p className="text-gray-600 leading-relaxed">
//                             Help expand our platform by suggesting a new skill category for the community
//                         </p>
//                     </div>

//                     <div className="space-y-6">
//                         <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-3">
//                                 Category Name *
//                             </label>
//                             <Input
//                                 type="text"
//                                 value={newCategoryName}
//                                 onChange={(e) => setNewCategoryName(e.target.value)}
//                                 placeholder="e.g., Cloud Computing, Mobile Development, DevOps"
//                                 required
//                                 className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/90 backdrop-blur text-gray-900"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-3">
//                                 Suggested Skills (Optional)
//                             </label>
//                             <div className="space-y-3">
//                                 {suggestedSkills.map((skill, index) => (
//                                     <div key={index} className="flex items-center gap-3">
//                                         <Input
//                                             type="text"
//                                             value={skill}
//                                             onChange={(e) => updateSuggestedSkill(index, e.target.value)}
//                                             placeholder="Enter skill name"
//                                             className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur text-gray-900"
//                                         />
//                                         {suggestedSkills.length > 1 && (
//                                             <Button
//                                                 type="button"
//                                                 onClick={() => removeSuggestedSkill(index)}
//                                                 className="w-10 h-10 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 p-0 flex items-center justify-center"
//                                             >
//                                                 <X className="w-4 h-4" />
//                                             </Button>
//                                         )}
//                                     </div>
//                                 ))}

//                                 <Button
//                                     type="button"
//                                     onClick={addSuggestedSkill}
//                                     className="w-full h-12 bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border-2 border-dashed border-gray-300 hover:border-blue-300 rounded-xl transition-all duration-300"
//                                 >
//                                     <Plus className="w-4 h-4 mr-2" />
//                                     Add Another Skill
//                                 </Button>
//                             </div>
//                         </div>

//                         <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
//                             <div className="flex items-start gap-3">
//                                 <Star className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                                 <div>
//                                     <p className="text-sm font-semibold text-blue-900 mb-1">
//                                         Community Contribution
//                                     </p>
//                                     <p className="text-sm text-blue-800 leading-relaxed">
//                                         Your request will be reviewed by our team. Once approved, this category will be available for all users to help build their professional portfolios.
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="flex flex-col sm:flex-row gap-3 pt-4">
//                             <Button
//                                 type="button"
//                                 onClick={() => setShowRequestModal(false)}
//                                 disabled={requestLoading}
//                                 className="flex-1 h-12 bg-white text-gray-600 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl transition-all duration-300"
//                             >
//                                 Cancel
//                             </Button>
//                             <Button
//                                 type="button"
//                                 onClick={handleRequestSubmit}
//                                 disabled={requestLoading || !newCategoryName.trim()}
//                                 className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
//                             >
//                                 {requestLoading ? (
//                                     <>
//                                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                                         Submitting...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Send className="w-4 h-4 mr-2" />
//                                         Submit Request
//                                     </>
//                                 )}
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             </Modal>
//         </div>
//     );
// };

// export default SkillCategorySelector;