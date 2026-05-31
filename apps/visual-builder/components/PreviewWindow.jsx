import React from 'react';
import { useEditorStore } from '../stores/editorStore';

export const PreviewWindow = () => {
  const { components, selectedComponentId } = useEditorStore();

  return (
    <div className="preview-window" style={{ flex: 1, padding: '8px', overflow: 'auto' }}>
      <h3>Preview</h3>
      <div className="preview-canvas" style={{ border: '1px solid #ddd', minHeight: '400px', position: 'relative' }}>
        {components.map((c) => (
          <div
            key={c.id}
            style={{
              position: 'absolute',
              top: c.position?.y || 0,
              left: c.position?.x || 0,
              width: c.styles?.width || 'auto',
              height: c.styles?.height || 'auto',
              border: c.id === selectedComponentId ? '2px solid #007bff' : '1px solid #ccc',
              padding: '4px'
            }}
          >
            {c.type}
          </div>
        ))}
      </div>
    </div>
  );
};
