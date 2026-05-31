'use client'

import { useState, useCallback } from 'react'
import { Plus, Eye, Code, Download, Upload } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import FieldPalette from './FieldPalette'
import FieldSettings from './FieldSettings'
import FormPreview from './FormPreview'
import type { FormField } from './FieldSettings'

interface FormBuilderProps {
  form: {
    id: string
    name: string
    fields: FormField[]
    settings: Record<string, unknown>
  }
  onChange: (form: FormBuilderProps['form']) => void
}

export default function FormBuilder({ form, onChange }: FormBuilderProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [showPalette, setShowPalette] = useState(false)
  const [view, setView] = useState<'design' | 'preview'>('design')

  const selectedField = form.fields.find((f) => f.id === selectedFieldId) || null

  const addField = useCallback(
    (type: string) => {
      const newField: FormField = {
        id: crypto.randomUUID(),
        type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        placeholder: '',
        required: false,
        options: ['select', 'radio', 'checkbox'].includes(type)
          ? [{ label: 'Option 1', value: 'option1' }]
          : undefined,
      }
      onChange({ ...form, fields: [...form.fields, newField] })
      setSelectedFieldId(newField.id)
      setShowPalette(false)
    },
    [form, onChange],
  )

  const updateField = useCallback(
    (updates: Partial<FormField>) => {
      if (!selectedFieldId) return
      onChange({
        ...form,
        fields: form.fields.map((f) =>
          f.id === selectedFieldId ? { ...f, ...updates } : f,
        ),
      })
    },
    [form, onChange, selectedFieldId],
  )

  const deleteField = useCallback(
    (id: string) => {
      onChange({
        ...form,
        fields: form.fields.filter((f) => f.id !== id),
      })
      if (selectedFieldId === id) setSelectedFieldId(null)
    },
    [form, onChange, selectedFieldId],
  )

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(form, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${form.name || 'form'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [form])

  const importJson = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const parsed = JSON.parse(text)
        onChange(parsed)
      } catch {
        alert('Invalid JSON file')
      }
    }
    input.click()
  }, [onChange])

  return (
    <div className="flex h-full gap-4">
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            placeholder="Form Name"
            className="rounded-md border border-input bg-background px-3 py-2 text-lg font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-input">
              <button
                type="button"
                onClick={() => setView('design')}
                className={cn(
                  'rounded-l-md px-3 py-2 text-sm',
                  view === 'design'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground',
                )}
              >
                <Eye className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setView('preview')}
                className={cn(
                  'rounded-r-md px-3 py-2 text-sm',
                  view === 'preview'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground',
                )}
              >
                <Code className="size-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={importJson}
              className="rounded-md border border-input p-2 text-muted-foreground hover:bg-accent"
            >
              <Upload className="size-4" />
            </button>
            <button
              type="button"
              onClick={exportJson}
              className="rounded-md border border-input p-2 text-muted-foreground hover:bg-accent"
            >
              <Download className="size-4" />
            </button>
          </div>
        </div>

        {view === 'preview' ? (
          <div className="rounded-lg border bg-card p-6">
            <FormPreview fields={form.fields} settings={form.settings} />
          </div>
        ) : (
          <div className="space-y-2">
            {form.fields.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-muted-foreground">
                <p className="mb-4 text-sm">No fields yet</p>
                <button
                  type="button"
                  onClick={() => setShowPalette(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  <Plus className="size-4" />
                  Add Field
                </button>
              </div>
            )}
            {form.fields.map((field) => (
              <div
                key={field.id}
                onClick={() => setSelectedFieldId(field.id)}
                className={cn(
                  'cursor-pointer rounded-lg border bg-card p-4 transition-colors hover:border-primary/50',
                  selectedFieldId === field.id && 'border-primary ring-1 ring-primary',
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{field.label}</span>
                    <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {field.type}
                    </span>
                    {field.required && (
                      <span className="ml-1 text-xs text-destructive">required</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteField(field.id)
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            {form.fields.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPalette(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed p-3 text-sm text-muted-foreground hover:border-primary hover:text-primary"
              >
                <Plus className="size-4" />
                Add Field
              </button>
            )}
          </div>
        )}
      </div>

      <div className="w-80 space-y-4">
        {showPalette && (
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">Field Types</h3>
              <button
                type="button"
                onClick={() => setShowPalette(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            <FieldPalette onAddField={addField} />
          </div>
        )}

        {selectedField && (
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">Field Settings</h3>
              <button
                type="button"
                onClick={() => setSelectedFieldId(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            <FieldSettings field={selectedField} onChange={updateField} />
          </div>
        )}
      </div>
    </div>
  )
}
