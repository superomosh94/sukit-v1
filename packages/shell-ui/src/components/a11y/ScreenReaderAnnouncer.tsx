'use client';

import React, { useEffect, useState, type ReactNode } from 'react';

export interface ScreenReaderAnnouncerProps {
  children: ReactNode;
}

export function ScreenReaderAnnouncer({
  children,
}: ScreenReaderAnnouncerProps) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setMessage(e.detail?.message || '');
    };
    window.addEventListener('sr-announce' as any, handler as any);
    return () =>
      window.removeEventListener('sr-announce' as any, handler as any);
  }, []);

  return (
    <>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {message}
      </div>
    </>
  );
}

export function announceToScreenReader(message: string) {
  window.dispatchEvent(new CustomEvent('sr-announce', { detail: { message } }));
}
