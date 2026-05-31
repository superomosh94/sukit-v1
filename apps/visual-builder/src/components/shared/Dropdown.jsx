import React, { useState, useRef, useEffect } from 'react';

export const Dropdown = ({ label, options = [], selected, onChange, className = '' }) => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(!open);
  const ref = useRef();
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      <button onClick={toggle} className="px-4 py-2 border rounded bg-surface border-border text-text-primary">
        {selected ? selected.label : label} ▼
      </button>
      {open && (
        <ul className="absolute left-0 mt-1 w-full bg-surface border border-border rounded shadow-lg z-10">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => { onChange(opt); setOpen(false); }}
              className="px-4 py-2 hover:bg-surface-light cursor-pointer text-text-primary"
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
