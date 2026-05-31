'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface FieldSchema {
  key: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'file' | 'encrypted'
  required?: boolean
  placeholder?: string
  options?: { label: string; value: string }[]
  defaultValue?: unknown
}

interface ModuleSettingsProps {
  moduleId: string
  schema: FieldSchema[]
  settings: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  onSave: () => void
}

export default function ModuleSettings({
  moduleId,
  schema,
  settings,
  onChange,
  onSave,
}: ModuleSettingsProps) {
  const [saving, setSaving] = useState(false)
  const [showEncrypted, setShowEncrypted] = useState<Set<string>>(new Set())

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Module Settings</h2>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          Save
        </button>
      </div>

      <div className="space-y-4">
        {schema.map((field) => (
          <div key={field.key}>
            <label className="flex items-center gap-2 text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive">*</span>}
            </label>

            {field.type === 'boolean' ? (
              <label className="mt-1 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={(settings[field.key] as boolean) || false}
                  onChange={(e) => onChange(field.key, e.target.checked)}
                  className="rounded border-input"
                />
                {field.placeholder || 'Enable'}
              </label>
            ) : field.type === 'select' ? (
              <select
                value={(settings[field.key] as string) || ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select...</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'encrypted' ? (
              <div className="relative mt-1">
                <input
                  type={showEncrypted.has(field.key) ? 'text' : 'password'}
                  value={(settings[field.key] as string) || ''}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowEncrypted((prev) => {
                      const next = new Set(prev)
                      if (next.has(field.key)) next.delete(field.key)
                      else next.add(field.key)
                      return next
                    })
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showEncrypted.has(field.key) ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            ) : field.type === 'file' ? (
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onChange(field.key, file)
                }}
                className="mt-1 w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:text-primary-foreground"
              />
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={(settings[field.key] as string | number) || ''}
                onChange={(e) =>
                  onChange(
                    field.key,
                    field.type === 'number'
                      ? Number(e.target.value)
                      : e.target.value,
                  )
                }
                placeholder={field.placeholder}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
