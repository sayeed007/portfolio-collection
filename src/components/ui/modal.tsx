// src/components/ui/modal.tsx
import { cn } from "@/lib/utils/helpers";
import { X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
    portalTarget?: Element | null;
    showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    className,
    size = "md",
    portalTarget,
    showCloseButton = true
}) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [mountNode, setMountNode] = React.useState<Element | null>(null);

    React.useEffect(() => {
        // Create or get the portal target
        let target = portalTarget;
        if (!target) {
            target = document.getElementById('modal-root');
            if (!target) {
                target = document.createElement('div');
                target.id = 'modal-root';
                document.body.appendChild(target);
            }
        }
        setMountNode(target);
    }, [portalTarget]);

    React.useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            const timer = setTimeout(() => setIsVisible(false), 200);
            return () => clearTimeout(timer);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle escape key
    React.useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    const sizeClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
        "4xl": "max-w-4xl",
        "5xl": "max-w-5xl"
    };

    if (!isVisible || !mountNode) return null;

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Enhanced Backdrop with blur */}
            <div
                className={cn(
                    "fixed inset-0 backdrop-blur-sm transition-all duration-300 ease-out",
                    "bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-blue-900/20",
                    isOpen
                        ? "opacity-100 backdrop-blur-sm"
                        : "opacity-0 backdrop-blur-none"
                )}
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className={cn(
                "relative w-full transition-all duration-300 ease-out transform",
                sizeClasses[size],
                isOpen
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 translate-y-4"
            )}>
                {/* Modal Content */}
                <div className={cn(
                    "relative flex flex-col max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl",
                    "bg-gradient-to-br from-white via-white/95 to-blue-50/50",
                    "backdrop-blur-xl border border-white/20",
                    "transform transition-all duration-300",
                    className
                )}>
                    {/* Decorative gradient overlay */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />

                    {/* Close button - always visible */}
                    {showCloseButton && (
                        <div className="absolute top-2 right-4 z-10">
                            <Button
                                onClick={onClose}
                                className={cn(
                                    "w-10 h-10 rounded-full p-0 transition-all duration-300",
                                    "bg-white/80 backdrop-blur-sm text-gray-500",
                                    "hover:bg-red-500 hover:text-white hover:shadow-lg",
                                    "focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
                                    "transform hover:scale-110 active:scale-95"
                                )}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    )}

                    {/* Header - Fixed */}
                    {title && (
                        <div className="flex-shrink-0 px-6 py-3 border-b border-gray-200">
                            <div className="flex justify-start items-start">
                                <div>
                                    <h2 className="text-left text-2xl font-bold text-gray-900">
                                        {title}
                                    </h2>
                                    {subtitle && (
                                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {children}
                    </div>

                    {/* Footer - Fixed */}
                    {footer && (
                        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
                            {footer}
                        </div>
                    )}

                    {/* Subtle bottom gradient for depth */}
                    {!footer && (
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                    )}
                </div>

                {/* Floating shadow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 rounded-3xl blur-xl opacity-25 -z-10" />
            </div>
        </div>
    );

    // Use React Portal to render at document body level
    return createPortal(modalContent, mountNode);
};

// Enhanced Modal variants for specific use cases
const ModalVariants = {
    // Confirmation modal
    Confirm: React.forwardRef<HTMLDivElement, ModalProps & {
        onConfirm?: () => void;
        confirmText?: string;
        cancelText?: string;
        variant?: 'danger' | 'warning' | 'info';
    }>(({
        onConfirm,
        confirmText = "Confirm",
        cancelText = "Cancel",
        variant = 'info',
        children,
        ...props
    }, ref) => {
        const variantStyles = {
            danger: {
                button: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
                icon: "text-red-500"
            },
            warning: {
                button: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
                icon: "text-orange-500"
            },
            info: {
                button: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                icon: "text-blue-500"
            }
        };

        return (
            <Modal {...props} size="md">
                <div ref={ref} className="text-center">
                    {children}
                    <div className="flex flex-col sm:flex-row gap-3 mt-8">
                        <Button
                            onClick={props.onClose}
                            className="flex-1 h-12 bg-white text-gray-600 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl transition-all duration-300"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className={cn(
                                "flex-1 h-12 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-xl",
                                variantStyles[variant].button
                            )}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </Modal>
        );
    })
};

export { Modal, ModalVariants };
