import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const DatePicker = ({ 
    label,
    value,
    onChange,
    min,
    max,
    required = false,
    error,
    className 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString();
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        
        // Add empty cells for days before first day of month
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }
        
        // Add days of month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }
        
        return days;
    };

    const handleDateSelect = (date) => {
        onChange?.(date.toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const changeMonth = (delta) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));
    };

    const isDateDisabled = (date) => {
        if (!date) return true;
        if (min && date < new Date(min)) return true;
        if (max && date > new Date(max)) return true;
        return false;
    };

    const isSelected = (date) => {
        if (!value || !date) return false;
        return date.toDateString() === new Date(value).toDateString();
    };

    return (
        <div className={cn('space-y-1 relative', className)} ref={pickerRef}>
            {label && (
                <label className="block text-sm font-medium text-text-primary">
                    {label}
                    {required && <span className="text-danger-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    type="text"
                    value={formatDate(value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Select date"
                    readOnly
                    className={cn(
                        'w-full px-3 py-2 bg-surface border rounded-lg text-text-primary cursor-pointer',
                        error ? 'border-danger-500' : 'border-border'
                    )}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            </div>
            
            {isOpen && (
                <div className="absolute top-full mt-1 z-50 bg-surface border border-border rounded-lg shadow-lg p-4 w-64">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => changeMonth(-1)} className="p-1 rounded hover:bg-surface-light">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-text-primary">
                            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={() => changeMonth(1)} className="p-1 rounded hover:bg-surface-light">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-secondary mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day}>{day}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(viewDate).map((date, idx) => (
                            <button
                                key={idx}
                                onClick={() => date && !isDateDisabled(date) && handleDateSelect(date)}
                                disabled={!date || isDateDisabled(date)}
                                className={cn(
                                    'w-8 h-8 rounded-full text-sm transition-colors',
                                    date && !isDateDisabled(date) && 'hover:bg-primary-500/20 cursor-pointer',
                                    isSelected(date) && 'bg-primary-500 text-white',
                                    !date && 'invisible'
                                )}
                            >
                                {date?.getDate()}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {error && <p className="text-xs text-danger-500">{error}</p>}
        </div>
    );
};

DatePicker.displayName = 'DatePicker';
export default DatePicker;
