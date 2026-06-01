'use client';

import { useState } from 'react';
import { Smartphone, Tablet, Monitor, Image } from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';

const BREAKPOINTS = [
  { label: 'Thumbnail', width: 150, icon: Image },
  { label: 'Small', width: 480, icon: Smartphone },
  { label: 'Medium', width: 768, icon: Tablet },
  { label: 'Large', width: 1024, icon: Monitor },
  { label: 'XL', width: 1920, icon: Monitor },
];

interface ResponsiveSizesPanelProps {
  assetId: string;
  className?: string;
}

export function ResponsiveSizesPanel({
  assetId,
  className,
}: ResponsiveSizesPanelProps) {
  const generateVariants = useMediaStore((s) => s.generateVariants);
  const getSrcSet = useMediaStore((s) => s.getSrcSet);
  const [generating, setGenerating] = useState(false);
  const [srcset, setSrcset] = useState<string>('');

  const handleGenerate = async () => {
    setGenerating(true);
    await generateVariants(assetId);
    setSrcset(getSrcSet(assetId));
    setGenerating(false);
  };

  return (
    <div className={cn('space-y-4 rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="size-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Responsive Sizes</h4>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Generate All'}
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {BREAKPOINTS.map((bp) => (
          <div
            key={bp.width}
            className="flex flex-col items-center gap-1 rounded-md bg-muted p-2 text-center"
          >
            <bp.icon className="size-4 text-muted-foreground" />
            <span className="text-[10px] font-medium">{bp.label}</span>
            <span className="text-[10px] text-muted-foreground">
              {bp.width}w
            </span>
          </div>
        ))}
      </div>

      {srcset && (
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            srcset
          </label>
          <pre className="mt-1 max-h-20 overflow-auto rounded-md bg-muted p-2 text-[10px]">
            {srcset}
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(srcset)}
            className="mt-1 text-xs text-primary hover:underline"
          >
            Copy srcset
          </button>
        </div>
      )}
    </div>
  );
}
