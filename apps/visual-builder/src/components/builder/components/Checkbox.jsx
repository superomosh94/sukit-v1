import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Checkbox = ({ 
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
        <label className={cn('flex items-start gap-2 cursor-pointer group', className)}>
            <div className="relative mt-0.5">
                <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    value={value}
                    required={required}
                    className="sr-only"
                />
                <div className={cn(
                    'w-4 h-4 rounded border transition-all flex items-center justify-center',
                    checked ? 'bg-primary-500 border-primary-500' : 'border-border bg-surface group-hover:border-primary-500',
                    error && 'border-danger-500'
                )}>
                    {checked && <Check className="w-3 h-3 text-white" />}
                </div>
            </div>
            {label && <span className="text-sm text-text-primary">{label}</span>}
        </label>
    );
};

Checkbox.displayName = 'Checkbox';
export default Checkbox;
