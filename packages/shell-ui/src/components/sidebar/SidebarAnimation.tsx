'use client';

import React, { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SidebarAnimationProps {
  isOpen: boolean;
  children: ReactNode;
  side?: 'left' | 'right' | 'bottom';
}

const variants = {
  left: { initial: { x: -300 }, animate: { x: 0 }, exit: { x: -300 } },
  right: { initial: { x: 300 }, animate: { x: 0 }, exit: { x: 300 } },
  bottom: { initial: { y: 300 }, animate: { y: 0 }, exit: { y: 300 } },
};

export function SidebarAnimation({
  isOpen,
  children,
  side = 'left',
}: SidebarAnimationProps) {
  const v = variants[side];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={v.initial}
          animate={v.animate}
          exit={v.exit}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="h-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
