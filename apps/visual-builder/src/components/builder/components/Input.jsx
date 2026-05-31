import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const Input = ({ 
    label,
    name,
    type = 'text',
    placeholder,
    value,
    onChange,
    required = false,
    error,
    helper,
    className 
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
        <div className={cn('space-y-1', className)}>
            {label && (
                <label className="block text-sm font-medium text-text-primary">
                    {label}
                    {required && <span className="text-danger-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    type={inputType}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={cn(
                        'w-full px-3 py-2 bg-surface border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 transition-all',
                        error ? 'border-danger-500 focus:ring-danger-500' : 'border-border focus:ring-primary-500'
                    )}
                />
                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
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

Input.displayName = 'Input';
export default Input;
