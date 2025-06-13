// src/components/ui/Select.tsx
'use client';

import { forwardRef, useEffect, useId, useState } from 'react';
import ReactSelect, {
    Props as ReactSelectProps,
    StylesConfig,
    components,
    DropdownIndicatorProps,
    ClearIndicatorProps
} from 'react-select';
import { ChevronDown, X } from 'lucide-react';

export interface SelectOption {
    value: string;
    label: string;
    isDisabled?: boolean;
}

interface SelectProps extends Omit<ReactSelectProps<SelectOption>, 'options'> {
    label?: string;
    error?: string;
    required?: boolean;
    options: SelectOption[];
    loading?: boolean;
    searchable?: boolean;
    clearable?: boolean;
    placeholder?: string;
    className?: string;
}

// Custom dropdown indicator
const DropdownIndicator = (props: DropdownIndicatorProps<SelectOption>) => {
    return (
        <components.DropdownIndicator {...props}>
            <ChevronDown className="w-4 h-4 text-gray-400" />
        </components.DropdownIndicator>
    );
};

// Custom clear indicator
const ClearIndicator = (props: ClearIndicatorProps<SelectOption>) => {
    return (
        <components.ClearIndicator {...props}>
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
        </components.ClearIndicator>
    );
};

// Custom styles to match your design system
const getCustomStyles = (error?: string): StylesConfig<SelectOption> => ({
    control: (provided, state) => ({
        ...provided,
        minHeight: '48px',
        padding: '0 4px',
        borderColor: error
            ? '#EF4444' // red-500
            : state.isFocused
                ? '#3B82F6' // blue-500
                : '#D1D5DB', // gray-300
        borderWidth: '1px',
        borderRadius: '8px',
        boxShadow: state.isFocused
            ? '0 0 0 2px rgba(59, 130, 246, 0.5)' // blue-500 with opacity
            : 'none',
        '&:hover': {
            borderColor: error
                ? '#EF4444'
                : state.isFocused
                    ? '#3B82F6'
                    : '#9CA3AF', // gray-400
        },
        transition: 'all 0.2s ease-in-out',
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: '0 8px',
    }),
    input: (provided) => ({
        ...provided,
        margin: '0',
        paddingTop: '0',
        paddingBottom: '0',
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        paddingRight: '8px',
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 50,
        borderRadius: '8px',
        border: '1px solid #E5E7EB', // gray-200
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        marginTop: '4px',
    }),
    menuList: (provided) => ({
        ...provided,
        padding: '4px',
        maxHeight: '200px',
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? '#3B82F6' // blue-500
            : state.isFocused
                ? '#EFF6FF' // blue-50
                : 'transparent',
        color: state.isSelected
            ? 'white'
            : state.isFocused
                ? '#1E40AF' // blue-800
                : '#374151', // gray-700
        padding: '8px 12px',
        borderRadius: '6px',
        margin: '2px 0',
        cursor: 'pointer',
        fontSize: '14px',
        '&:active': {
            backgroundColor: state.isSelected ? '#3B82F6' : '#DBEAFE', // blue-100
        },
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#9CA3AF', // gray-400
        fontSize: '14px',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#374151', // gray-700
        fontSize: '14px',
    }),
    loadingIndicator: (provided) => ({
        ...provided,
        color: '#3B82F6', // blue-500
    }),
    noOptionsMessage: (provided) => ({
        ...provided,
        color: '#6B7280', // gray-500
        fontSize: '14px',
        fontStyle: 'italic',
    }),
});

export const Select = forwardRef<any, SelectProps>(({
    label,
    error,
    required = false,
    options,
    loading = false,
    searchable = true,
    clearable = false,
    placeholder = 'Select an option...',
    className = '',
    ...props
}, ref) => {
    const id = useId();
    const [isMounted, setIsMounted] = useState(false);

    // Fix for Next.js SSR hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Don't render on server to avoid hydration mismatch
    if (!isMounted) {
        return (
            <div className={className}>
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="w-full h-12 border border-gray-300 rounded-lg bg-gray-50 animate-pulse" />
                {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
            </div>
        );
    }

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <ReactSelect
                ref={ref}
                inputId={id}
                options={options}
                styles={getCustomStyles(error)}
                components={{
                    DropdownIndicator,
                    ClearIndicator,
                }}
                isSearchable={searchable}
                isClearable={clearable}
                isLoading={loading}
                placeholder={placeholder}
                loadingMessage={() => 'Loading...'}
                noOptionsMessage={() => 'No options found'}
                className="react-select-container"
                classNamePrefix="react-select"
                {...props}
            />

            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';