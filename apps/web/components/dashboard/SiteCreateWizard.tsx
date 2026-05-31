'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

const STEPS = [
  { id: 1, label: 'Details' },
  { id: 2, label: 'Template' },
  { id: 3, label: 'Theme' },
  { id: 4, label: 'Review' },
]

const TEMPLATES = [
  { id: 'blank', name: 'Blank', desc: 'Start from scratch' },
  { id: 'landing', name: 'Landing Page', desc: 'Single-page marketing site' },
  { id: 'blog', name: 'Blog', desc: 'Blog with articles & sidebar' },
  { id: 'portfolio', name: 'Portfolio', desc: 'Showcase your work' },
  { id: 'saas', name: 'SaaS', desc: 'Software product landing' },
  { id: 'ecommerce', name: 'E-Commerce', desc: 'Online store layout' },
]

const FONTS = ['Inter', 'Roboto', 'Poppins', 'Merriweather', 'Playfair Display']

interface SiteCreateWizardProps {
  onComplete?: (data: SiteCreateData) => void
}

interface SiteCreateData {
  name: string
  domain: string
  template: string
  colors: { primary: string; secondary: string; background: string }
  font: string
}

export default function SiteCreateWizard({ onComplete }: SiteCreateWizardProps) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<SiteCreateData>({
    name: '',
    domain: '',
    template: 'blank',
    colors: { primary: '#3b82f6', secondary: '#8b5cf6', background: '#ffffff' },
    font: 'Inter',
  })

  const next = () => setStep((s) => Math.min(s + 1, 4))
  const prev = () => setStep((s) => Math.max(s - 1, 1))

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-full text-xs font-medium transition-colors',
                  s.id < step
                    ? 'bg-primary text-primary-foreground'
                    : s.id === step
                      ? 'border-2 border-primary text-primary'
                      : 'border-2 border-muted-foreground/30 text-muted-foreground',
                )}
              >
                {s.id < step ? '\u2713' : s.id}
              </div>
              <span
                className={cn(
                  'mt-1 text-xs',
                  s.id === step
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-2 mt-[-1.5rem] h-0.5 w-16',
                  s.id < step ? 'bg-primary' : 'bg-muted-foreground/30',
                )}
              />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Site Details</h2>
          <div>
            <label className="text-sm font-medium">Site Name</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="My Awesome Site"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Domain</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                value={data.domain}
                onChange={(e) =>
                  setData({
                    ...data,
                    domain: e.target.value.replace(/[^a-z0-9-]/g, ''),
                  })
                }
                placeholder="my-site"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <span className="text-sm text-muted-foreground">.sukit.app</span>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Choose Template</h2>
          <div className="grid grid-cols-2 gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setData({ ...data, template: t.id })}
                className={cn(
                  'rounded-lg border p-4 text-left transition-colors',
                  data.template === t.id
                    ? 'border-primary bg-primary/5'
                    : 'border-input hover:border-muted-foreground/50',
                )}
              >
                <h3 className="font-medium">{t.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Theme</h2>
          <div className="grid grid-cols-3 gap-4">
            {(['primary', 'secondary', 'background'] as const).map((key) => (
              <div key={key}>
                <label className="text-sm font-medium capitalize">{key} Color</label>
                <input
                  type="color"
                  value={data.colors[key]}
                  onChange={(e) =>
                    setData({
                      ...data,
                      colors: { ...data.colors, [key]: e.target.value },
                    })
                  }
                  className="mt-1 h-12 w-full cursor-pointer rounded-md border border-input bg-background p-1"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium">Font</label>
            <select
              value={data.font}
              onChange={(e) => setData({ ...data, font: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {FONTS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div
            className="mt-4 rounded-lg border p-6 text-center"
            style={{
              backgroundColor: data.colors.background,
              color: data.colors.primary,
              fontFamily: data.font,
            }}
          >
            <p className="text-2xl font-bold">Preview</p>
            <p className="mt-2 text-sm">This is how your site will look</p>
            <button
              type="button"
              className="mt-3 rounded-md px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: data.colors.primary }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Review & Create</h2>
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{data.name || 'Not set'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Domain</span>
              <span className="font-medium">
                {data.domain || 'Not set'}.sukit.app
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Template</span>
              <span className="font-medium capitalize">{data.template}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Font</span>
              <span className="font-medium">{data.font}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onComplete?.(data)}
            disabled={!data.name || !data.domain}
            className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Create Site
          </button>
        </div>
      )}

      <div className="flex justify-between">
        {step > 1 && (
          <button
            type="button"
            onClick={prev}
            className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Back
          </button>
        )}
        {step < 4 && (
          <button
            type="button"
            onClick={next}
            className="ml-auto rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  )
}
