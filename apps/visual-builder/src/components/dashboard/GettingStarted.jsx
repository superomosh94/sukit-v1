import React from 'react';
import { BookOpen, Video, Users } from 'lucide-react';

const GettingStarted = () => {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Getting Started</h3>
      <div className="space-y-4">
        <a href="#" className="flex items-center gap-3 text-text-secondary hover:text-primary-500 transition-colors">
          <BookOpen className="w-5 h-5" />
          <span>Read the Documentation</span>
        </a>
        <a href="#" className="flex items-center gap-3 text-text-secondary hover:text-primary-500 transition-colors">
          <Video className="w-5 h-5" />
          <span>Watch Video Tutorials</span>
        </a>
        <a href="#" className="flex items-center gap-3 text-text-secondary hover:text-primary-500 transition-colors">
          <Users className="w-5 h-5" />
          <span>Join the Community</span>
        </a>
      </div>
    </div>
  );
};

export default GettingStarted;
