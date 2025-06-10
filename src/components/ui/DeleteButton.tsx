// src/components/ui/delete-button.tsx
import React, { forwardRef, ReactNode } from 'react';
import { Trash2, X, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export interface DeleteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Variant of the delete button */
    variant?: 'outline' | 'ghost' | 'destructive' | 'solid';
    /** Size of the button */
    size?: 'xs' | 'sm' | 'md' | 'lg';
    /** Icon to display - defaults to Trash2 */
    icon?: 'trash' | 'x' | 'minus' | ReactNode;
    /** Whether to show a confirmation dialog before deletion */
    confirmDelete?: boolean;
    /** Confirmation message to display */
    confirmMessage?: string;
    /** Loading state */
    loading?: boolean;
    /** Tooltip text */
    tooltip?: string;
    /** Custom aria-label for accessibility */
    ariaLabel?: string;
    /** Callback function when delete is confirmed */
    onDelete?: () => void | Promise<void>;
    /** Alignment context - helps with proper positioning */
    alignWith?: 'input' | 'floating-input' | 'auto';
}

const DeleteButton = forwardRef<HTMLButtonElement, DeleteButtonProps>(
    ({
        className,
        variant = 'outline',
        size = 'sm',
        icon = 'trash',
        confirmDelete = false,
        confirmMessage = 'Are you sure you want to delete this item?',
        loading = false,
        tooltip,
        ariaLabel,
        alignWith = 'auto',
        onDelete,
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
                case 'x':
                    return <X className="w-4 h-4" />;
                case 'minus':
                    return <Minus className="w-4 h-4" />;
                case 'trash':
                default:
                    return <Trash2 className="w-4 h-4" />;
            }
        };

        // Handle click with optional confirmation
        const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();

            if (confirmDelete) {
                if (window.confirm(confirmMessage)) {
                    if (onDelete) {
                        await onDelete();
                    } else if (onClick) {
                        onClick(e);
                    }
                }
            } else {
                if (onDelete) {
                    await onDelete();
                } else if (onClick) {
                    onClick(e);
                }
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
                'border border-gray-300 bg-white text-gray-600',
                'hover:bg-red-50 hover:border-red-300 hover:text-red-600',
                'focus:ring-2 focus:ring-red-100 focus:border-red-500',
                'active:bg-red-100'
            ),
            ghost: cn(
                'border-0 bg-transparent text-gray-600',
                'hover:bg-red-50 hover:text-red-600',
                'focus:ring-2 focus:ring-red-100',
                'active:bg-red-100'
            ),
            destructive: cn(
                'border border-red-600 bg-red-600 text-white',
                'hover:bg-red-700 hover:border-red-700',
                'focus:ring-2 focus:ring-red-100 focus:ring-offset-2',
                'active:bg-red-800'
            ),
            solid: cn(
                'border border-red-500 bg-red-500 text-white',
                'hover:bg-red-600 hover:border-red-600',
                'focus:ring-2 focus:ring-red-100 focus:ring-offset-2',
                'active:bg-red-700'
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
                    aria-label={ariaLabel || `Delete ${tooltip || 'item'}`}
                    title={tooltip}
                    {...props}
                >
                    {buttonContent}
                </button>
            </div>
        );
    }
);

DeleteButton.displayName = 'DeleteButton';

export { DeleteButton };

// Usage Examples:
/*
// Basic usage (replaces your current button)
<DeleteButton onDelete={() => removeLanguage(index)} />

// For regular input alignment (Case 1)
<div className="flex gap-2 items-center"> // Remove space-y-3, use gap-2 and items-center
  <Input className="flex-1" />
  <DeleteButton alignWith="input" onDelete={() => removeLanguage(index)} />
</div>

// For floating input alignment (Case 2)
<div className="flex gap-2">
  <Input label="Label" className="flex-1" />
  <DeleteButton alignWith="floating-input" onDelete={() => removeReference(index)} />
</div>

// With confirmation
<DeleteButton 
  confirmDelete 
  confirmMessage="Are you sure you want to remove this language?"
  onDelete={() => removeLanguage(index)} 
/>

// Different variants and sizes
<DeleteButton variant="destructive" size="lg" onDelete={handleDelete} />
<DeleteButton variant="ghost" icon="x" onDelete={handleDelete} />

// With loading state
<DeleteButton loading={deleting} onDelete={handleAsyncDelete} />

// With custom content
<DeleteButton onDelete={handleDelete}>
  <Trash2 className="w-4 h-4 mr-2" />
  Delete
</DeleteButton>

// With tooltip
<DeleteButton 
  tooltip="Remove language"
  onDelete={() => removeLanguage(index)} 
/>
*/