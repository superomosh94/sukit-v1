import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Menu, X } from 'lucide-react';

export const Header = ({ 
    children,
    variant = 'default',
    sticky = false,
    transparent = false,
    mobileMenuBreakpoint = 'md',
    className,
    ...props 
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    const variantClasses = {
        default: 'bg-surface border-b border-border',
        glass: 'bg-surface/80 backdrop-blur-md border-b border-border/50',
        minimal: 'bg-transparent',
    };
    
    const stickyClasses = sticky ? 'sticky top-0 z-50' : '';
    const transparentClasses = transparent ? 'bg-transparent border-transparent' : '';
    
    const breakpointClasses = {
        sm: 'md:hidden',
        md: 'lg:hidden',
        lg: 'xl:hidden',
        xl: '2xl:hidden',
    };
    
    return (
        <header
            className={cn(
                'w-full transition-all duration-300',
                variantClasses[variant],
                stickyClasses,
                transparentClasses,
                className
            )}
            {...props}
        >
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex-shrink-0">
                        {children?.logo}
                    </div>
                    
                    <nav className="hidden md:flex items-center space-x-6">
                        {children?.nav}
                    </nav>
                    
                    <div className="hidden md:flex items-center space-x-4">
                        {children?.actions}
                    </div>
                    
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={cn('md:hidden p-2 rounded-lg', breakpointClasses[mobileMenuBreakpoint])}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
                
                {mobileMenuOpen && (
                    <div className={cn('md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-800', breakpointClasses[mobileMenuBreakpoint])}>
                        <nav className="flex flex-col space-y-3">
                            {children?.mobileNav || children?.nav}
                        </nav>
                        <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                            {children?.mobileActions || children?.actions}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export const Footer = ({ 
    children,
    variant = 'default',
    columns = 4,
    className,
    ...props 
}) => {
    const variantClasses = {
        default: 'bg-background text-text-primary',
        light: 'bg-surface-light text-text-primary',
        minimal: 'bg-transparent border-t border-gray-200 dark:border-gray-800',
    };
    
    const columnClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };
    
    return (
        <footer className={cn('w-full mt-auto', variantClasses[variant], className)} {...props}>
            <div className="container mx-auto px-4 py-12">
                <div className={cn('grid gap-8', columnClasses[columns])}>
                    {children?.columns}
                </div>
                <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
                    {children?.copyright || '© 2024 All rights reserved.'}
                </div>
            </div>
        </footer>
    );
};

export const Sidebar = ({ 
    children,
    position = 'left',
    width = 320,
    collapsed = false,
    collapsible = true,
    onCollapse,
    className,
    ...props 
}) => {
    const [isCollapsed, setIsCollapsed] = useState(collapsed);
    
    const handleCollapse = () => {
        setIsCollapsed(!isCollapsed);
        onCollapse?.(!isCollapsed);
    };
    
    const positionClasses = {
        left: 'left-0 border-r',
        right: 'right-0 border-l',
    };
    
    return (
        <aside
            className={cn(
                'fixed top-0 h-full bg-surface transition-all duration-300 z-40',
                positionClasses[position],
                isCollapsed ? 'w-16' : `w-[${width}px]`,
                className
            )}
            style={{ width: isCollapsed ? 64 : width }}
            {...props}
        >
            <div className="h-full overflow-y-auto">
                {collapsible && (
                    <button
                        onClick={handleCollapse}
                        className="absolute -right-3 top-4 w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center shadow-md"
                    >
                        <span className="text-xs">
                            {isCollapsed ? '→' : '←'}
                        </span>
                    </button>
                )}
                <div className={cn('p-4', isCollapsed && 'p-2')}>
                    {children}
                </div>
            </div>
        </aside>
    );
};

export const Divider = ({ 
    orientation = 'horizontal',
    thickness = 1,
    color = 'gray-200',
    spacing = 4,
    dashed = false,
    className,
    ...props 
}) => {
    const orientationClasses = {
        horizontal: 'w-full',
        vertical: 'h-full w-px',
    };
    
    const spacingClasses = {
        0: orientation === 'horizontal' ? 'my-0' : 'mx-0',
        1: orientation === 'horizontal' ? 'my-1' : 'mx-1',
        2: orientation === 'horizontal' ? 'my-2' : 'mx-2',
        3: orientation === 'horizontal' ? 'my-3' : 'mx-3',
        4: orientation === 'horizontal' ? 'my-4' : 'mx-4',
        5: orientation === 'horizontal' ? 'my-5' : 'mx-5',
        6: orientation === 'horizontal' ? 'my-6' : 'mx-6',
        8: orientation === 'horizontal' ? 'my-8' : 'mx-8',
    };
    
    return (
        <div className={cn(orientationClasses[orientation], spacingClasses[spacing], className)} {...props}>
            <div
                className={cn(
                    orientation === 'horizontal' ? 'w-full' : 'h-full',
                    `bg-${color}`,
                    dashed && 'bg-dashed'
                )}
                style={{
                    height: orientation === 'horizontal' ? thickness : '100%',
                    width: orientation === 'vertical' ? thickness : '100%',
                    backgroundImage: dashed ? `repeating-linear-gradient(90deg, currentColor, currentColor ${thickness}px, transparent ${thickness}px, transparent ${thickness * 4}px)` : undefined,
                }}
            />
        </div>
    );
};

export const Spacer = ({ 
    size = 4,
    orientation = 'vertical',
    className,
    ...props 
}) => {
    const sizeClasses = {
        0: orientation === 'vertical' ? 'h-0' : 'w-0',
        1: orientation === 'vertical' ? 'h-1' : 'w-1',
        2: orientation === 'vertical' ? 'h-2' : 'w-2',
        3: orientation === 'vertical' ? 'h-3' : 'w-3',
        4: orientation === 'vertical' ? 'h-4' : 'w-4',
        5: orientation === 'vertical' ? 'h-5' : 'w-5',
        6: orientation === 'vertical' ? 'h-6' : 'w-6',
        8: orientation === 'vertical' ? 'h-8' : 'w-8',
        10: orientation === 'vertical' ? 'h-10' : 'w-10',
        12: orientation === 'vertical' ? 'h-12' : 'w-12',
        16: orientation === 'vertical' ? 'h-16' : 'w-16',
        20: orientation === 'vertical' ? 'h-20' : 'w-20',
        24: orientation === 'vertical' ? 'h-24' : 'w-24',
    };
    
    return <div className={cn(sizeClasses[size], className)} {...props} />;
};

export const Stack = ({ 
    children,
    direction = 'vertical',
    spacing = 4,
    align = 'stretch',
    justify = 'start',
    className,
    ...props 
}) => {
    const directionClasses = {
        vertical: 'flex-col',
        horizontal: 'flex-row',
    };
    
    const spacingClasses = {
        0: direction === 'vertical' ? 'space-y-0' : 'space-x-0',
        1: direction === 'vertical' ? 'space-y-1' : 'space-x-1',
        2: direction === 'vertical' ? 'space-y-2' : 'space-x-2',
        3: direction === 'vertical' ? 'space-y-3' : 'space-x-3',
        4: direction === 'vertical' ? 'space-y-4' : 'space-x-4',
        5: direction === 'vertical' ? 'space-y-5' : 'space-x-5',
        6: direction === 'vertical' ? 'space-y-6' : 'space-x-6',
        8: direction === 'vertical' ? 'space-y-8' : 'space-x-8',
    };
    
    const alignClasses = {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
    };
    
    const justifyClasses = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
    };
    
    return (
        <div
            className={cn(
                'flex',
                directionClasses[direction],
                spacingClasses[spacing],
                alignClasses[align],
                justifyClasses[justify],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
