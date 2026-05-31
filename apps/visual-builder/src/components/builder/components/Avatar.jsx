import React from 'react';
import { User } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Avatar = ({ 
    src, 
    name,
    size = 'md',
    shape = 'circle',
    status = 'offline',
    className 
}) => {
    const sizeClasses = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl',
        '2xl': 'w-20 h-20 text-2xl'
    };

    const shapeClasses = {
        circle: 'rounded-full',
        square: 'rounded-lg',
        rounded: 'rounded-2xl'
    };

    const statusColors = {
        online: 'bg-success-500',
        offline: 'bg-gray-500',
        away: 'bg-warning-500',
        busy: 'bg-danger-500'
    };

    const getInitials = () => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="relative inline-block">
            <div className={cn(
                'flex items-center justify-center bg-primary-500/20 overflow-hidden',
                sizeClasses[size],
                shapeClasses[shape],
                className
            )}>
                {src ? (
                    <img src={src} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-primary-500 font-medium">
                        {name ? getInitials() : <User className="w-1/2 h-1/2" />}
                    </span>
                )}
            </div>
            {status !== 'offline' && (
                <span className={cn(
                    'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white',
                    statusColors[status]
                )} />
            )}
        </div>
    );
};

Avatar.displayName = 'Avatar';
export default Avatar;
