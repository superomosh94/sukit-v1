import React from 'react';
import { cn } from '../../../utils/cn';

export const Radio = ({ 
    label,
    name,
    checked = false,
    onChange,
    value,
    required = false,
    error,
    className 
}) => {
    return (
        <label className={cn('flex items-center gap-2 cursor-pointer group', className)}>
            <div className="relative mt-0.5">
                <input
                    type="radio"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    value={value}
                    required={required}
                    className="sr-only"
                />
                <div className={cn(
                    'w-4 h-4 rounded-full border transition-all flex items-center justify-center',
                    checked ? 'border-primary-500' : 'border-border bg-surface group-hover:border-primary-500',
                    error && 'border-danger-500'
                )}>
                    {checked && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                </div>
            </div>
            {label && <span className="text-sm text-text-primary">{label}</span>}
        </label>
    );
};

Radio.displayName = 'Radio';
export default Radio;
