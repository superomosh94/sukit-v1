// src/components/dashboard/QuickActions.jsx
import React from 'react';
import { Plus, Upload, Settings, FileText, Palette, Box } from 'lucide-react';
import { cn } from '../../utils/cn';

const actions = [
  { icon: Plus, label: 'New Project', onClick: () => {}, color: 'primary' },
  { icon: Upload, label: 'Import', onClick: () => {}, color: 'secondary' },
  { icon: FileText, label: 'New Page', onClick: () => {}, color: 'success' },
  { icon: Palette, label: 'Theme', onClick: () => {}, color: 'warning' },
  { icon: Box, label: 'Components', onClick: () => {}, color: 'info' },
  { icon: Settings, label: 'Settings', onClick: () => {}, color: 'ghost' },
];

const QuickActions = ({ onNewProject, onImport, onNewPage, onThemeDesign, onComponentLibrary, onSettings }) => {
  // map callbacks to actions array based on label
  const mapped = actions.map((a) => {
    let handler = () => {};
    if (a.label === 'New Project' && onNewProject) handler = onNewProject;
    if (a.label === 'Import' && onImport) handler = onImport;
    if (a.label === 'New Page' && onNewPage) handler = onNewPage;
    if (a.label === 'Theme' && onThemeDesign) handler = onThemeDesign;
    if (a.label === 'Components' && onComponentLibrary) handler = onComponentLibrary;
    if (a.label === 'Settings' && onSettings) handler = onSettings;
    return { ...a, onClick: handler };
  });

  return (
    <div className={cn('bg-surface rounded-xl border border-border p-4')}>
      <h3 className="font-semibold text-text-primary mb-3">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-3">
        {mapped.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-surface-light transition-colors group"
          >
            <action.icon className={cn('w-5 h-5 text-text-secondary group-hover:text-primary-500 transition-colors')} />
            <span className={cn('text-xs text-text-secondary group-hover:text-text-primary transition-colors')}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
