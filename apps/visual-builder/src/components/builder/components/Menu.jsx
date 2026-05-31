import React, { useState } from 'react';
import { ChevronDown, Menu as MenuIcon, X } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Menu = ({ 
    items = [], 
    orientation = 'horizontal',
    mobileBreakpoint = 'md',
    className 
}) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    const renderMenuItem = (item, index, isMobile = false) => {
        const hasChildren = item.children && item.children.length > 0;
        
        if (hasChildren) {
            return (
                <div key={index} className="relative group">
                    <button
                        onClick={() => isMobile && setOpenDropdown(openDropdown === index ? null : index)}
                        className="flex items-center gap-1 px-3 py-2 text-text-secondary hover:text-text-primary transition-colors"
                    >
                        {item.label}
                        <ChevronDown className={cn(
                            'w-4 h-4 transition-transform',
                            openDropdown === index && 'rotate-180'
                        )} />
                    </button>
                    <div className={cn(
                        'bg-surface border border-border rounded-lg shadow-lg z-50',
                        isMobile ? 'relative mt-1 ml-4' : 'absolute top-full left-0 mt-1 min-w-[200px] hidden group-hover:block'
                    )}>
                        {item.children.map((child, childIdx) => (
                            <a
                                key={childIdx}
                                href={child.link}
                                className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface-light hover:text-text-primary transition-colors"
                            >
                                {child.label}
                            </a>
                        ))}
                    </div>
                </div>
            );
        }
        
        return (
            <a
                key={index}
                href={item.link}
                className="px-3 py-2 text-text-secondary hover:text-text-primary transition-colors"
            >
                {item.label}
            </a>
        );
    };

    return (
        <>
            {/* Desktop Menu */}
            <nav className={cn(
                'hidden',
                orientation === 'horizontal' ? `${mobileBreakpoint}:flex items-center gap-2` : `${mobileBreakpoint}:flex flex-col gap-2`,
                className
            )}>
                {items.map((item, idx) => renderMenuItem(item, idx, false))}
            </nav>

            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={cn(`${mobileBreakpoint}:hidden p-2 rounded-lg hover:bg-surface-light`)}
            >
                {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className={cn(`${mobileBreakpoint}:hidden absolute top-full left-0 right-0 bg-surface border-b border-border shadow-lg z-50 p-4`)}>
                    <nav className="flex flex-col gap-2">
                        {items.map((item, idx) => renderMenuItem(item, idx, true))}
                    </nav>
                </div>
            )}
        </>
    );
};

Menu.displayName = 'Menu';
export default Menu;
