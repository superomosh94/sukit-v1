import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Textarea = ({ 
    label,
    name,
    placeholder,
    value,
    onChange,
    rows = 4,
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
            <textarea
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                rows={rows}
                required={required}
                className={cn(
                    'w-full px-3 py-2 bg-surface border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 transition-all resize-y',
                    error ? 'border-danger-500 focus:ring-danger-500' : 'border-border focus:ring-primary-500'
                )}
            />
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

Textarea.displayName = 'Textarea';
export default Textarea;
