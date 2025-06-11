// src/components/ui/edit-button.tsx
import React, { forwardRef, ReactNode } from 'react';
import { Edit2, Edit3, Edit, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export interface EditButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Variant of the edit button */
    variant?: 'outline' | 'ghost' | 'primary' | 'solid';
    /** Size of the button */
    size?: 'xs' | 'sm' | 'md' | 'lg';
    /** Icon to display - defaults to Edit2 */
    icon?: 'edit2' | 'edit3' | 'edit' | 'pencil' | ReactNode;
    /** Loading state */
    loading?: boolean;
    /** Tooltip text */
    tooltip?: string;
    /** Custom aria-label for accessibility */
    ariaLabel?: string;
    /** Callback function when edit is triggered */
    onEdit?: (data?: any) => void | Promise<void>;
    /** Data to pass to onEdit callback */
    editData?: any;
    /** Alignment context - helps with proper positioning */
    alignWith?: 'input' | 'floating-input' | 'auto';
}

const EditButton = forwardRef<HTMLButtonElement, EditButtonProps>(
    ({
        className,
        variant = 'outline',
        size = 'sm',
        icon = 'edit2',
        loading = false,
        tooltip,
        ariaLabel,
        alignWith = 'auto',
        onEdit,
        editData,
        onClick,
        disabled,
        children,
        ...props
    }, ref) => {

        // Icon rendering logic
        const renderIcon = () => {
            if (loading) {
                return (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                );
            }

            if (React.isValidElement(icon)) {
                return icon;
            }

            switch (icon) {
                case 'edit3':
                    return <Edit3 className="w-4 h-4" />;
                case 'edit':
                    return <Edit className="w-4 h-4" />;
                case 'pencil':
                    return <Pencil className="w-4 h-4" />;
                case 'edit2':
                default:
                    return <Edit2 className="w-4 h-4" />;
            }
        };

        // Handle click
        const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();

            if (onEdit) {
                await onEdit(editData);
            } else if (onClick) {
                onClick(e);
            }
        };

        // Size classes
        const sizeClasses = {
            xs: 'h-6 w-6 p-1',
            sm: 'h-8 w-8 p-1.5',
            md: 'h-10 w-10 p-2',
            lg: 'h-12 w-12 p-3'
        };

        // Variant classes
        const variantClasses = {
            outline: cn(
                'border border-gray-300 bg-white text-blue-600',
                'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800',
                'focus:ring-2 focus:ring-blue-100 focus:border-blue-500',
                'active:bg-blue-100'
            ),
            ghost: cn(
                'border-0 bg-transparent text-blue-600',
                'hover:bg-blue-50 hover:text-blue-800',
                'focus:ring-2 focus:ring-blue-100',
                'active:bg-blue-100'
            ),
            primary: cn(
                'border border-blue-600 bg-blue-600 text-white',
                'hover:bg-blue-700 hover:border-blue-700',
                'focus:ring-2 focus:ring-blue-100 focus:ring-offset-2',
                'active:bg-blue-800'
            ),
            solid: cn(
                'border border-blue-500 bg-blue-500 text-white',
                'hover:bg-blue-600 hover:border-blue-600',
                'focus:ring-2 focus:ring-blue-100 focus:ring-offset-2',
                'active:bg-blue-700'
            )
        };

        // Alignment classes based on context
        const alignmentClasses = {
            'input': 'mb-2',
            'floating-input': '',
            'auto': ''
        };

        const buttonHolder = cn(
            'flex items-center',
            // Alignment classes
            alignmentClasses[alignWith],
        );

        const buttonClasses = cn(
            // Base classes
            'cursor-pointer',
            'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200',
            'focus:outline-none focus:ring-offset-white',
            'disabled:opacity-50 disabled:pointer-events-none',
            // Size classes
            sizeClasses[size],
            // Variant classes
            variantClasses[variant],
            // Custom classes
            className
        );

        const buttonContent = children || renderIcon();

        return (
            <div className={buttonHolder}>
                <button
                    ref={ref}
                    type="button"
                    className={buttonClasses}
                    onClick={handleClick}
                    disabled={disabled || loading}
                    aria-label={ariaLabel || `Edit ${tooltip || 'item'}`}
                    title={tooltip}
                    {...props}
                >
                    {buttonContent}
                </button>
            </div>
        );
    }
);

EditButton.displayName = 'EditButton';

export { EditButton };

// Usage Examples:
/*
// Basic usage (replaces your current button)
<EditButton onEdit={(data) => handleEdit(data)} editData={language} />

// For regular input alignment (Case 1)
<div className="flex gap-2 items-center">
  <Input className="flex-1" />
  <EditButton alignWith="input" onEdit={(data) => handleEdit(data)} editData={language} />
</div>

// For floating input alignment (Case 2)
<div className="flex gap-2">
  <Input label="Label" className="flex-1" />
  <EditButton alignWith="floating-input" onEdit={(data) => handleEdit(data)} editData={language} />
</div>

// Different variants and sizes
<EditButton variant="primary" size="lg" onEdit={handleEdit} editData={item} />
<EditButton variant="ghost" icon="pencil" onEdit={handleEdit} editData={item} />

// With loading state
<EditButton loading={editing} onEdit={handleAsyncEdit} editData={item} />

// With custom content
<EditButton onEdit={handleEdit} editData={item}>
  <Edit2 className="w-4 h-4 mr-2" />
  Edit
</EditButton>

// With tooltip
<EditButton 
  tooltip="Edit language"
  onEdit={(data) => handleEdit(data)} 
  editData={language}
/>

// Paired with DeleteButton
<div className="flex gap-1">
  <EditButton onEdit={(data) => handleEdit(data)} editData={language} />
  <DeleteButton onDelete={() => removeLanguage(index)} />
</div>
*/