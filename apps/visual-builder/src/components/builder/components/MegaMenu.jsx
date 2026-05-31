import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const MegaMenu = ({ 
    items = [], 
    className 
}) => {
    const [activeMenu, setActiveMenu] = useState(null);

    return (
        <div className={cn('relative', className)}>
            {/* Menu Bar */}
            <div className="flex items-center gap-1 bg-surface border border-border rounded-lg">
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        onMouseEnter={() => setActiveMenu(idx)}
                        onMouseLeave={() => setActiveMenu(null)}
                        className="relative"
                    >
                        <button className="flex items-center gap-1 px-4 py-2 text-text-secondary hover:text-text-primary transition-colors">
                            {item.label}
                            {item.columns && <ChevronDown className="w-4 h-4" />}
                        </button>
                        
                        {activeMenu === idx && item.columns && (
                            <div className="absolute top-full left-0 mt-1 w-screen max-w-4xl bg-surface border border-border rounded-lg shadow-xl z-50 p-6">
                                <div className="grid grid-cols-4 gap-6">
                                    {item.columns.map((column, colIdx) => (
                                        <div key={colIdx}>
                                            <h4 className="font-semibold text-text-primary mb-3">{column.title}</h4>
                                            <ul className="space-y-2">
                                                {column.links.map((link, linkIdx) => (
                                                    <li key={linkIdx}>
                                                        <a href={link.url} className="text-sm text-text-secondary hover:text-primary-500 transition-colors">
                                                            {link.label}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                                {item.featured && (
                                    <div className="mt-6 pt-6 border-t border-border">
                                        <div className="flex items-center gap-4">
                                            <img src={item.featured.image} alt={item.featured.title} className="w-16 h-16 rounded-lg object-cover" />
                                            <div>
                                                <h4 className="font-semibold text-text-primary">{item.featured.title}</h4>
                                                <p className="text-sm text-text-secondary">{item.featured.description}</p>
                                                <a href={item.featured.link} className="text-sm text-primary-500 hover:underline mt-1 inline-block">
                                                    Learn More →
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

MegaMenu.displayName = 'MegaMenu';
export default MegaMenu;
