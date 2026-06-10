'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewPopupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('on-load');
  const [placement, setPlacement] = useState('center');

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/popups" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Popup</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new popup campaign
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-card p-6 shadow-sm">
        <label className="text-sm font-medium">Popup Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Newsletter Signup"
          className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="rounded-xl bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold mb-3">Trigger</h2>
        <div className="space-y-2">
          {[
            { value: 'on-load', label: 'On Page Load', desc: 'Shows immediately when page loads' },
            { value: 'on-scroll', label: 'On Scroll', desc: 'Shows after user scrolls a percentage' },
            { value: 'on-exit', label: 'On Exit Intent', desc: 'Shows when user moves to close tab' },
            { value: 'on-click', label: 'On Click', desc: 'Shows when user clicks an element' },
            { value: 'on-timer', label: 'After Delay', desc: 'Shows after a set time delay' },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                trigger === opt.value ? 'border-primary bg-primary/5' : 'hover:bg-accent'
              }`}
            >
              <input
                type="radio"
                name="trigger"
                value={opt.value}
                checked={trigger === opt.value}
                onChange={(e) => setTrigger(e.target.value)}
                className="mt-0.5"
              />
              <div>
                <div className="text-sm font-medium">{opt.label}</div>
                <div className="text-xs text-muted-foreground">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold mb-3">Placement</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'top-bar', label: 'Top Bar' },
            { value: 'bottom-bar', label: 'Bottom Bar' },
            { value: 'center', label: 'Center Modal' },
            { value: 'left', label: 'Left Slide-in' },
            { value: 'right', label: 'Right Slide-in' },
            { value: 'fullscreen', label: 'Fullscreen' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPlacement(opt.value)}
              className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                placement === opt.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'hover:bg-accent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => router.push('/popups')}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Create Popup
        </button>
        <Link
          href="/popups"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
