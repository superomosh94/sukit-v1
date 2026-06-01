'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  label?: string;
}

export function DatePicker({ value, onChange, label }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = value ? new Date(value) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const daysInMonth = new Date(
    currentMonth.year,
    currentMonth.month + 1,
    0
  ).getDate();
  const firstDay = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    if (currentMonth.month === 0)
      setCurrentMonth({ year: currentMonth.year - 1, month: 11 });
    else setCurrentMonth({ ...currentMonth, month: currentMonth.month - 1 });
  };
  const nextMonth = () => {
    if (currentMonth.month === 11)
      setCurrentMonth({ year: currentMonth.year + 1, month: 0 });
    else setCurrentMonth({ ...currentMonth, month: currentMonth.month + 1 });
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm bg-background border border-border rounded-md hover:bg-accent transition-colors"
      >
        <Calendar size={14} className="text-muted-foreground" />
        <span>
          {value ? new Date(value).toLocaleDateString() : 'Pick a date'}
        </span>
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-xl z-50 p-3 w-64">
          <div className="flex items-center justify-between mb-2">
            <button onClick={prevMonth} className="p-1 rounded hover:bg-accent">
              &lt;
            </button>
            <span className="text-sm font-medium">
              {monthNames[currentMonth.month]} {currentMonth.year}
            </span>
            <button onClick={nextMonth} className="p-1 rounded hover:bg-accent">
              &gt;
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="py-0.5">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {days.map((day) => {
              const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = value === dateStr;
              return (
                <button
                  key={day}
                  onClick={() => {
                    onChange(dateStr);
                    setOpen(false);
                  }}
                  className={`text-sm p-1 rounded hover:bg-accent transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
