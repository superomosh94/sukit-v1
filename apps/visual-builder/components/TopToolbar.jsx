import React from 'react';
import { useEditorStore } from '../stores/editorStore';

export const TopToolbar = () => {
  const { undo, redo, togglePreview, toggleCodeEditor, isPreviewMode, isCodeEditorOpen } = useEditorStore();

  return (
    <div className="top-toolbar" style={{ display: 'flex', gap: '8px', padding: '8px', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
      <button onClick={togglePreview}>{isPreviewMode ? 'Edit Mode' : 'Preview Mode'}</button>
      <button onClick={toggleCodeEditor}>{isCodeEditorOpen ? 'Hide Code' : 'Show Code'}</button>
    </div>
  );
};
