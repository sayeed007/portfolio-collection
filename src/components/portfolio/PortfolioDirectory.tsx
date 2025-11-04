'use client';

import { Card, Input } from '@/components/ui';
import { Select, SelectOption } from '@/components/ui/Select';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { Portfolio } from '@/lib/types';
import {
    ChevronDown,
    Filter,
    Grid,
    List,
    Search,
    Users,
    X
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { PortfolioCard } from './PortfolioCard';
import { getTimestampValue } from '@/lib/utils/formatters';
import { useSkills } from '@/lib/hooks/useSkills';
import { useSkillRequests } from '@/lib/hooks/useSkillCategoryRequests';
import { useSkillCategories } from '@/lib/hooks/useSkillCategories';

interface PortfolioDirectoryProps {
    portfolios: Portfolio[];
    loading?: boolean;
    error?: boolean;
    onPDFExport?: (portfolio: Portfolio) => void;
}

interface FilterState {
    experienceRange: {
        min: number;
        max: number;
    };
    skills: string[];
    nationality: string[];
    designation: string[];
}

type SortField = 'name' | 'experience' | 'updated' | 'visits';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

export const PortfolioDirectory: React.FC<PortfolioDirectoryProps> = ({
    portfolios,
    loading = false,
    error,
    onPDFExport
}) => {

    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortField, setSortField] = useState<SortField>('updated');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [filters, setFilters] = useState<FilterState>({
        experienceRange: { min: 0, max: 50 },
        skills: [],
        nationality: [],
        designation: []
    });

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Get skill data for mapping skillId to skill name
    const { categories } = useSkillCategories();
    const { skills } = useSkills(categories);
    const { skillRequests } = useSkillRequests();
    const allSkills = useMemo(() => [...skillRequests, ...skills].map(skill => ({
        value: skill.id,
        label: skill.name,
    })), [skills, skillRequests]);

    // Sort options for the Select component
    const sortOptions: SelectOption[] = [
        { value: 'updated-desc', label: 'Recently Updated' },
        { value: 'updated-asc', label: 'Oldest First' },
        { value: 'name-asc', label: 'Name A-Z' },
        { value: 'name-desc', label: 'Name Z-A' },
        { value: 'experience-desc', label: 'Most Experience' },
        { value: 'experience-asc', label: 'Least Experience' },
        { value: 'visits-desc', label: 'Most Visited' },
        { value: 'visits-asc', label: 'Least Visited' },
    ];

    // Extract unique values for filter options
    const filterOptions = useMemo(() => {
        const skillNames = new Set<string>();
        const nationalities = new Set<string>();
        const designations = new Set<string>();

        portfolios.forEach(portfolio => {
            if (portfolio.technicalSkills) {
                portfolio.technicalSkills.forEach(skillCategory => {
                    skillCategory.skills.forEach(skill => {
                        // Map skillId to skill name
                        const skillData = allSkills.find(s => s.value === skill.skillId);
                        if (skillData) {
                            skillNames.add(skillData.label);
                        }
                    });
                });
            }
            if (portfolio.nationality) nationalities.add(portfolio.nationality);
            if (portfolio.designation) designations.add(portfolio.designation);
        });

        return {
            skills: Array.from(skillNames).sort(),
            nationalities: Array.from(nationalities).sort(),
            designations: Array.from(designations).sort()
        };
    }, [portfolios, allSkills]);

    // Filter and sort portfolios
    const filteredAndSortedPortfolios = useMemo(() => {
        const filtered = portfolios.filter(portfolio => {
            // Search filter
            if (debouncedSearchTerm) {
                const searchLower = debouncedSearchTerm.toLowerCase();
                const matchesSearch =
                    portfolio.employeeCode.toLowerCase().includes(searchLower) ||
                    portfolio.designation.toLowerCase().includes(searchLower) ||
                    portfolio.summary?.toLowerCase().includes(searchLower) ||
                    portfolio.technicalSkills?.some(skillCategory =>
                        skillCategory.skills.some(skill => {
                            const skillData = allSkills.find(s => s.value === skill.skillId);
                            return skillData?.label.toLowerCase().includes(searchLower);
                        })
                    );

                if (!matchesSearch) return false;
            }

            // Experience range filter
            if (portfolio.yearsOfExperience < filters.experienceRange.min ||
                portfolio.yearsOfExperience > filters.experienceRange.max) {
                return false;
            }

            // Skills filter
            if (filters.skills.length > 0) {
                const portfolioSkillNames = portfolio.technicalSkills?.flatMap(
                    skillCategory => skillCategory.skills.map(skill => {
                        const skillData = allSkills.find(s => s.value === skill.skillId);
                        return skillData?.label;
                    })
                ).filter(Boolean) || [];

                const hasRequiredSkills = filters.skills.some(skillName =>
                    portfolioSkillNames.includes(skillName)
                );
                if (!hasRequiredSkills) return false;
            }

            // Nationality filter
            if (filters.nationality.length > 0 &&
                !filters.nationality.includes(portfolio.nationality || '')) {
                return false;
            }

            // Designation filter
            if (filters.designation.length > 0 &&
                !filters.designation.includes(portfolio.designation)) {
                return false;
            }

            return true;
        });

        // Sort portfolios
        filtered.sort((a, b) => {
            let aValue: string | number, bValue: string | number;

            switch (sortField) {
                case 'name':
                    aValue = a.employeeCode.toLowerCase();
                    bValue = b.employeeCode.toLowerCase();
                    break;
                case 'experience':
                    aValue = a.yearsOfExperience;
                    bValue = b.yearsOfExperience;
                    break;
                case 'updated':
                    aValue = getTimestampValue(a?.updatedAt);
                    bValue = getTimestampValue(b?.updatedAt);
                    break;
                case 'visits':
                    aValue = a.visitCount || 0;
                    bValue = b.visitCount || 0;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [portfolios, debouncedSearchTerm, filters, sortField, sortOrder, allSkills]);

    // Function overload signatures (no implementation)
    function handleFilterChange(
        filterType: 'experienceRange',
        value: { min: number; max: number }
    ): void;
    function handleFilterChange(
        filterType: 'skills' | 'nationality' | 'designation',
        value: string[]
    ): void;
    // Implementation signature
    function handleFilterChange(
        filterType: keyof FilterState,
        value: FilterState[keyof FilterState]
    ): void {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    }

    const clearFilters = () => {
        setFilters({
            experienceRange: { min: 0, max: 50 },
            skills: [],
            nationality: [],
            designation: []
        });
        setSearchTerm('');
    };

    const hasActiveFilters =
        debouncedSearchTerm ||
        filters.experienceRange.min > 0 ||
        filters.experienceRange.max < 50 ||
        filters.skills.length > 0 ||
        filters.nationality.length > 0 ||
        filters.designation.length > 0;

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-6 text-center">
                <p className="text-red-600">Error loading portfolios: {error}</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-6 h-6" />
                        Portfolio Directory
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {filteredAndSortedPortfolios.length} of {portfolios.length} portfolios
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Sort Controls */}
                    <Select
                        value={sortOptions.find(opt => opt.value === `${sortField}-${sortOrder}`)}
                        onChange={(option) => {
                            if (option) {
                                const [field, order] = (option as SelectOption).value.split('-') as [SortField, SortOrder];
                                setSortField(field);
                                setSortOrder(order);
                            }
                        }}
                        options={sortOptions}
                        searchable={false}
                        clearable={false}
                        className="w-52"
                    />
                </div>
            </div>

            {/* Search and Filter Bar */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search by name, designation, skills, or summary..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilters || hasActiveFilters
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        {/* Experience Range */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Years of Experience
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    type="number"
                                    label="Minimum"
                                    min="0"
                                    max="50"
                                    value={filters.experienceRange.min}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        handleFilterChange('experienceRange', {
                                            ...filters.experienceRange,
                                            min: Math.min(value, filters.experienceRange.max)
                                        });
                                    }}
                                />
                                <Input
                                    type="number"
                                    label="Maximum"
                                    min="0"
                                    max="50"
                                    value={filters.experienceRange.max}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 50;
                                        handleFilterChange('experienceRange', {
                                            ...filters.experienceRange,
                                            max: Math.max(value, filters.experienceRange.min)
                                        });
                                    }}
                                />
                            </div>
                            <div className="mt-2 text-xs text-gray-500 text-center">
                                Filtering: {filters.experienceRange.min} - {filters.experienceRange.max} years
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Skills Filter */}
                            <div>
                                <Select
                                    label="Skills"
                                    isMulti
                                    value={filters.skills.map(skill => ({ value: skill, label: skill }))}
                                    onChange={(selectedOptions) => {
                                        const values = selectedOptions
                                            ? (selectedOptions as SelectOption[]).map(opt => opt.value)
                                            : [];
                                        handleFilterChange('skills', values);
                                    }}
                                    options={filterOptions.skills.map(skill => ({ value: skill, label: skill }))}
                                    placeholder="Select skills..."
                                    clearable={true}
                                />
                            </div>

                            {/* Nationality Filter */}
                            <div>
                                <Select
                                    label="Nationality"
                                    isMulti
                                    value={filters.nationality.map(nat => ({ value: nat, label: nat }))}
                                    onChange={(selectedOptions) => {
                                        const values = selectedOptions
                                            ? (selectedOptions as SelectOption[]).map(opt => opt.value)
                                            : [];
                                        handleFilterChange('nationality', values);
                                    }}
                                    options={filterOptions.nationalities.map(nat => ({ value: nat, label: nat }))}
                                    placeholder="Select nationalities..."
                                    clearable={true}
                                />
                            </div>

                            {/* Designation Filter */}
                            <div>
                                <Select
                                    label="Designation"
                                    isMulti
                                    value={filters.designation.map(des => ({ value: des, label: des }))}
                                    onChange={(selectedOptions) => {
                                        const values = selectedOptions
                                            ? (selectedOptions as SelectOption[]).map(opt => opt.value)
                                            : [];
                                        handleFilterChange('designation', values);
                                    }}
                                    options={filterOptions.designations.map(des => ({ value: des, label: des }))}
                                    placeholder="Select designations..."
                                    clearable={true}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Results */}
            {filteredAndSortedPortfolios.length === 0 ? (
                <Card className="p-8 text-center">
                    <Users className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolios found</h3>
                    <p className="text-gray-600 mb-4">
                        Try adjusting your search terms or filters to find more results.
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Clear all filters
                        </button>
                    )}
                </Card>
            ) : (
                <div className={
                    viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-4'
                }>
                    {filteredAndSortedPortfolios.map(portfolio => (
                        <PortfolioCard
                            key={portfolio.userId}
                            portfolio={portfolio}
                            onPDFExport={onPDFExport}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PortfolioDirectory;
