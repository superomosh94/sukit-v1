'use client';

import { useState } from 'react';
import { useBuilderStore } from '../stores/builderStore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { showToast } from './Toast';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function VersionHistoryPanel() {
  const versionHistory = useBuilderStore((s) => s.versionHistory);
  const saveVersion = useBuilderStore((s) => s.saveVersion);
  const restoreVersion = useBuilderStore((s) => s.restoreVersion);
  const deleteVersion = useBuilderStore((s) => s.deleteVersion);
  const isPublished = useBuilderStore((s) => s.isPublished);
  const publish = useBuilderStore((s) => s.publish);
  const unpublish = useBuilderStore((s) => s.unpublish);
  const revertToPublished = useBuilderStore((s) => s.revertToPublished);
  const lastPublishedSnapshot = useBuilderStore((s) => s.lastPublishedSnapshot);
  const [label, setLabel] = useState('');

  const handleSave = () => {
    if (!label.trim()) return;
    saveVersion(label.trim());
    showToast(`Version "${label}" saved`, 'success');
    setLabel('');
  };

  const handleRestore = (id: string) => {
    restoreVersion(id);
    showToast('Version restored', 'info');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="text-xs font-medium">Publish Status</Label>
          <div className="flex items-center gap-2">
            <div
              className={`size-2 rounded-full ${isPublished ? 'bg-green-500' : 'bg-yellow-500'}`}
            />
            <span className="text-xs text-muted-foreground">
              {isPublished ? 'Published' : 'Draft'}
            </span>
            {isPublished ? (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto h-7 text-[10px]"
                onClick={unpublish}
              >
                Unpublish
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="ml-auto h-7 text-[10px]"
                onClick={() => {
                  publish();
                  showToast('Page published', 'success');
                }}
              >
                Publish
              </Button>
            )}
          </div>
          {lastPublishedSnapshot && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full text-[10px] text-destructive"
              onClick={() => {
                revertToPublished();
                showToast('Reverted to last published version', 'info');
              }}
            >
              Revert to published
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">Save Version</Label>
        <div className="flex gap-2">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Version label..."
            className="h-8 flex-1 text-xs"
          />
          <Button
            size="sm"
            className="h-8 text-xs shrink-0"
            disabled={!label.trim()}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>

      {versionHistory.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">
          No saved versions yet
        </p>
      ) : (
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {[...versionHistory].reverse().map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-2 rounded-md border p-2"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-medium">{v.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatDate(v.createdAt)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => handleRestore(v.id)}
              >
                Restore
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2 text-destructive"
                onClick={() => {
                  deleteVersion(v.id);
                  showToast('Version deleted', 'info');
                }}
              >
                Del
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
