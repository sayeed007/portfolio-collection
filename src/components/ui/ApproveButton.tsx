// src/components/ui/approve-button.tsx
import React, { forwardRef, ReactNode } from 'react';
import { CheckSquare, Check, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

export interface ApproveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Variant of the approve button */
    variant?: 'outline' | 'ghost' | 'primary' | 'solid';
    /** Size of the button */
    size?: 'xs' | 'sm' | 'md' | 'lg';
    /** Icon to display - defaults to CheckSquare */
    icon?: 'check-square' | 'check' | 'check-circle' | ReactNode;
    /** Loading state */
    loading?: boolean;
    /** Tooltip text */
    tooltip?: string;
    /** Custom aria-label for accessibility */
    ariaLabel?: string;
    /** Callback function when approve is triggered */
    onApprove?: (data?: any) => void | Promise<void>;
    /** Data to pass to onApprove callback */
    approveData?: any;
    /** Alignment context - helps with proper positioning */
    alignWith?: 'input' | 'floating-input' | 'auto';
}

const ApproveButton = forwardRef<HTMLButtonElement, ApproveButtonProps>(
    ({
        className,
        variant = 'outline',
        size = 'sm',
        icon = 'check-square',
        loading = false,
        tooltip,
        ariaLabel,
        alignWith = 'auto',
        onApprove,
        approveData,
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
                case 'check':
                    return <Check className="w-4 h-4" />;
                case 'check-circle':
                    return <CheckCircle className="w-4 h-4" />;
                case 'check-square':
                default:
                    return <CheckSquare className="w-4 h-4" />;
            }
        };

        // Handle click
        const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();

            if (onApprove) {
                await onApprove(approveData);
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

        // Variant classes with green theme
        const variantClasses = {
            outline: cn(
                'border border-gray-300 bg-white text-green-600',
                'hover:bg-green-50 hover:border-green-300 hover:text-green-800',
                'focus:ring-2 focus:ring-green-100 focus:border-green-500',
                'active:bg-green-100'
            ),
            ghost: cn(
                'border-0 bg-transparent text-green-600',
                'hover:bg-green-50 hover:text-green-800',
                'focus:ring-2 focus:ring-green-100',
                'active:bg-green-100'
            ),
            primary: cn(
                'border border-green-600 bg-green-600 text-white',
                'hover:bg-green-700 hover:border-green-700',
                'focus:ring-2 focus:ring-green-100 focus:ring-offset-2',
                'active:bg-green-800'
            ),
            solid: cn(
                'border border-green-500 bg-green-500 text-white',
                'hover:bg-green-600 hover:border-green-600',
                'focus:ring-2 focus:ring-green-100 focus:ring-offset-2',
                'active:bg-green-700'
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
                    aria-label={ariaLabel || `Approve ${tooltip || 'item'}`}
                    title={tooltip}
                    {...props}
                >
                    {buttonContent}
                </button>
            </div>
        );
    }
);

ApproveButton.displayName = 'ApproveButton';

export { ApproveButton };


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