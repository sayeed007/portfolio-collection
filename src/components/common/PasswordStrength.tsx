'use client';

import { cn } from "@/lib/utils/helpers";
import { CheckCircle } from "lucide-react";

interface PasswordStrengthProps {
    password: string;
}


export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
    const requirements = [
        { regex: /.{8,}/, text: 'At least 8 characters' },
        { regex: /[A-Z]/, text: 'One uppercase letter' },
        { regex: /[a-z]/, text: 'One lowercase letter' },
        { regex: /\d/, text: 'One number' },
        { regex: /[@$!%*?&]/, text: 'One special character' },
    ];

    const strength = requirements.filter(req => req.regex.test(password)).length;
    const getStrengthColor = () => {
        if (strength < 2) return 'bg-red-500';
        if (strength < 4) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (strength < 2) return 'Weak';
        if (strength < 4) return 'Fair';
        return 'Strong';
    };

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Password strength:</span>
                <span className={cn(
                    "font-medium",
                    strength < 2 ? "text-red-600" : strength < 4 ? "text-yellow-600" : "text-green-600"
                )}>
                    {getStrengthText()}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={cn("h-2 rounded-full transition-all duration-300", getStrengthColor())}
                    style={{ width: `${(strength / 5) * 100}%` }}
                />
            </div>
            <div className="space-y-1">
                {requirements.map((req, index) => (
                    <div key={index} className="flex items-center text-xs">
                        {req.regex.test(password) ? (
                            <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                        ) : (
                            <div className="w-3 h-3 border border-gray-300 rounded-full mr-2" />
                        )}
                        <span className={req.regex.test(password) ? 'text-green-600' : 'text-gray-500'}>
                            {req.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};