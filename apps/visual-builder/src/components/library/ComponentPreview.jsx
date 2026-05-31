import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useComponentStore } from '../../stores/componentStore';

/**
 * ComponentPreview renders a modal showing the selected component's preview.
 * It expects the component object to contain a `code` string (JSX) and `name`.
 */
const ComponentPreview = ({ component, onClose }) => {
  const { setShowPreview, setSelectedComponent } = useComponentStore.getState();

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Render the component code inside an iframe using srcDoc for isolation.
  const srcDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${component.name} Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;">
<div id="root"></div>
<script type="text/babel">
${component.code}
ReactDOM.render(React.createElement(${component.name}), document.getElementById('root'));
</script>
</body>
</html>`;

  return (
    <div className={cn('fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50')}> 
      <div className={cn('bg-surface rounded-lg overflow-hidden shadow-xl w-11/12 max-w-3xl')}>
        <div className={cn('flex justify-between items-center p-4 border-b border-border')}> 
          <h2 className="text-lg font-semibold">{component.name} Preview</h2>
          <button onClick={onClose} className={cn('p-1 text-text-secondary hover:text-primary-500')}> 
            <X size={20} />
          </button>
        </div>
        <iframe
          srcDoc={srcDoc}
          className={cn('w-full h-96')}
          sandbox="allow-scripts"
          title="component preview"
        />
      </div>
    </div>
  );
};

export default ComponentPreview;
