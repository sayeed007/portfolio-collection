// YearSelect.tsx - Updated version
import { Select, SelectOption } from '@/components/ui/Select';
import { useMemo } from 'react';
import { SingleValue, MultiValue } from 'react-select';

interface YearSelectProps {
    label: string;
    placeholder?: string;
    value?: number | null;
    onChange: (year: number | null) => void;
    startYear?: number; // How many years back from current year
    endYear?: number; // How many years forward from current year (default: 10)
    error?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
    clearable?: boolean;
}

export function YearSelect({
    label,
    placeholder = "Select year...",
    value,
    onChange,
    startYear = 80, // Default: 80 years back
    endYear = 10, // Default: 10 years forward
    error,
    required,
    className,
    disabled,
    clearable = false
}: YearSelectProps) {
    const yearOptions = useMemo((): SelectOption[] => {
        const currentYear = new Date().getFullYear();
        const years: SelectOption[] = [];

        // Generate years from (currentYear - startYear) to (currentYear + endYear)
        for (let year = currentYear + endYear; year >= currentYear - startYear; year--) {
            years.push({
                value: year.toString(), // Convert to string to match SelectOption interface
                label: year.toString()
            });
        }

        return years;
    }, [startYear, endYear]);

    const selectedOption = value ? yearOptions.find(option => parseInt(option.value) === value) : null;

    const handleChange = (selectedOption: SingleValue<SelectOption> | MultiValue<SelectOption>) => {
        // Handle both single and multi-value cases, but we only use single value
        const singleOption = Array.isArray(selectedOption) ? selectedOption[0] || null : selectedOption;
        // Convert string value back to number or null
        const yearValue = singleOption ? parseInt(singleOption.value) : null;
        onChange(yearValue);
    };

    return (
        <Select
            label={label}
            placeholder={placeholder}
            options={yearOptions}
            value={selectedOption}
            onChange={handleChange}
            searchable={true}
            clearable={clearable}
            error={error}
            required={required}
            className={className}
            isDisabled={disabled}
        />
    );
}