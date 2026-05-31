import React, { useState, useCallback } from 'react';
import Button from '../shared/Button';
import { cn } from '../../utils/cn';

/**
 * ImportComponent renders a modal that allows users to select a file via
 * a traditional file input or by dragging and dropping onto the drop zone.
 * Once a file is selected, its name and a preview of its text content are
 * displayed. When the user clicks **Import**, the `onImport` callback is
 * invoked with an object containing the file name, the raw code string, and
 * a generated component name.
 */
const ImportComponent = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  const handleFile = useCallback(
    (selectedFile) => {
      if (!selectedFile) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        setPreview(text);
        setFile(selectedFile);
      };
      reader.readAsText(selectedFile);
    },
    []
  );

  const onDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    handleFile(dropped);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const clearSelection = () => {
    setFile(null);
    setPreview('');
  };

  const handleImport = () => {
    if (!file) return;
    const componentName = file.name.replace(/\.[^/.]+$/, ''); // strip extension
    onImport({
      name: componentName,
      code: preview,
      fileName: file.name,
    });
    clearSelection();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={cn('fixed inset-0 flex items-center justify-center z-50 bg-black/50')}> 
      <div className="bg-surface rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Import Component</h2>
        <div
          className={cn(
            'border-2 border-dashed border-border rounded p-8 text-center cursor-pointer',
            'bg-surface hover:bg-surface-light transition-colors'
          )}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={() => document.getElementById('import-file-input').click()}
        >
          <p className="text-text-secondary mb-2">Drag & drop a file here, or click to select</p>
          <input
            id="import-file-input"
            type="file"
            accept=".js,.jsx,.tsx,.ts,.json"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {file && (
            <div className="mt-4 text-left">
              <p className="font-medium text-text-primary">File: {file.name}</p>
              <pre className="mt-2 max-h-40 overflow-y-auto text-sm bg-surface-light p-2 rounded border border-border">
                {preview}
              </pre>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6 space-x-3">
          <Button variant="outline" onClick={() => { clearSelection(); onClose(); }}>Cancel</Button>
          <Button variant="primary" onClick={handleImport} disabled={!file}>Import</Button>
        </div>
      </div>
    </div>
  );
};

export default ImportComponent;
