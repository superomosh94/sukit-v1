'use client';

import type { Block } from '../types';
import { useState, type FormEvent } from 'react';

interface FormField {
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface FormBlockProps {
  block: Block;
}

export default function FormBlock({ block }: FormBlockProps) {
  const { props } = block;

  const fields = (props.fields as FormField[]) || [];
  const submitText = (props.submitText as string) || 'Submit';

  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (label: string, value: string) => {
    setValues((prev) => ({ ...prev, [label]: value }));
    if (errors[label]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[label];
        return next;
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    for (const field of fields) {
      if (field.required && !values[field.label]?.trim()) {
        newErrors[field.label] = `${field.label} is required`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: 'center',
          color: '#059669',
          background: '#ecfdf5',
          borderRadius: 8,
        }}
      >
        Thank you! Your submission has been received.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {fields.map((field) => (
        <div
          key={field.label}
          style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          <label style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
            {field.label}
            {field.required && (
              <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>
            )}
          </label>

          {field.type === 'textarea' ? (
            <textarea
              placeholder={field.placeholder}
              required={field.required}
              value={values[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${errors[field.label] ? '#ef4444' : '#d1d5db'}`,
                borderRadius: 6,
                fontSize: 14,
                minHeight: 80,
                resize: 'vertical',
              }}
            />
          ) : field.type === 'select' && field.options ? (
            <select
              required={field.required}
              value={values[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${errors[field.label] ? '#ef4444' : '#d1d5db'}`,
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              <option value="">Select...</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={
                field.type === 'email'
                  ? 'email'
                  : field.type === 'number'
                    ? 'number'
                    : 'text'
              }
              placeholder={field.placeholder}
              required={field.required}
              value={values[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${errors[field.label] ? '#ef4444' : '#d1d5db'}`,
                borderRadius: 6,
                fontSize: 14,
              }}
            />
          )}

          {errors[field.label] && (
            <span style={{ color: '#ef4444', fontSize: 12 }}>
              {errors[field.label]}
            </span>
          )}
        </div>
      ))}

      <button
        type="submit"
        style={{
          padding: '10px 22px',
          background: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {submitText}
      </button>
    </form>
  );
}
