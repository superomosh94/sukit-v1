'use client';

import { useState } from 'react';

interface VersionUploaderProps {
  moduleName: string;
  currentVersion: string;
  onUpload: (data: {
    file: File;
    version: string;
    changelog?: string;
    sukVersion?: string;
    isBeta?: boolean;
  }) => Promise<{ success: boolean; version?: string; errors?: string[] }>;
  uploading?: boolean;
}

export function VersionUploader({
  moduleName,
  currentVersion,
  onUpload,
  uploading,
}: VersionUploaderProps) {
  const [version, setVersion] = useState('');
  const [changelog, setChangelog] = useState('');
  const [sukVersion, setSukVersion] = useState('1.0.0');
  const [isBeta, setIsBeta] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function incrementVersion(part: 'major' | 'minor' | 'patch') {
    const parts = currentVersion.split('.').map(Number);
    if (part === 'major') {
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
    } else if (part === 'minor') {
      parts[1]++;
      parts[2] = 0;
    } else if (part === 'patch') {
      parts[2]++;
    }
    setVersion(parts.join('.'));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    if (!version) {
      setError('Please specify a version number');
      return;
    }

    try {
      const result = await onUpload({
        file,
        version,
        changelog: changelog || undefined,
        sukVersion,
        isBeta,
      });
      if (result.success) {
        setSuccess(`Version ${result.version} uploaded successfully!`);
        setFile(null);
        setChangelog('');
      } else {
        setError(result.errors?.join(', ') || 'Upload failed');
      }
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-gray-200 p-6 space-y-4"
    >
      <h3 className="text-sm font-semibold text-gray-900">
        Upload New Version — {moduleName}
      </h3>
      <p className="text-xs text-gray-500">
        Current version: v{currentVersion}
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Version *
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0.0"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={() => incrementVersion('patch')}
            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
          >
            Patch
          </button>
          <button
            type="button"
            onClick={() => incrementVersion('minor')}
            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
          >
            Minor
          </button>
          <button
            type="button"
            onClick={() => incrementVersion('major')}
            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
          >
            Major
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Module File *
        </label>
        <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-indigo-400 transition-colors">
          <div className="text-center">
            <svg
              className="w-8 h-8 text-gray-400 mx-auto mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-xs text-gray-500">
              {file ? file.name : 'Click to select ZIP file'}
            </p>
          </div>
          <input
            type="file"
            accept=".zip,.tar.gz"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SUKIT Version
          </label>
          <input
            type="text"
            value={sukVersion}
            onChange={(e) => setSukVersion(e.target.value)}
            placeholder="1.0.0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isBeta}
              onChange={(e) => setIsBeta(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Beta release</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Changelog
        </label>
        <textarea
          value={changelog}
          onChange={(e) => setChangelog(e.target.value)}
          rows={4}
          placeholder="What's new in this version?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 resize-y"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <button
        type="submit"
        disabled={uploading}
        className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {uploading ? 'Uploading...' : `Upload v${version || '...'}`}
      </button>
    </form>
  );
}
