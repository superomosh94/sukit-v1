import React from 'react';
import ReactDOM from 'react-dom/client';
import { TopToolbar } from './components/TopToolbar.jsx';
import { ComponentLibrary } from './components/ComponentLibrary.jsx';
import { Canvas } from './components/Canvas.jsx';
import { PropertyPanel } from './components/PropertyPanel.jsx';
import { LayerPanel } from './components/LayerPanel.jsx';
import { PageManager } from './components/PageManager.jsx';
import { PreviewWindow } from './components/PreviewWindow.jsx';

const App = () => {
  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh' }}>
      <aside className="sidebar" style={{ width: '200px', borderRight: '1px solid #ddd', padding: '8px' }}>
        <h2>SuKit Builder</h2>
        <ComponentLibrary />
      </aside>
      <main className="main" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopToolbar />
        <div style={{ display: 'flex', flex: 1 }}>
          <LayerPanel />
          <Canvas />
          <PropertyPanel />
        </div>
        <PageManager />
        <PreviewWindow />
      </main>
    </div>
  );
};

const rootEl = document.getElementById('app');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
}
