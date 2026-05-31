import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown, ChevronRight, Home, ChevronLeft, ChevronRight as ChevronRightIcon, ArrowUp, X, Menu as MenuIcon } from 'lucide-react';

export const Menu = ({ items = [], orientation = 'horizontal', variant = 'default', className, ...props }) => {
    const [openSubmenu, setOpenSubmenu] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const variantClasses = { default: 'bg-surface border-b border-border', dark: 'bg-background text-text-primary', transparent: 'bg-transparent' };
    const orientationClasses = { horizontal: 'items-center space-x-1', vertical: 'flex-col space-y-1' };
    const renderItem = (item, depth = 0) => {
        const hasChildren = item.children?.length > 0;
        const isOpen = openSubmenu === item.id;
        return (
            <div key={item.id} className="relative">
                <button onClick={() => { if (hasChildren) setOpenSubmenu(isOpen ? null : item.id); item.onClick?.(); }}
                    className={cn('flex items-center gap-1 px-4 py-2 text-sm transition-colors w-full text-left rounded', depth > 0 && 'pl-8',
                        variant === 'dark' ? 'hover:bg-surface-light text-text-secondary hover:text-text-primary' : 'hover:bg-surface-light text-text-secondary hover:text-text-primary')}>
                    {item.icon && <span>{item.icon}</span>}{item.label}{hasChildren && (orientation === 'horizontal' ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                </button>
                {hasChildren && isOpen && (
                    <div className={cn(orientation === 'horizontal' ? 'absolute top-full left-0 mt-1 bg-surface border border-border rounded-lg shadow-lg min-w-48 z-50' : 'ml-4')}>
                        {item.children.map(child => renderItem(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };
    return (
        <nav className={cn(variantClasses[variant], className)} {...props}>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-text-secondary hover:text-text-primary">
                {mobileOpen ? <X size={18} /> : <MenuIcon size={18} />}
            </button>
            <div className={cn('hidden md:flex', orientationClasses[orientation])}>{items.map(item => renderItem(item))}</div>
            {mobileOpen && <div className="md:hidden absolute top-full left-0 right-0 bg-surface shadow-lg z-50 border-t border-border">{items.map(item => renderItem(item))}</div>}
        </nav>
    );
};

export const MegaMenu = ({ items = [], className, ...props }) => {
    const [activeItem, setActiveItem] = useState(null);
    return (
        <div className={cn('relative', className)} {...props}>
            <div className="flex space-x-1">
                {items.map(item => (
                    <div key={item.id} onMouseEnter={() => setActiveItem(item.id)} onMouseLeave={() => setActiveItem(null)} className="relative">
                        <button className="px-4 py-2 text-sm hover:bg-surface-light rounded text-text-secondary hover:text-text-primary">{item.label}</button>
                        {activeItem === item.id && item.megaMenu && (
                            <div className="absolute top-full left-0 mt-1 w-screen max-w-4xl bg-surface border border-border rounded-lg shadow-xl z-50 p-6">
                                <div className="grid grid-cols-4 gap-6">
                                    {item.megaMenu.columns.map((col, i) => (
                                        <div key={i}><h4 className="font-semibold mb-3 text-text-primary">{col.title}</h4>
                                            <ul className="space-y-2">{col.items.map((sub, j) => <li key={j}><a href={sub.href} className="text-sm text-text-secondary hover:text-primary-500">{sub.label}</a></li>)}</ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const Breadcrumb = ({ items = [], separator = '/', className, ...props }) => (
    <nav className={cn('flex items-center space-x-2 text-sm', className)} {...props}>
        <a href="/" className="text-text-secondary hover:text-text-primary"><Home size={14} /></a>
        {items.map((item, i) => (<React.Fragment key={i}><span className="text-text-secondary">{separator}</span>{item.href ? <a href={item.href} className="text-text-secondary hover:text-text-primary">{item.label}</a> : <span className="text-text-primary font-medium">{item.label}</span>}</React.Fragment>))}
    </nav>
);

export const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange, showFirstLast = true, siblingCount = 1, className, ...props }) => {
    const getPages = () => {
        const total = siblingCount * 2 + 3;
        if (totalPages <= total + 2) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const left = Math.max(currentPage - siblingCount, 1), right = Math.min(currentPage + siblingCount, totalPages);
        const showLeft = left > 2, showRight = right < totalPages - 1;
        if (!showLeft && showRight) return [...Array(3 + 2 * siblingCount).keys()].map(x => x + 1).concat(['...', totalPages]);
        if (showLeft && !showRight) return [1, '...', ...Array.from({ length: 3 + 2 * siblingCount }, (_, i) => totalPages - (3 + 2 * siblingCount) + i + 1)];
        return [1, '...', ...Array.from({ length: right - left + 1 }, (_, i) => left + i), '...', totalPages];
    };
    const pages = getPages();
    return (
        <div className={cn('flex items-center gap-1', className)} {...props}>
            {showFirstLast && <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="p-2 rounded border border-border disabled:opacity-50 hover:bg-surface-light text-text-secondary">«</button>}
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded border border-border disabled:opacity-50 hover:bg-surface-light text-text-secondary"><ChevronLeft size={16} /></button>
            {pages.map((p, i) => p === '...' ? <span key={i} className="px-2 text-text-secondary">...</span> : <button key={i} onClick={() => onPageChange(p)} className={cn('px-3 py-1 rounded transition-colors', currentPage === p ? 'bg-primary-500 text-white' : 'border border-border hover:bg-surface-light text-text-secondary')}>{p}</button>)}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded border border-border disabled:opacity-50 hover:bg-surface-light text-text-secondary"><ChevronRightIcon size={16} /></button>
            {showFirstLast && <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded border border-border disabled:opacity-50 hover:bg-surface-light text-text-secondary">»</button>}
        </div>
    );
};

export const BackToTop = ({ threshold = 300, position = 'bottom-right', className, ...props }) => {
    const [visible, setVisible] = useState(false);
    React.useEffect(() => { const toggle = () => setVisible(window.pageYOffset > threshold); window.addEventListener('scroll', toggle); return () => window.removeEventListener('scroll', toggle); }, [threshold]);
    const positions = { 'bottom-right': 'bottom-4 right-4', 'bottom-left': 'bottom-4 left-4', 'top-right': 'top-4 right-4', 'top-left': 'top-4 left-4' };
    if (!visible) return null;
    return <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={cn('fixed p-3 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-all z-50', positions[position], className)} {...props}><ArrowUp size={20} /></button>;
};

export const SocialIcons = ({ links = {}, variant = 'default', size = 'md', className, ...props }) => {
    const config = {
        twitter: { label: '𝕏', color: '#1DA1F2' },
        facebook: { label: 'f', color: '#4267B2' },
        instagram: { label: 'ig', color: '#E4405F' },
        linkedin: { label: 'in', color: '#0077B5' },
        github: { label: 'gh', color: '#333' },
        youtube: { label: 'yt', color: '#FF0000' },
        tiktok: { label: 'tk', color: '#000' },
        pinterest: { label: 'pt', color: '#BD081C' }
    };
    const sizeClasses = { sm: 'w-6 h-6 text-sm', md: 'w-8 h-8 text-base', lg: 'w-10 h-10 text-lg' };
    const variantClasses = { default: 'bg-surface hover:bg-surface-light', outline: 'border border-border hover:bg-surface-light', ghost: 'hover:bg-surface-light' };
    const active = Object.entries(config).filter(([k]) => links[k]);
    if (active.length === 0) return null;
    return <div className={cn('flex gap-2', className)} {...props}>{active.map(([platform, cfg]) => (
        <a key={platform} href={links[platform]} target="_blank" rel="noopener noreferrer"
            className={cn('flex items-center justify-center rounded-full transition-all font-bold', sizeClasses[size], variantClasses[variant], variant === 'default' ? 'text-text-secondary' : '')}
            style={variant !== 'default' ? { color: cfg.color } : {}}>
            <span className="leading-none">{cfg.label}</span>
        </a>
    ))}</div>;
};
