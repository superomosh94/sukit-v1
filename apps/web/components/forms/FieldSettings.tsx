'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils/cn'

const optionSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  value: z.string().min(1, 'Value is required'),
})

const fieldSettingsSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  helperText: z.string().optional(),
  options: z.array(optionSchema).optional(),
  validation: z
    .object({
      minLength: z.coerce.number().min(0).optional(),
      maxLength: z.coerce.number().min(0).optional(),
      min: z.coerce.number().optional(),
      max: z.coerce.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
})

type FieldSettingsValues = z.infer<typeof fieldSettingsSchema>

export interface FormField {
  id: string
  type: string
  label: string
  placeholder?: string
  required?: boolean
  helperText?: string
  options?: { label: string; value: string }[]
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
  }
}

interface FieldSettingsProps {
  field: FormField
  onChange: (updates: Partial<FormField>) => void
}

export default function FieldSettings({ field, onChange }: FieldSettingsProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FieldSettingsValues>({
    resolver: zodResolver(fieldSettingsSchema),
    defaultValues: {
      label: field.label,
      placeholder: field.placeholder || '',
      required: field.required || false,
      helperText: field.helperText || '',
      options: field.options || [{ label: '', value: '' }],
      validation: {
        minLength: field.validation?.minLength,
        maxLength: field.validation?.maxLength,
        min: field.validation?.min,
        max: field.validation?.max,
        pattern: field.validation?.pattern,
      },
    },
  })

  useEffect(() => {
    const sub = watch((values) => {
      onChange(values as Partial<FormField>)
    })
    return () => sub.unsubscribe()
  }, [watch, onChange])

  const hasOptions = ['select', 'radio', 'checkbox'].includes(field.type)
  const options = watch('options')

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Label</label>
        <input
          {...register('label')}
          className={cn(
            'w-full rounded-md border px-3 py-2 text-sm bg-background',
            errors.label ? 'border-destructive' : 'border-input',
          )}
        />
        {errors.label && (
          <p className="mt-1 text-xs text-destructive">{errors.label.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Placeholder</label>
        <input
          {...register('placeholder')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Helper Text</label>
        <input
          {...register('helperText')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          {...register('required')}
          className="rounded border-input"
        />
        Required
      </label>

      {hasOptions && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Options</label>
          {options?.map((_, index) => (
            <div key={index} className="flex gap-2">
              <input
                {...register(`options.${index}.label`)}
                placeholder="Label"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                {...register(`options.${index}.value`)}
                placeholder="Value"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <button
                type="button"
                className="rounded-md border border-input px-2 text-sm hover:bg-accent"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setValue('options', [
                ...(options || []),
                { label: '', value: '' },
              ])
            }
            className="text-sm text-primary hover:underline"
          >
            + Add option
          </button>
        </div>
      )}

      <div className="space-y-2 border-t pt-4">
        <h4 className="text-sm font-medium">Validation Rules</h4>
        {['text', 'textarea', 'email', 'url', 'phone'].includes(field.type) && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Min Length</label>
              <input
                type="number"
                {...register('validation.minLength')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Max Length</label>
              <input
                type="number"
                {...register('validation.maxLength')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
        {['number'].includes(field.type) && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Min</label>
              <input
                type="number"
                {...register('validation.min')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Max</label>
              <input
                type="number"
                {...register('validation.max')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
        <div>
          <label className="text-xs text-muted-foreground">Regex Pattern</label>
          <input
            {...register('validation.pattern')}
            placeholder="e.g. ^[A-Z].*"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  )
}
