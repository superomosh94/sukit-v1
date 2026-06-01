'use client';

import React, { type ReactNode } from 'react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name?: string;
}

export function RadioGroup({
  options,
  value,
  onChange,
  name,
}: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
            value === option.value
              ? 'border-primary bg-primary/5'
              : 'border-border hover:bg-accent/50'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-0.5 text-primary focus:ring-primary"
          />
          <div>
            <span className="text-sm font-medium">{option.label}</span>
            {option.description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {option.description}
              </p>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}
