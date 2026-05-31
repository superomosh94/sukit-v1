import React from 'react';
import { cn } from '../../utils/cn';

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const variantStyles = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  outline: 'border border-border bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-light',
};

export const Button = ({ children, onClick, className = '', variant = 'primary', type = 'button', size = 'md', fullWidth, leftIcon, rightIcon }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg transition-colors focus:outline-none',
        sizeStyles[size] || sizeStyles.md,
        variantStyles[variant] || variantStyles.primary,
        fullWidth && 'w-full',
        className
      )}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};
export default Button;
