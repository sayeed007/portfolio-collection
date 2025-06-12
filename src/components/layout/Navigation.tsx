// src/components/layout/Navigation.tsx
'use client';

import { Button } from '@/components/ui/button';
import { RootState } from '@/lib/redux/store';
import { cn } from '@/lib/utils/helpers';
import {
    Home,
    PlusCircle,
    Search,
    Settings,
    User
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { useSelector } from 'react-redux';

interface NavigationItem {
    label: string;
    href: string;
    icon: React.ElementType;
    adminOnly?: boolean;
}

const navigationItems: NavigationItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: Home
    },
    {
        label: 'My Portfolio',
        href: '/portfolio/view',
        icon: User
    },
    {
        label: 'Create Portfolio',
        href: '/portfolio/create',
        icon: PlusCircle
    },
    {
        label: 'Browse Portfolios',
        href: '/directory',
        icon: Search
    },
    {
        label: 'Admin Panel',
        href: '/admin',
        icon: Settings,
        adminOnly: true
    }
];

interface NavigationProps {
    className?: string;
    onItemClick?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
    className,
    onItemClick
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleNavigation = (href: string) => {
        router.push(href);
        onItemClick?.();
    };

    const filteredItems = navigationItems.filter(item =>
        !item.adminOnly || (item.adminOnly && user?.isAdmin)
    );

    return (
        <nav className={cn('space-y-2', className)}>
            {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));

                return (
                    <Button
                        key={item.href}
                        variant={isActive ? 'default' : 'ghost'}
                        className={cn(
                            'w-full justify-start',
                            isActive && 'bg-primary text-primary-foreground'
                        )}
                        onClick={() => handleNavigation(item.href)}
                    >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                    </Button>
                );
            })}
        </nav>
    );
};
