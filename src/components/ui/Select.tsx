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
import { cn } from "@/lib/utils/helpers";

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

// Custom styles to match your design system with floating label
const getCustomStyles = (error?: string, hasFloatingLabel?: boolean): StylesConfig<SelectOption> => ({
    control: (provided, state) => ({
        ...provided,
        minHeight: '48px',
        padding: hasFloatingLabel ? '8px 4px 0 4px' : '0 4px', // Add top padding for floating label
        borderColor: error
            ? '#EF4444' // red-500
            : state.isFocused
                ? '#3B82F6' // blue-500
                : '#D1D5DB', // gray-300
        borderWidth: '1px',
        borderRadius: '8px',
        boxShadow: 'none', // Remove default box shadow
        '&:hover': {
            borderColor: error
                ? '#EF4444'
                : state.isFocused
                    ? '#3B82F6'
                    : '#9CA3AF', // gray-400
        },
        transition: 'all 0.2s ease-in-out',
        backgroundColor: 'white',
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: '0 8px',
        paddingTop: hasFloatingLabel ? '4px' : '8px',
    }),
    input: (provided) => ({
        ...provided,
        margin: '0',
        paddingTop: '0',
        paddingBottom: '0',
        fontSize: '14px',
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
        color: 'transparent', // Hide placeholder when using floating label
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
    value,
    ...props
}, ref) => {
    const id = useId();
    const [isMounted, setIsMounted] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Check if select has value
    const hasValue = Boolean(value);
    const isLabelFloating = isFocused || hasValue;
    const hasError = Boolean(error);

    // Fix for Next.js SSR hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    // Don't render on server to avoid hydration mismatch
    if (!isMounted) {
        return (
            <div className={cn("space-y-1 w-full", className)}>
                {label && (
                    <div className="relative">
                        <div className="w-full h-12 border border-gray-300 rounded-lg bg-gray-50 animate-pulse" />
                        <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-600">
                            {label}
                            {required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                    </div>
                )}
                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}
            </div>
        );
    }

    // If no label is provided, render simple select (similar to your Input component)
    if (!label) {
        return (
            <div className={cn("space-y-1 w-full", className)}>
                <ReactSelect
                    ref={ref}
                    inputId={id}
                    options={options}
                    styles={getCustomStyles(error, false)}
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
                    value={value}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className={cn("space-y-1 w-full", className)}>
            <div className="relative">
                <ReactSelect
                    ref={ref}
                    inputId={id}
                    options={options}
                    styles={getCustomStyles(error, true)}
                    components={{
                        DropdownIndicator,
                        ClearIndicator,
                    }}
                    isSearchable={searchable}
                    isClearable={clearable}
                    isLoading={loading}
                    placeholder=""
                    loadingMessage={() => 'Loading...'}
                    noOptionsMessage={() => 'No options found'}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    value={value}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />

                <label
                    htmlFor={id}
                    className={cn(
                        "absolute transition-all duration-200 ease-in-out cursor-text pointer-events-none",
                        "bg-white px-1",
                        // Positioning based on state
                        isLabelFloating
                            ? cn(
                                // Floating position - on the top border
                                "-top-2 left-3 text-xs",
                                // Colors when floating
                                isFocused && !hasError && "text-blue-600",
                                hasError && "text-red-600",
                                !isFocused && !hasError && "text-gray-600"
                            )
                            : cn(
                                // Inside position
                                "top-1/2 -translate-y-1/2 text-sm text-gray-500 left-3"
                            )
                    )}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            </div>

            {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
});

Select.displayName = 'Select';