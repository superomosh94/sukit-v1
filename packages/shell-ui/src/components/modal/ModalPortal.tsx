'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface ModalPortalProps {
  children: ReactNode;
  containerId?: string;
}

export function ModalPortal({
  children,
  containerId = 'modal-root',
}: ModalPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  let container = document.getElementById(containerId) || document.body;
  return createPortal(children, container);
}
