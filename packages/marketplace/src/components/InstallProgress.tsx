'use client';

import type { InstallProgress as InstallProgressType } from '../types';

interface InstallProgressProps {
  progress: InstallProgressType;
  moduleName?: string;
  onCancel?: () => void;
  onRetry?: () => void;
}

const statusLabels: Record<string, string> = {
  downloading: 'Downloading',
  extracting: 'Extracting',
  validating: 'Validating',
  installing_deps: 'Installing Dependencies',
  configuring: 'Configuring',
  activating: 'Activating',
  complete: 'Complete',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

const statusColors: Record<string, string> = {
  downloading: 'bg-blue-500',
  extracting: 'bg-blue-500',
  validating: 'bg-amber-500',
  installing_deps: 'bg-indigo-500',
  configuring: 'bg-indigo-500',
  activating: 'bg-purple-500',
  complete: 'bg-green-500',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-400',
};

export function InstallProgress({
  progress,
  moduleName,
  onCancel,
  onRetry,
}: InstallProgressProps) {
  const isFinished =
    progress.status === 'complete' ||
    progress.status === 'failed' ||
    progress.status === 'cancelled';
  const isError = progress.status === 'failed';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900">
          {moduleName ? `Installing ${moduleName}` : 'Installation'}
        </h3>
        <span className="text-xs text-gray-500">
          {progress.timeRemaining
            ? `~${Math.round(progress.timeRemaining / 1000)}s remaining`
            : statusLabels[progress.status] || progress.status}
        </span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${statusColors[progress.status] || 'bg-indigo-500'}`}
          style={{ width: `${Math.max(progress.percent, isError ? 100 : 0)}%` }}
        />
      </div>

      <p
        className={`text-sm mt-2 ${isError ? 'text-red-600' : 'text-gray-600'}`}
      >
        {progress.message}
      </p>

      {progress.log.length > 0 && (
        <div className="mt-3 bg-gray-50 rounded-lg p-3 max-h-24 overflow-y-auto">
          {progress.log.map((entry, i) => (
            <p key={i} className="text-xs text-gray-500 font-mono">
              {entry}
            </p>
          ))}
        </div>
      )}

      {!isFinished && onCancel && (
        <button
          onClick={onCancel}
          className="mt-3 text-sm text-red-600 hover:text-red-800"
        >
          Cancel
        </button>
      )}

      {isError && onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}
