// src/components/layout/Footer.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Github, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-xl font-bold mb-4">Portfolio Collection</h3>
                        <p className="text-gray-300 mb-4 max-w-md">
                            A comprehensive platform for creating, managing, and showcasing professional portfolios.
                            Connect with professionals and explore diverse skill sets.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="mailto:bappy143081@gmail.com"
                                className="text-gray-300 hover:text-white transition-colors"
                                aria-label="Email us"
                            >
                                <Mail className="w-5 h-5" />
                            </a>
                            <a
                                href="https://github.com/sayeed007"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-300 hover:text-white transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                            <a
                                href="+8801934939844"
                                className="text-gray-300 hover:text-white transition-colors"
                                aria-label="Call us"
                            >
                                <Phone className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/dashboard"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/portfolio/create"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Create Portfolio
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/directory"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Portfolio Directory
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/about"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/help"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 text-gray-300">
                            <span>Made with</span>
                            <Heart className="w-4 h-4 text-red-500" />
                            <span>by the Portfolio Collection Team(SHB)</span>
                        </div>
                        <div className="text-gray-300 mt-4 md:mt-0">
                            <p>&copy; {currentYear} Portfolio Collection. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};