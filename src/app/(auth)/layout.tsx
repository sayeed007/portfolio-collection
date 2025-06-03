// src/app/(auth)/layout.tsx
import { AuthProvider } from '@/components/auth/AuthProvider';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="container mx-auto px-4 py-8">
                    {children}
                </div>
            </div>
        </AuthProvider>
    );
}