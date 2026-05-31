import React from 'react';

export const Toast = ({ message, type = 'info', onClose }) => {
  const bgClass = type === 'error' ? 'bg-danger-500' : type === 'success' ? 'bg-success-500' : 'bg-primary-500';
  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 text-white rounded-lg shadow-lg flex items-center gap-2 ${bgClass}`}
         role="alert">
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="p-0.5 rounded hover:bg-white/20 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      )}
    </div>
  );
};
