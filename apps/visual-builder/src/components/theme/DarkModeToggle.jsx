import React from 'react';
import { Moon, Sun } from 'lucide-react';

const DarkModeToggle = ({ isDark, onToggle }) => {
    React.useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                {isDark ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-warning-500" />}
                <h3 className="font-semibold text-text-primary">Dark Mode</h3>
            </div>

            <div className="bg-surface border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-text-primary">Enable Dark Mode</p>
                        <p className="text-sm text-text-secondary mt-1">Switch between light and dark theme</p>
                    </div>
                    <button
                        onClick={onToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isDark ? 'bg-primary-500' : 'bg-surface-light'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-text-primary transition-transform ${
                                isDark ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>

                {isDark && (
                    <div className="mt-4 p-4 bg-background rounded-lg">
                        <p className="text-sm text-text-secondary">Dark mode is enabled. Your theme colors will adjust automatically.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DarkModeToggle;
