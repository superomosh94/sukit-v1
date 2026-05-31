'use client';

import React, { type ReactNode } from 'react';
import { MainLayout } from './MainLayout';

export interface BuilderLayoutProps {
  children?: ReactNode;
}

export function BuilderLayout({ children }: BuilderLayoutProps) {
  return (
    <MainLayout>
      <div className="builder-layout">{children}</div>
    </MainLayout>
  );
}
