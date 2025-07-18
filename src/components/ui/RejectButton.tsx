// src/components/ui/reject-button.tsx
import React, { forwardRef, ReactNode } from 'react';
import { XSquare, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export interface RejectButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Variant of the reject button */
    variant?: 'outline' | 'ghost' | 'primary' | 'solid';
    /** Size of the button */
    size?: 'xs' | 'sm' | 'md' | 'lg';
    /** Icon to display - defaults to XSquare */
    icon?: 'x-square' | 'x' | 'x-circle' | ReactNode;
    /** Loading state */
    loading?: boolean;
    /** Tooltip text */
    tooltip?: string;
    /** Custom aria-label for accessibility */
    ariaLabel?: string;
    /** Callback function when reject is triggered */
    onReject?: (data?: any) => void | Promise<void>;
    /** Data to pass to onReject callback */
    rejectData?: any;
    /** Alignment context - helps with proper positioning */
    alignWith?: 'input' | 'floating-input' | 'auto';
}

const RejectButton = forwardRef<HTMLButtonElement, RejectButtonProps>(
    ({
        className,
        variant = 'outline',
        size = 'sm',
        icon = 'x-square',
        loading = false,
        tooltip,
        ariaLabel,
        alignWith = 'auto',
        onReject,
        rejectData,
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
                case 'x-circle':
                    return <XCircle className="w-4 h-4" />;
                case 'x-square':
                default:
                    return <XSquare className="w-4 h-4" />;
            }
        };

        // Handle click
        const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();

            if (onReject) {
                await onReject(rejectData);
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

        // Variant classes with red theme
        const variantClasses = {
            outline: cn(
                'border border-gray-300 bg-white text-red-600',
                'hover:bg-red-50 hover:border-red-300 hover:text-red-800',
                'focus:ring-2 focus:ring-red-100 focus:border-red-500',
                'active:bg-red-100'
            ),
            ghost: cn(
                'border-0 bg-transparent text-red-600',
                'hover:bg-red-50 hover:text-red-800',
                'focus:ring-2 focus:ring-red-100',
                'active:bg-red-100'
            ),
            primary: cn(
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
                    aria-label={ariaLabel || `Reject ${tooltip || 'item'}`}
                    title={tooltip}
                    {...props}
                >
                    {buttonContent}
                </button>
            </div>
        );
    }
);

RejectButton.displayName = 'RejectButton';

export { RejectButton };

// Usage Examples:
/*
// Basic usage (replaces your current buttons)
<ApproveButton onApprove={() => handleInstitutionRequest(request.id, 'approve', 'Approved by admin')} />
<RejectButton onReject={() => handleInstitutionRequest(request.id, 'reject', 'Rejected by admin')} />

// With data passing
<ApproveButton 
    onApprove={(data) => handleApprove(data)} 
    approveData={request} 
    tooltip="Approve request"
/>
<RejectButton 
    onReject={(data) => handleReject(data)} 
    rejectData={request}
    tooltip="Reject request"
/>

// Different variants
<ApproveButton variant="solid" onApprove={handleApprove} />
<RejectButton variant="ghost" onReject={handleReject} />

// With loading state
<ApproveButton loading={approving} onApprove={handleAsyncApprove} />
<RejectButton loading={rejecting} onReject={handleAsyncReject} />

// Different icons
<ApproveButton icon="check" onApprove={handleApprove} />
<RejectButton icon="x" onReject={handleReject} />

*/