'use client';

import React, { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ModalAnimationProps {
  isOpen: boolean;
  children: ReactNode;
  animation?:
    | 'fade'
    | 'scale'
    | 'slideUp'
    | 'slideDown'
    | 'slideLeft'
    | 'slideRight';
}

const variants: Record<string, any> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
};

export function ModalAnimation({
  isOpen,
  children,
  animation = 'scale',
}: ModalAnimationProps) {
  const v = variants[animation];
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={v.initial}
          animate={v.animate}
          exit={v.exit}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
