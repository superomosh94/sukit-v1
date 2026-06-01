'use client';

import React, { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastAnimationProps {
  visible: boolean;
  children: ReactNode;
  animation?: 'slide' | 'fade' | 'scale';
}

const variants: Record<string, any> = {
  slide: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },
};

export function ToastAnimation({
  visible,
  children,
  animation = 'slide',
}: ToastAnimationProps) {
  const v = variants[animation];
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={v.initial}
          animate={v.animate}
          exit={v.exit}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
