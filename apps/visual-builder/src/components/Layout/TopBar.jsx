// src/components/Layout/TopBar.jsx
import React, { useState } from 'react';
import { Menu, Search, Bell, User, ChevronDown, LogOut, Settings, UserCircle } from 'lucide-react';

const TopBar = ({ onMenuClick }) => {
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    return (
        <div className="h-14 bg-surface border-b border-border flex items-center justify-between px-4">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-surface-light transition-colors">
                    <Menu className="w-5 h-5 text-text-primary" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <span className="font-semibold text-text-primary text-lg">SuKit</span>
                </div>
            </div>
            {/* Center Search */}
            <div className="flex-1 max-w-md mx-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search pages, components, settings..."
                        className="w-full pl-9 pr-4 py-1.5 bg-surface-light border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>
            {/* Right Section */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <button className="p-2 rounded-lg hover:bg-surface-light transition-colors relative">
                    <Bell className="w-5 h-5 text-text-secondary" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full"></span>
                </button>
                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-light transition-colors"
                    >
                        <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary-500" />
                        </div>
                        <span className="text-sm text-text-primary">John Doe</span>
                        <ChevronDown className="w-4 h-4 text-text-secondary" />
                    </button>
                    {userMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg z-50">
                            <div className="p-3 border-b border-border">
                                <p className="text-sm font-medium text-text-primary">John Doe</p>
                                <p className="text-xs text-text-secondary">john@example.com</p>
                            </div>
                            <div className="py-1">
                                <a href="/account/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-text-primary hover:bg-surface-light">
                                    <UserCircle className="w-4 h-4" /> My Profile
                                </a>
                                <a href="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-text-primary hover:bg-surface-light">
                                    <Settings className="w-4 h-4" /> Settings
                                </a>
                            </div>
                            <div className="border-t border-border py-1">
                                <a href="/logout" className="flex items-center gap-3 px-4 py-2 text-sm text-danger-500 hover:bg-surface-light">
                                    <LogOut className="w-4 h-4" /> Logout
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopBar;
