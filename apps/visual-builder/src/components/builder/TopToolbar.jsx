import React from 'react';
import { Button } from '../../components/shared/Button';
import { cn } from '../../utils/cn';

export default function TopToolbar({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  onPreview,
  onDeploy,
  device,
  onDeviceChange,
  onZoomIn,
  onZoomOut,
  onFitScreen,
  zoom,
}) {
  return (
    <div className="flex items-center justify-between p-2 bg-surface border-b border-border">
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo}>Undo</Button>
        <Button variant="ghost" size="sm" onClick={onRedo} disabled={!canRedo}>Redo</Button>
        <Button variant="primary" size="sm" onClick={onSave}>Save</Button>
        <Button variant="secondary" size="sm" onClick={onPreview}>Preview</Button>
        <Button variant="outline" size="sm" onClick={onDeploy}>Deploy</Button>
      </div>
      <div className="flex items-center gap-2">
        <select
          className={cn('bg-surface rounded p-1 text-sm', 'border border-border')}
          value={device}
          onChange={(e) => onDeviceChange(e.target.value)}
        >
          <option value="desktop">Desktop</option>
          <option value="tablet">Tablet</option>
          <option value="mobile">Mobile</option>
        </select>
        <Button variant="ghost" size="sm" onClick={onZoomOut}>-</Button>
        <span className="text-sm">{zoom}%</span>
        <Button variant="ghost" size="sm" onClick={onZoomIn}>+</Button>
        <Button variant="ghost" size="sm" onClick={onFitScreen}>Fit</Button>
      </div>
    </div>
  );
}
