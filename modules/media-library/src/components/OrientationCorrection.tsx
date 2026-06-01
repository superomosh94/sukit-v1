'use client';

import { useState } from 'react';
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
} from 'lucide-react';
import { useMediaStore } from '../stores/mediaStore';
import { cn } from '../utils/cn';

interface OrientationCorrectionProps {
  assetId: string;
  className?: string;
}

export function OrientationCorrection({
  assetId,
  className,
}: OrientationCorrectionProps) {
  const rotateAsset = useMediaStore((s) => s.rotateAsset);
  const flipAsset = useMediaStore((s) => s.flipAsset);
  const autoStraighten = useMediaStore((s) => s.autoStraighten);
  const [processing, setProcessing] = useState(false);

  const handleAction = async (action: () => Promise<any>) => {
    setProcessing(true);
    await action();
    setProcessing(false);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-xs font-medium text-muted-foreground uppercase">
        Orientation
      </h4>
      <div className="flex gap-2">
        <button
          onClick={() => handleAction(() => rotateAsset(assetId, 90))}
          disabled={processing}
          className="flex flex-col items-center gap-1 rounded-md bg-muted p-2 text-xs hover:bg-accent disabled:opacity-50"
          title="Rotate 90° CW"
        >
          <RotateCw className="size-4" />
          <span>90°</span>
        </button>
        <button
          onClick={() => handleAction(() => rotateAsset(assetId, 270))}
          disabled={processing}
          className="flex flex-col items-center gap-1 rounded-md bg-muted p-2 text-xs hover:bg-accent disabled:opacity-50"
          title="Rotate 90° CCW"
        >
          <RotateCcw className="size-4" />
          <span>90°</span>
        </button>
        <button
          onClick={() => handleAction(() => rotateAsset(assetId, 180))}
          disabled={processing}
          className="flex flex-col items-center gap-1 rounded-md bg-muted p-2 text-xs hover:bg-accent disabled:opacity-50"
          title="Rotate 180°"
        >
          <RotateCw className="size-4" />
          <span>180°</span>
        </button>
        <button
          onClick={() => handleAction(() => flipAsset(assetId, 'horizontal'))}
          disabled={processing}
          className="flex flex-col items-center gap-1 rounded-md bg-muted p-2 text-xs hover:bg-accent disabled:opacity-50"
          title="Flip Horizontal"
        >
          <FlipHorizontal className="size-4" />
          <span>H</span>
        </button>
        <button
          onClick={() => handleAction(() => flipAsset(assetId, 'vertical'))}
          disabled={processing}
          className="flex flex-col items-center gap-1 rounded-md bg-muted p-2 text-xs hover:bg-accent disabled:opacity-50"
          title="Flip Vertical"
        >
          <FlipVertical className="size-4" />
          <span>V</span>
        </button>
        <button
          onClick={() => handleAction(() => autoStraighten(assetId))}
          disabled={processing}
          className="flex items-center gap-1 rounded-md bg-muted px-3 py-2 text-xs hover:bg-accent disabled:opacity-50"
          title="Auto Straighten"
        >
          Auto
        </button>
      </div>
    </div>
  );
}
