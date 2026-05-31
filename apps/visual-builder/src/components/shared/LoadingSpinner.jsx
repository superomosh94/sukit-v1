import React from 'react';

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  return (
    <div className={`animate-spin border-2 border-primary-500 border-t-transparent rounded-full ${sizeClass}`} />
  );
};
