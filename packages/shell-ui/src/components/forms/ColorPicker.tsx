'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const presetColors = [
  '#000000',
  '#ffffff',
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#ff5722',
];

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [hex, setHex] = useState(value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(!open)}
          className="w-8 h-8 rounded-md border border-border cursor-pointer"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={hex}
          onChange={(e) => {
            setHex(e.target.value);
            onChange(e.target.value);
          }}
          className="flex-1 px-3 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring font-mono"
        />
      </div>
      {open && (
        <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-xl z-50 p-3 w-56">
          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onChange(color);
                  setHex(color);
                }}
                className={`w-7 h-7 rounded-md border ${value === color ? 'border-primary ring-1 ring-primary' : 'border-border'} cursor-pointer`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setHex(e.target.value);
              }}
              className="w-8 h-8 p-0.5 rounded cursor-pointer"
            />
            <input
              type="text"
              value={hex}
              onChange={(e) => {
                setHex(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="#000000"
              className="flex-1 px-2 py-1 text-xs font-mono bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      )}
    </div>
  );
}
