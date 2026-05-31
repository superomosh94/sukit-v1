import React from 'react';
import { useEditorStore } from '../stores/editorStore';

export const PageManager = () => {
  const { pages, currentPageId, addPage, deletePage, setCurrentPage } = useEditorStore();

  const handleAdd = () => {
    const newPage = { id: Date.now().toString(), name: `Page ${pages.length + 1}`, components: [] };
    addPage(newPage);
  };

  return (
    <div className="page-manager" style={{ padding: '8px', borderRight: '1px solid #ddd', width: '200px' }}>
      <h3 style={{ margin: '0 0 8px' }}>Pages</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {pages.map((p) => (
          <li key={p.id} style={{ marginBottom: '4px' }}>
            <button
              style={{
                background: p.id === currentPageId ? '#007bff' : '#e0e0e0',
                color: p.id === currentPageId ? '#fff' : '#000',
                border: 'none',
                padding: '4px 8px',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentPage(p.id)}
            >
              {p.name}
            </button>
            <button
              style={{ marginLeft: '4px', cursor: 'pointer' }}
              onClick={() => deletePage(p.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <button onClick={handleAdd} style={{ marginTop: '8px' }}>Add Page</button>
    </div>
  );
};
