import React from 'react';

export const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;
  const sizeClass = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-lg" : "max-w-md";
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className={`${sizeClass} w-full bg-surface border border-border rounded-xl shadow-xl p-4`}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-light transition-colors text-text-secondary hover:text-text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="text-text-primary">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
