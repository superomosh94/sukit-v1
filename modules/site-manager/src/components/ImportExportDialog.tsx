'use client';

import { useState, useCallback } from 'react';
import { Download, Upload, FileJson, Loader2, Lock, Image } from 'lucide-react';
import { useSiteManagerStore } from '../stores/siteManagerStore';
import { cn } from '../utils/cn';

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportExportDialog({
  open,
  onOpenChange,
}: ImportExportDialogProps) {
  const [tab, setTab] = useState<'import' | 'export'>('export');
  const [includeMedia, setIncludeMedia] = useState(true);
  const [encrypt, setEncrypt] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importData, setImportData] = useState('');
  const [overwrite, setOverwrite] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentSiteId = useSiteManagerStore((s) => s.currentSiteId);
  const currentSite = useSiteManagerStore((s) => s.currentSite);
  const exportSite = useSiteManagerStore((s) => s.exportSite);
  const importSite = useSiteManagerStore((s) => s.importSite);

  const handleExport = useCallback(async () => {
    if (!currentSiteId) return;
    setExporting(true);
    setError('');
    try {
      const data = await exportSite(currentSiteId, { includeMedia, encrypt });
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentSite?.slug ?? 'site'}-backup.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess('Site exported successfully');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setExporting(false);
    }
  }, [currentSiteId, currentSite, includeMedia, encrypt, exportSite]);

  const handleImport = useCallback(async () => {
    if (!importData.trim()) return;
    setImporting(true);
    setError('');
    try {
      const site = await importSite(importData, { overwrite });
      if (site) {
        setSuccess(`Site "${site.name}" imported successfully`);
        setImportData('');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setImporting(false);
    }
  }, [importData, overwrite, importSite]);

  const handleFileUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      setImportData(text);
    };
    input.click();
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[500px] rounded-lg border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold">Import / Export Site</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded p-1 hover:bg-accent"
          >
            <span className="sr-only">Close</span>
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b">
          {(['export', 'import'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setError('');
                setSuccess('');
              }}
              className={cn(
                'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
                tab === t
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t === 'export' ? 'Export' : 'Import'}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-500/10 border border-green-500/20 px-3 py-2 text-xs text-green-600">
              {success}
            </div>
          )}

          {tab === 'export' ? (
            <>
              <p className="text-sm text-muted-foreground">
                Download a complete backup of your site including all pages,
                settings, and content.
              </p>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={includeMedia}
                    onChange={(e) => setIncludeMedia(e.target.checked)}
                    className="rounded"
                  />
                  <span>Include media files</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={encrypt}
                    onChange={(e) => setEncrypt(e.target.checked)}
                    className="rounded"
                  />
                  <span className="flex items-center gap-1">
                    <Lock className="size-3.5" />
                    Encrypt backup file
                  </span>
                </label>
              </div>

              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                {exporting ? 'Exporting...' : 'Download Backup'}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Import a previously exported site backup to restore or clone a
                site.
              </p>

              <div className="space-y-2">
                <button
                  onClick={handleFileUpload}
                  className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-sm text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <Upload className="size-5" />
                  Click to select a backup file
                </button>

                {importData && (
                  <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                    <FileJson className="inline size-3.5 mr-1" />
                    Backup loaded ({importData.length.toLocaleString()} bytes)
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={overwrite}
                    onChange={(e) => setOverwrite(e.target.checked)}
                    className="rounded"
                  />
                  <span>Overwrite existing site (if slug matches)</span>
                </label>
              </div>

              <button
                onClick={handleImport}
                disabled={!importData || importing}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {importing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {importing ? 'Importing...' : 'Import Site'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
