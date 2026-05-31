import React, { useState } from 'react';
import { Eye, EyeOff, Trash2, Copy, GripVertical, Layers } from 'lucide-react';

const typeIcons = {
  heading: 'H',
  paragraph: 'P',
  button: 'Btn',
  image: 'Img',
  Container: 'Div',
  group: 'G',
};

const typeLabels = {
  heading: 'Heading',
  paragraph: 'Paragraph',
  button: 'Button',
  image: 'Image',
  Container: 'Container',
  group: 'Group',
};

export default function LayerPanel({ components, selectedId, onSelect, onDelete, onDuplicate }) {
  const [hiddenIds, setHiddenIds] = useState(new Set());

  if (!components || components.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full text-text-secondary">
        <Layers className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-xs text-center">No layers yet. Add components from the library.</p>
      </div>
    );
  }

  const toggleVisibility = (id, e) => {
    e.stopPropagation();
    setHiddenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Layers</h3>
        <span className="text-xs text-text-secondary">{components.length}</span>
      </div>
      <div className="flex-1 overflow-auto space-y-0.5">
        {components.map((comp, index) => {
          const type = comp.type || 'div';
          const label = typeLabels[type] || type;
          const isSelected = comp.id === selectedId;
          const isHidden = hiddenIds.has(comp.id);

          return (
            <div
              key={comp.id}
              onClick={() => onSelect(comp.id)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs transition-colors group ${
                isSelected
                  ? 'bg-primary-500/15 text-primary-500'
                  : 'text-text-secondary hover:bg-surface-light hover:text-text-primary'
              } ${isHidden ? 'opacity-40' : ''}`}
            >
              <div className="shrink-0 flex items-center justify-center w-5 h-5 rounded bg-surface-light text-[10px] font-medium">
                {typeIcons[type] || '?'}
              </div>

              <span className="flex-1 truncate">{label}</span>
              {comp.props?.text && (
                <span className="text-[10px] text-text-secondary truncate max-w-[80px] opacity-0 group-hover:opacity-100 transition-opacity">
                  {comp.props.text}
                </span>
              )}

              <button
                onClick={(e) => toggleVisibility(comp.id, e)}
                className="p-0.5 rounded hover:bg-surface-light opacity-0 group-hover:opacity-100 transition-opacity"
                title={isHidden ? 'Show' : 'Hide'}
              >
                {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(comp.id); }}
                className="p-0.5 rounded hover:bg-surface-light opacity-0 group-hover:opacity-100 transition-opacity"
                title="Duplicate"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(comp.id); }}
                className="p-0.5 rounded hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
