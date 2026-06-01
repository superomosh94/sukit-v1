'use client';

import { useState } from 'react';
import { Copyright, Save } from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';

interface CopyrightCreditEditorProps {
  assetId: string;
  initialCopyright?: string;
  initialCredit?: string;
  className?: string;
}

export function CopyrightCreditEditor({
  assetId,
  initialCopyright = '',
  initialCredit = '',
  className,
}: CopyrightCreditEditorProps) {
  const updateAsset = useMediaStore((s) => s.updateAsset);
  const [copyright, setCopyright] = useState(initialCopyright);
  const [credit, setCredit] = useState(initialCredit);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateAsset(assetId, { copyright, credit });
    setSaving(false);
  };

  return (
    <div className={cn('space-y-3 rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Copyright className="size-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Copyright & Credit</h4>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          <Save className="size-3" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Copyright
        </label>
        <input
          type="text"
          value={copyright}
          onChange={(e) => setCopyright(e.target.value)}
          placeholder="© 2026 Your Company"
          className="mt-1 h-8 w-full rounded-md border bg-background px-3 text-xs"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Credit / Attribution
        </label>
        <input
          type="text"
          value={credit}
          onChange={(e) => setCredit(e.target.value)}
          placeholder="Photo by..."
          className="mt-1 h-8 w-full rounded-md border bg-background px-3 text-xs"
        />
      </div>
    </div>
  );
}
