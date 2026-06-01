'use client';

import React, { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface RouteHistoryProps {
  onBack?: () => void;
  onForward?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
}

export function RouteHistory({
  onBack,
  onForward,
  canGoBack = false,
  canGoForward = false,
}: RouteHistoryProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onBack}
        disabled={!canGoBack}
        className="p-1.5 rounded-md hover:bg-accent disabled:opacity-50 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={16} />
      </button>
      <button
        onClick={onForward}
        disabled={!canGoForward}
        className="p-1.5 rounded-md hover:bg-accent disabled:opacity-50 transition-colors"
        aria-label="Go forward"
      >
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
