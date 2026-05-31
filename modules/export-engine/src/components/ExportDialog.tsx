import React, { useState } from 'react';
import {
  Download,
  GitHub,
  Settings,
  Code2,
  Database,
  Shield,
  Container,
  ArrowRight,
} from 'lucide-react';

interface ExportOptions {
  typescript: boolean;
  tailwind: boolean;
  includeBackend: boolean;
  database: 'postgresql';
  auth: 'jwt';
  includeDocker: boolean;
  includeCI: boolean;
  includeModules: string[];
  target: 'zip' | 'github';
  githubRepo?: string;
}

interface ExportDialogProps {
  siteId: string;
  siteName: string;
  availableModules: string[];
  onClose: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  siteId,
  siteName,
  availableModules,
  onClose,
}) => {
  const [step, setStep] = useState<
    'options' | 'modules' | 'target' | 'progress'
  >('options');
  const [exporting, setExporting] = useState(false);
  const [exportId, setExportId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [options, setOptions] = useState<ExportOptions>({
    typescript: true,
    tailwind: true,
    includeBackend: true,
    database: 'postgresql',
    auth: 'jwt',
    includeDocker: true,
    includeCI: true,
    includeModules: availableModules.filter((m) =>
      ['auth', 'form-builder'].includes(m)
    ),
    target: 'zip',
  });

  const toggleModule = (mod: string) => {
    setOptions((prev) => ({
      ...prev,
      includeModules: prev.includeModules.includes(mod)
        ? prev.includeModules.filter((m) => m !== mod)
        : [...prev.includeModules, mod],
    }));
  };

  const startExport = async () => {
    setExporting(true);
    setError('');
    try {
      const res = await fetch(`/api/export/${siteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'fullstack' }),
      });
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      setExportId(data.exportId);
      setStep('progress');
      triggerDownload(data.exportId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const triggerDownload = async (eid: string) => {
    const a = document.createElement('a');
    a.href = `/api/export/${siteId}/download`;
    a.download = `${siteName.toLowerCase().replace(/\s+/g, '-')}-pern-app.zip`;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Export Application</h2>
            <p className="text-sm text-gray-500">{siteName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ✕
          </button>
        </div>

        {step === 'options' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Code2 className="size-4" /> Frontend Options
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.typescript}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        typescript: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />{' '}
                  TypeScript
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.tailwind}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        tailwind: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />{' '}
                  Tailwind CSS
                </label>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Database className="size-4" /> Backend Options
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeBackend}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        includeBackend: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />{' '}
                  Include Express + Prisma Backend
                </label>
                <p className="text-xs text-gray-400 ml-6">
                  PostgreSQL database with JWT authentication
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Container className="size-4" /> Deployment
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeDocker}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        includeDocker: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />{' '}
                  Docker Compose
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeCI}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        includeCI: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />{' '}
                  GitHub Actions CI/CD
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('modules')}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 flex items-center gap-1"
              >
                Next <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'modules' && (
          <div className="p-6 space-y-4">
            <h3 className="font-semibold">Select Modules to Include</h3>
            <p className="text-sm text-gray-500">
              Choose which features to generate code for.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {availableModules.map((mod) => (
                <label
                  key={mod}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${options.includeModules.includes(mod) ? 'border-gray-900 bg-gray-50' : 'hover:bg-gray-50'}`}
                >
                  <input
                    type="checkbox"
                    checked={options.includeModules.includes(mod)}
                    onChange={() => toggleModule(mod)}
                    className="rounded"
                  />
                  <span className="text-sm capitalize">
                    {mod.replace(/-/g, ' ')}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setStep('options')}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep('target')}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 flex items-center gap-1"
              >
                Next <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'target' && (
          <div className="p-6 space-y-4">
            <h3 className="font-semibold">Export Target</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  setOptions((prev) => ({ ...prev, target: 'zip' }))
                }
                className={`p-4 border rounded-lg text-center transition-colors ${options.target === 'zip' ? 'border-gray-900 bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                <Download className="size-8 mx-auto mb-2 text-gray-600" />
                <span className="font-medium block">Download ZIP</span>
                <span className="text-xs text-gray-400">Get a ZIP file</span>
              </button>
              <button
                onClick={() =>
                  setOptions((prev) => ({ ...prev, target: 'github' }))
                }
                className={`p-4 border rounded-lg text-center transition-colors ${options.target === 'github' ? 'border-gray-900 bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                <GitHub className="size-8 mx-auto mb-2 text-gray-600" />
                <span className="font-medium block">Push to GitHub</span>
                <span className="text-xs text-gray-400">
                  Create a repository
                </span>
              </button>
            </div>
            {options.target === 'github' && (
              <input
                type="text"
                placeholder="Repository name"
                value={options.githubRepo || ''}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    githubRepo: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded-md text-sm"
              />
            )}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setStep('modules')}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={startExport}
                disabled={exporting}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
              >
                {exporting ? (
                  'Exporting...'
                ) : (
                  <>
                    <Download className="size-4" /> Export Now
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'progress' && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Download className="size-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg">Export Complete!</h3>
            <p className="text-sm text-gray-500">
              Your full-stack application has been generated.
            </p>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={triggerDownload}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 flex items-center gap-2"
              >
                <Download className="size-4" /> Download Again
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
