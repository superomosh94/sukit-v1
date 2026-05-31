import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';

interface PopupRendererProps {
  popup: {
    id: string;
    name: string;
    popupType: string;
    triggerType: string;
    triggerValue?: string;
    animation: string;
    animationDuration: number;
    content: Record<string, any>;
    settings: Record<string, any>;
  };
  onClose: () => void;
  onTrack: (eventType: 'view' | 'conversion' | 'close') => void;
}

const animations: Record<string, any> = {
  'fade': { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  'slide-up': { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 50 } },
  'slide-down': { initial: { opacity: 0, y: -50 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -50 } },
  'slide-left': { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 50 } },
  'slide-right': { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -50 } },
  'zoom': { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.8 } },
  'bounce': {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { type: 'spring', stiffness: 300, damping: 15 },
  },
};

const positionStyles: Record<string, string> = {
  'modal': 'fixed inset-0 flex items-center justify-center z-50',
  'slide-in': 'fixed right-0 top-1/2 -translate-y-1/2 z-50',
  'floating-bar': 'fixed bottom-0 left-0 right-0 z-50',
  'fullscreen': 'fixed inset-0 z-50',
  'notification': 'fixed top-4 right-4 z-50',
  'inline': 'relative z-10',
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function PopupRenderer({ popup, onClose, onTrack }: PopupRendererProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    onTrack('view');
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const anim = animations[popup.animation] || animations.fade;
  const position = positionStyles[popup.popupType] || positionStyles.modal;
  const hasOverlay = ['modal', 'fullscreen'].includes(popup.popupType);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {hasOverlay && (
        <motion.div
          key="overlay"
          className="fixed inset-0 bg-black/50 z-40"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        />
      )}
      <motion.div
        key="popup"
        className={cn(position, 'max-w-lg')}
        variants={anim}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: popup.animationDuration / 1000 }}
      >
        <div className="relative bg-white rounded-lg shadow-xl p-6 dark:bg-gray-800">
          <button
            onClick={() => { onTrack('close'); onClose(); }}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: popup.content.html || popup.content.text || '' }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
