import React, { useEffect, useState } from 'react';
import { cn } from '../../../utils/cn';

/**
 * BackToTop button appears after scrolling down a bit and scrolls the page to the top.
 */
export const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn('fixed bottom-5 right-5 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700')}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
};
