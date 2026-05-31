// src/components/dashboard/StatsCard.jsx
import React from 'react';
import { cn } from '../../utils/cn';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
  const colors = {
    primary: 'bg-primary-500/10 border-primary-500/20',
    success: 'bg-success-500/10 border-success-500/20',
    warning: 'bg-warning-500/10 border-warning-500/20',
    danger: 'bg-danger-500/10 border-danger-500/20',
    secondary: 'bg-secondary-500/10 border-secondary-500/20',
  };
  const iconColors = {
    primary: 'text-primary-500',
    success: 'text-success-500',
    warning: 'text-warning-500',
    danger: 'text-danger-500',
    secondary: 'text-secondary-500',
  };
  return (
    <div className={cn('p-4 rounded-xl border bg-surface', colors[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
          {trend && (
            <p className={cn('text-xs mt-2', trend === 'up' ? 'text-success-500' : 'text-danger-500')}>
              {trend === 'up' ? '↑' : '↓'} {trendValue} from last month
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', colors[color])}>
          <Icon className={cn('w-5 h-5', iconColors[color])} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
