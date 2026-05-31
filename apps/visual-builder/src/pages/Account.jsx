import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { User, CreditCard, Key, Shield, Receipt, Monitor, ChevronRight } from 'lucide-react';

const Account = () => {
    const accountSections = [
        { path: '/account/profile', name: 'Profile', icon: User, description: 'Personal information' },
        { path: '/account/subscription', name: 'Subscription', icon: CreditCard, description: 'Plan and billing' },
        { path: '/account/api-keys', name: 'API Keys', icon: Key, description: 'Manage API access' },
        { path: '/account/security', name: 'Security', icon: Shield, description: 'Password and 2FA' },
        { path: '/account/billing', name: 'Billing', icon: Receipt, description: 'Invoices and payment' },
        { path: '/account/sessions', name: 'Sessions', icon: Monitor, description: 'Active sessions' },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary">Account</h1>
                <p className="text-text-secondary mt-1">Manage your account settings and preferences</p>
            </div>

            <div className="flex gap-6">
                <div className="w-64 shrink-0 space-y-1">
                    {accountSections.map((section) => (
                        <NavLink
                            key={section.path}
                            to={section.path}
                            className={({ isActive }) =>
                                `flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                                    isActive
                                        ? 'bg-primary-500/20 text-primary-500'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                                }`
                            }
                        >
                            <div className="flex items-center gap-3">
                                <section.icon className="w-4 h-4" />
                                <div>
                                    <p className="text-sm font-medium">{section.name}</p>
                                    <p className="text-xs opacity-70">{section.description}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-50" />
                        </NavLink>
                    ))}
                </div>

                <div className="flex-1">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Account;
