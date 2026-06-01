'use client';

import { useState } from 'react';
import type { PermissionRequest } from '../types';

interface PermissionReviewProps {
  moduleName: string;
  permissions: PermissionRequest[];
  onConfirm: (grantedPermissions: string[]) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function PermissionReview({
  moduleName,
  permissions,
  onConfirm,
  onCancel,
  loading,
}: PermissionReviewProps) {
  const [choices, setChoices] = useState<Record<string, boolean>>(() =>
    permissions.reduce((acc, p) => ({ ...acc, [p.permission]: p.required }), {})
  );

  const allRequired = permissions.every((p) => p.required);
  const granted = Object.entries(choices)
    .filter(([, v]) => v)
    .map(([k]) => k);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Permission Required
              </h2>
              <p className="text-sm text-gray-500">
                &ldquo;{moduleName}&rdquo; needs the following permissions:
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            {permissions.map((p) => (
              <div
                key={p.permission}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {p.label}
                    </span>
                    {p.required && (
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {p.description}
                  </p>
                </div>
                {!p.required && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-gray-500">Grant</span>
                    <input
                      type="checkbox"
                      checked={choices[p.permission] ?? false}
                      onChange={(e) =>
                        setChoices((prev) => ({
                          ...prev,
                          [p.permission]: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                )}
              </div>
            ))}
          </div>

          {!allRequired && (
            <div className="flex items-center gap-2 mb-4 px-1">
              <input
                type="checkbox"
                checked={Object.values(choices).every(Boolean)}
                onChange={(e) => {
                  const all = e.target.checked;
                  setChoices(
                    permissions.reduce(
                      (acc, p) => ({ ...acc, [p.permission]: all }),
                      {}
                    )
                  );
                }}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">
                Grant all permissions
              </span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => onConfirm(granted)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading
                ? 'Installing...'
                : `Install with ${granted.length} permission${granted.length !== 1 ? 's' : ''}`}
            </button>
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
