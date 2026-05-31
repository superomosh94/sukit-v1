'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { FormField } from './FieldSettings'

interface FormPreviewProps {
  fields: FormField[]
  settings?: Record<string, unknown>
}

export default function FormPreview({ fields, settings }: FormPreviewProps) {
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    try {
      await new Promise((r) => setTimeout(r, 1500))
      setStatus('success')
      setValues({})
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === 'success' && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          <CheckCircle2 className="size-4" />
          Form submitted successfully!
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <AlertCircle className="size-4" />
          Something went wrong. Please try again.
        </div>
      )}

      {fields.map((field) => (
        <div key={field.id} className="space-y-1.5">
          <label className="text-sm font-medium">
            {field.label}
            {field.required && <span className="ml-1 text-destructive">*</span>}
          </label>

          {field.type === 'textarea' ? (
            <textarea
              placeholder={field.placeholder}
              required={field.required}
              value={(values[field.id] as string) || ''}
              onChange={(e) =>
                setValues((v) => ({ ...v, [field.id]: e.target.value }))
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[80px]"
            />
          ) : field.type === 'select' ? (
            <select
              required={field.required}
              value={(values[field.id] as string) || ''}
              onChange={(e) =>
                setValues((v) => ({ ...v, [field.id]: e.target.value }))
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select...</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : field.type === 'radio' ? (
            <div className="space-y-1">
              {field.options?.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={field.id}
                    value={opt.value}
                    checked={values[field.id] === opt.value}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field.id]: e.target.value }))
                    }
                    className="text-primary"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          ) : field.type === 'checkbox' ? (
            <div className="space-y-1">
              {field.options?.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={
                      ((values[field.id] as string[]) || []).includes(opt.value)
                    }
                    onChange={(e) => {
                      const current = (values[field.id] as string[]) || []
                      const next = e.target.checked
                        ? [...current, opt.value]
                        : current.filter((v) => v !== opt.value)
                      setValues((v) => ({ ...v, [field.id]: next }))
                    }}
                    className="rounded border-input"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          ) : field.type === 'color' ? (
            <input
              type="color"
              value={(values[field.id] as string) || '#000000'}
              onChange={(e) =>
                setValues((v) => ({ ...v, [field.id]: e.target.value }))
              }
              className="h-10 w-full rounded-md border border-input bg-background p-1"
            />
          ) : field.type === 'file' ? (
            <input
              type="file"
              required={field.required}
              onChange={(e) =>
                setValues((v) => ({ ...v, [field.id]: e.target.files?.[0] }))
              }
              className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:text-primary-foreground"
            />
          ) : (
            <input
              type={field.type}
              placeholder={field.placeholder}
              required={field.required}
              value={(values[field.id] as string) || ''}
              onChange={(e) =>
                setValues((v) => ({ ...v, [field.id]: e.target.value }))
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          )}

          {field.helperText && (
            <p className="text-xs text-muted-foreground">{field.helperText}</p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50',
        )}
      >
        {status === 'submitting' && <Loader2 className="size-4 animate-spin" />}
        {settings?.submitLabel || 'Submit'}
      </button>
    </form>
  )
}
