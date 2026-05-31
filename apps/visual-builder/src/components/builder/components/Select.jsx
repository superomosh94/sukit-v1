import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Select = ({ 
    label,
    name,
    options = [],
    value,
    onChange,
    placeholder = 'Select an option',
    required = false,
    error,
    helper,
    className 
}) => {
    return (
        <div className={cn('space-y-1', className)}>
            {label && (
                <label className="block text-sm font-medium text-text-primary">
                    {label}
                    {required && <span className="text-danger-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={cn(
                        'w-full px-3 py-2 bg-surface border rounded-lg text-text-primary appearance-none focus:outline-none focus:ring-2 transition-all',
                        error ? 'border-danger-500 focus:ring-danger-500' : 'border-border focus:ring-primary-500'
                    )}
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            </div>
            {error && (
                <div className="flex items-center gap-1 text-danger-500 text-sm">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </div>
            )}
            {helper && !error && (
                <p className="text-xs text-text-secondary">{helper}</p>
            )}
        </div>
    );
};

Select.displayName = 'Select';
export default Select;
