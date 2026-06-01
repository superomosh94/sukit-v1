'use client';

import { useState } from 'react';

interface InstallButtonProps {
  moduleId: string;
  price: number | null;
  installed?: boolean;
  onInstall: (version?: string) => void;
  onBuy?: () => void;
  installing?: boolean;
}

export function InstallButton({
  moduleId,
  price,
  installed,
  onInstall,
  onBuy,
  installing,
}: InstallButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (installed) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Installed
        </span>
        <button
          onClick={() => onInstall()}
          className="text-xs text-indigo-600 hover:text-indigo-800"
        >
          Reinstall
        </button>
      </div>
    );
  }

  if (price != null && price > 0) {
    return (
      <div className="space-y-2">
        <button
          onClick={() => onBuy?.()}
          disabled={installing}
          className="w-full px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {installing ? 'Processing...' : `Buy Now — $${price}`}
        </button>
        {confirming ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setConfirming(false);
                onInstall();
              }}
              className="flex-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md py-1"
            >
              Confirm Install
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs text-gray-400 hover:text-gray-600 py-1"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="w-full text-xs text-gray-500 hover:text-gray-700"
          >
            Try for free
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => onInstall()}
      disabled={installing}
      className="w-full px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
    >
      {installing ? (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Installing...
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Install
        </>
      )}
    </button>
  );
}
