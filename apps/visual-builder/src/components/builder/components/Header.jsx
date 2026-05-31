import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Header = ({ 
    logo,
    menuItems = [],
    sticky = false,
    transparent = false,
    className,
    children 
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className={cn(
            'w-full bg-surface border-b border-border',
            sticky && 'sticky top-0 z-40',
            transparent && 'bg-transparent border-none',
            className
        )}>
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center">
                    {logo ? (
                        <img src={logo} alt="Logo" className="h-8 w-auto" />
                    ) : (
                        <span className="text-xl font-bold text-text-primary">Logo</span>
                    )}
                </div>

                {/* Desktop Menu */}
                <nav className="hidden md:flex items-center gap-6">
                    {menuItems.map((item, idx) => (
                        <a 
                            key={idx}
                            href={item.link}
                            className="text-text-secondary hover:text-text-primary transition-colors"
                        >
                            {item.label}
                        </a>
                    ))}
                    {children}
                </nav>

                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden p-2 rounded-lg hover:bg-surface-light"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-surface border-t border-border p-4">
                    {menuItems.map((item, idx) => (
                        <a 
                            key={idx}
                            href={item.link}
                            className="block py-2 text-text-secondary hover:text-text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            )}
        </header>
    );
};

Header.displayName = 'Header';
export default Header;
