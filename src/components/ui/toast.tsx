// src/components/ui/toast.tsx
import * as React from "react";
import { X, CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
    id,
    type,
    title,
    message,
    duration = 5000,
    onClose
}) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const icons = {
        success: CheckCircle,
        error: XCircle,
        warning: AlertCircle,
        info: Info
    };

    const colors = {
        success: "bg-green-50 border-green-200 text-green-800",
        error: "bg-red-50 border-red-200 text-red-800",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
        info: "bg-blue-50 border-blue-200 text-blue-800"
    };

    const Icon = icons[type];

    return (
        <div className={cn(
            "flex items-start p-4 border rounded-lg shadow-lg max-w-sm w-full",
            colors[type]
        )}>
            <Icon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
                {title && (
                    <p className="font-medium text-sm">{title}</p>
                )}
                <p className={cn("text-sm", title ? "mt-1" : "")}>{message}</p>
            </div>
            <button
                onClick={() => onClose(id)}
                className="ml-3 flex-shrink-0 hover:opacity-70"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

// Toast Container Component
interface ToastContainerProps {
    toasts: Array<{
        id: string;
        type: ToastType;
        title?: string;
        message: string;
        duration?: number;
    }>;
    onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={onClose}
                />
            ))}
        </div>
    );
};

export { Toast, ToastContainer };