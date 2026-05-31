import React from 'react';
import { cn } from '../../../utils/cn';

export const Switch = ({ 
    label,
    checked = false,
    onChange,
    disabled = false,
    className 
}) => {
    return (
        <label className={cn('flex items-center justify-between cursor-pointer group', className)}>
            {label && <span className="text-sm text-text-primary">{label}</span>}
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => !disabled && onChange?.(!checked)}
                className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    checked ? 'bg-primary-500' : 'bg-surface-light',
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
            >
                <span className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-text-primary transition-transform',
                    checked ? 'translate-x-6' : 'translate-x-1'
                )} />
            </button>
        </label>
    );
};

Switch.displayName = 'Switch';
export default Switch;
