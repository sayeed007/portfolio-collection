// src/components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils/helpers";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, icon, helperText, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const [hasValue, setHasValue] = React.useState(false);
        const inputId = React.useId();
        const inputRef = React.useRef<HTMLInputElement>(null);

        // Combine refs to handle both forwarded ref and internal ref
        const combinedRef = React.useCallback(
            (node: HTMLInputElement) => {
                inputRef.current = node;
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
            },
            [ref]
        );

        // Check if input has value - improved to handle all cases
        const checkHasValue = React.useCallback(() => {
            const input = inputRef.current;
            if (input) {
                setHasValue(Boolean(input.value));
            } else {
                // Fallback to props if ref not available yet
                setHasValue(Boolean(props.value || props.defaultValue));
            }
        }, [props.value, props.defaultValue]);

        // Check value on mount and when props change
        React.useEffect(() => {
            checkHasValue();
        }, [checkHasValue]);

        // Also check after component mounts to catch any initial values
        React.useEffect(() => {
            // Small delay to ensure input is fully rendered
            const timer = setTimeout(checkHasValue, 0);
            return () => clearTimeout(timer);
        }, [checkHasValue]);

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            props.onFocus?.(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            setHasValue(Boolean(e.target.value));
            props.onBlur?.(e);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setHasValue(Boolean(e.target.value));
            props.onChange?.(e);
        };

        const isLabelFloating = isFocused || hasValue;
        const hasError = Boolean(error);

        // If no label is provided, render simple input
        if (!label) {
            return (
                <div className="space-y-1">
                    <div className="relative">
                        {icon && (
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                {icon}
                            </div>
                        )}
                        <input
                            type={type}
                            className={cn(
                                "flex h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors",
                                "placeholder:text-gray-400",
                                "focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none",
                                "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
                                hasError && "border-red-500 focus:border-red-500 focus:ring-red-100",
                                icon && "pl-10",
                                className
                            )}
                            ref={combinedRef}
                            {...props}
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </p>
                    )}
                    {helperText && !error && (
                        <p className="text-sm text-gray-500">{helperText}</p>
                    )}
                </div>
            );
        }

        return (
            <div className="space-y-1">
                <div className="relative">
                    {icon && (
                        <div className={cn(
                            "absolute top-1/2 transform -translate-y-1/2 text-gray-400 z-10",
                            "left-3"
                        )}>
                            {icon}
                        </div>
                    )}

                    <input
                        id={inputId}
                        type={type}
                        className={cn(
                            "w-full h-12 px-3 py-3 text-sm bg-white border rounded-lg transition-all duration-200",
                            "placeholder:text-transparent",
                            "focus:outline-none",
                            // Default state
                            "border-gray-300 focus:border-blue-500",
                            // Error state
                            hasError && "border-red-500 focus:border-red-500",
                            // Disabled state
                            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
                            // Icon spacing
                            icon && "pl-10",
                            className
                        )}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        ref={combinedRef}
                        {...props}
                    />

                    <label
                        htmlFor={inputId}
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
                                    "top-1/2 -translate-y-1/2 text-sm text-gray-500",
                                    icon ? "left-10" : "left-3"
                                )
                        )}
                    >
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
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

                {helperText && !error && (
                    <p className="text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };