import React, { useState } from 'react';
import { cn } from '../../../utils/cn';

export const Slider = ({ 
    label,
    value = 50,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    showValue = true,
    className 
}) => {
    const [localValue, setLocalValue] = useState(value);

    const handleChange = (e) => {
        const newValue = parseInt(e.target.value);
        setLocalValue(newValue);
        onChange?.(newValue);
    };

    const percentage = ((localValue - min) / (max - min)) * 100;

    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <div className="flex justify-between">
                    <label className="text-sm text-text-secondary">{label}</label>
                    {showValue && <span className="text-sm text-text-primary">{localValue}</span>}
                </div>
            )}
            <div className="relative">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localValue}
                    onChange={handleChange}
                    className="w-full h-2 bg-surface-light rounded-lg appearance-none cursor-pointer"
                />
                <div 
                    className="absolute top-0 left-0 h-2 bg-primary-500 rounded-l-lg pointer-events-none"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

Slider.displayName = 'Slider';
export default Slider;
