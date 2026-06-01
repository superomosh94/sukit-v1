'use client';

import React, { type ReactNode } from 'react';

export interface SpacingProps {
  children: ReactNode;
  p?: number;
  px?: number;
  py?: number;
  pt?: number;
  pb?: number;
  pl?: number;
  pr?: number;
  m?: number;
  mx?: number;
  my?: number;
  mt?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  className?: string;
}

function spacingClasses(prefix: string, value?: number): string {
  if (value === undefined) return '';
  const map: Record<string, string> = {
    p: `p-${value}`,
    px: `px-${value}`,
    py: `py-${value}`,
    pt: `pt-${value}`,
    pb: `pb-${value}`,
    pl: `pl-${value}`,
    pr: `pr-${value}`,
    m: `m-${value}`,
    mx: `mx-${value}`,
    my: `my-${value}`,
    mt: `mt-${value}`,
    mb: `mb-${value}`,
    ml: `ml-${value}`,
    mr: `mr-${value}`,
  };
  return map[prefix] || '';
}

export function Spacing({
  children,
  p,
  px,
  py,
  pt,
  pb,
  pl,
  pr,
  m,
  mx,
  my,
  mt,
  mb,
  ml,
  mr,
  className,
}: SpacingProps) {
  const classes = [
    spacingClasses('p', p),
    spacingClasses('px', px),
    spacingClasses('py', py),
    spacingClasses('pt', pt),
    spacingClasses('pb', pb),
    spacingClasses('pl', pl),
    spacingClasses('pr', pr),
    spacingClasses('m', m),
    spacingClasses('mx', mx),
    spacingClasses('my', my),
    spacingClasses('mt', mt),
    spacingClasses('mb', mb),
    spacingClasses('ml', ml),
    spacingClasses('mr', mr),
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}
