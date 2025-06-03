// src/components/layout/Header.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
    User,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    ChevronDown,
    Sparkles,
    Home,
    FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RootState } from '@/lib/redux/store';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils/helpers';

interface HeaderProps {
    onMobileMenuToggle?: () => void;
    isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    onMobileMenuToggle,
    isMobileMenuOpen = false
}) => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const { user } = useSelector((state: RootState) => state.auth);
    const { logout } = useAuth();
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        if (isProfileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileMenuOpen]);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/directory?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className={cn(
            "sticky top-0 z-50 w-full transition-all duration-300",
            isScrolled
                ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50"
                : "bg-white/80 backdrop-blur-sm border-b border-gray-100"
        )}>
            <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
                {/* Left side - Logo and Mobile Menu */}
                <div className="flex items-center gap-4">
                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden hover:bg-blue-50 transition-colors duration-200"
                        onClick={onMobileMenuToggle}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-5 w-5 text-gray-700" />
                        ) : (
                            <Menu className="h-5 w-5 text-gray-700" />
                        )}
                    </Button>

                    {/* Logo */}
                    <div
                        className="flex items-center cursor-pointer group transition-transform duration-200 hover:scale-105"
                        onClick={() => router.push('/dashboard')}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div className="ml-3 hidden sm:block">
                            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Portfolio
                            </span>
                            <div className="text-xs text-gray-500 font-medium -mt-1">
                                Collection
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center - Search bar (hidden on mobile) */}
                <div className="hidden md:flex flex-1 max-w-md mx-8">
                    <form onSubmit={handleSearch} className="flex w-full">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                            <Input
                                type="search"
                                placeholder="Search portfolios..."
                                className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50/50 focus:bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </form>
                </div>

                {/* Right side - User menu */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:inline-flex hover:bg-blue-50 transition-colors duration-200 relative"
                    >
                        <Bell className="h-5 w-5 text-gray-600" />
                        {/* Notification dot */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                    </Button>

                    {/* User menu */}
                    <div className="relative" ref={dropdownRef}>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-3 px-3 py-2 h-10 hover:bg-blue-50 transition-all duration-200 rounded-xl"
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-sm shadow-md">
                                {user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName || 'User'}
                                        className="h-8 w-8 rounded-lg object-cover"
                                    />
                                ) : (
                                    getInitials(user?.displayName || user?.email?.split('@')[0] || 'U')
                                )}
                            </div>
                            <div className="hidden sm:block text-left">
                                <div className="text-sm font-medium text-gray-900">
                                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {user?.email}
                                </div>
                            </div>
                            <ChevronDown className={cn(
                                "h-4 w-4 text-gray-500 transition-transform duration-200",
                                isProfileMenuOpen && "rotate-180"
                            )} />
                        </Button>

                        {/* Dropdown menu */}
                        {isProfileMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md p-2 shadow-2xl animate-in slide-in-from-top-2 duration-200">
                                {/* User info header */}
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                                            {user?.photoURL ? (
                                                <img
                                                    src={user.photoURL}
                                                    alt={user.displayName || 'User'}
                                                    className="h-10 w-10 rounded-xl object-cover"
                                                />
                                            ) : (
                                                getInitials(user?.displayName || user?.email?.split('@')[0] || 'U')
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {user?.displayName || 'User'}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu items */}
                                <div className="py-2">
                                    <button
                                        onClick={() => {
                                            router.push('/dashboard');
                                            setIsProfileMenuOpen(false);
                                        }}
                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                            <User className="h-4 w-4" />
                                        </div>
                                        My Portfolio
                                    </button>

                                    <button
                                        onClick={() => {
                                            router.push('/directory');
                                            setIsProfileMenuOpen(false);
                                        }}
                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all duration-200"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                                            <Search className="h-4 w-4" />
                                        </div>
                                        Browse Portfolios
                                    </button>

                                    <button
                                        onClick={() => {
                                            router.push('/');
                                            setIsProfileMenuOpen(false);
                                        }}
                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                            <Home className="h-4 w-4" />
                                        </div>
                                        Home
                                    </button>

                                    {user?.isAdmin && (
                                        <button
                                            onClick={() => {
                                                router.push('/admin');
                                                setIsProfileMenuOpen(false);
                                            }}
                                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-200"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                                                <Settings className="h-4 w-4" />
                                            </div>
                                            Admin Panel
                                        </button>
                                    )}
                                </div>

                                {/* Logout */}
                                <div className="border-t border-gray-100 pt-2">
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                            <LogOut className="h-4 w-4" />
                                        </div>
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile search bar */}
            <div className={cn(
                "border-t px-4 py-3 md:hidden transition-all duration-200",
                isScrolled ? "border-gray-200/50" : "border-gray-100"
            )}>
                <form onSubmit={handleSearch}>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                        <Input
                            type="search"
                            placeholder="Search portfolios..."
                            className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-gray-50/50 focus:bg-white rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </form>
            </div>
        </header>
    );
};