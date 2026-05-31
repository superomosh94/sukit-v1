import React from 'react';
import { Bell, X } from 'lucide-react';

const AnnouncementBanner = ({ message, onDismiss }) => {
  return (
    <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Bell className="w-5 h-5 text-primary-500" />
        <p className="text-sm text-text-primary">{message}</p>
      </div>
      <button onClick={onDismiss} className="text-text-secondary hover:text-text-primary transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AnnouncementBanner;
