import React from 'react';
import { useEditorStore } from '../stores/editorStore';
import { SortableComponent } from './SortableComponent';

export const LayerPanel = () => {
  const { components, selectedComponentId, selectComponent, deleteComponent, moveComponent } = useEditorStore();

  return (
    <div className="layer-panel" style={{ padding: '8px', borderRight: '1px solid #ddd', width: '200px' }}>
      <h3 style={{ margin: '0 0 8px' }}>Layers</h3>
      {components.map((c, index) => (
        <SortableComponent
          key={c.id}
          id={c.id}
          component={c}
          isSelected={c.id === selectedComponentId}
          onSelect={selectComponent}
          onDelete={deleteComponent}
          onResize={() => {}}
          onMove={moveComponent}
          index={index}
        />
      ))}
    </div>
  );
};
