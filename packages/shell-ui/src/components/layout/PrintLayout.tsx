'use client';

import React, { type ReactNode } from 'react';

export interface PrintLayoutProps {
  children?: ReactNode;
  className?: string;
}

export function PrintLayout({ children, className }: PrintLayoutProps) {
  return (
    <div className={`print-layout p-8 bg-white text-black ${className || ''}`}>
      <style jsx global>{`
        @media print {
          .print-layout {
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="no-print hidden" />
      {children}
    </div>
  );
}
