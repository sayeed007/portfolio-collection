// src/components/layout/Sidebar.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Navigation } from './Navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/helpers';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isOpen = true,
    onClose,
    className
}) => {
    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && onClose && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-50 h-full w-64 transform border-r bg-background transition-transform duration-200 ease-in-out md:static md:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full',
                    className
                )}
            >
                {/* Header */}
                <div className="flex h-16 items-center justify-between border-b px-4 md:justify-center">
                    <div className="flex items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <span className="text-sm font-bold">PC</span>
                        </div>
                        <span className="ml-2 font-semibold">Portfolio Collection</span>
                    </div>

                    {/* Close button (mobile only) */}
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="md:hidden"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                {/* Navigation */}
                <div className="p-4">
                    <Navigation onItemClick={onClose} />
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 w-full border-t p-4">
                    <div className="text-xs text-muted-foreground text-center">
                        Portfolio Collection v1.0
                    </div>
                </div>
            </aside>
        </>
    );
};