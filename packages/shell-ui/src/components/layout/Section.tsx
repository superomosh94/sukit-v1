'use client';

import React, { type ReactNode } from 'react';

export interface SectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function Section({
  children,
  title,
  description,
  className,
}: SectionProps) {
  return (
    <section className={`py-6 ${className || ''}`}>
      {title && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
