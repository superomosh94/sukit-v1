import React from 'react';
import Button from '../shared/Button';
import { Download } from 'lucide-react';

export const ExportComponent = ({ component, onClose }) => {
    const handleExport = () => {
        if (!component) return;

        const exportData = {
            version: '1.0',
            type: 'sukit-component',
            component: {
                type: component.type,
                props: component.props || {},
                position: component.position || { x: 0, y: 0 },
                size: component.size || { width: 200, height: 100 },
                styles: component.styles || {},
            },
            exportedAt: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${component.type || 'component'}-${Date.now()}.sukit-component.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onClose?.();
    };

    if (!component) {
        return (
            <div className="text-center py-8 text-text-secondary">
                <p>Select a component to export</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-surface-light border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center">
                        <Download className="w-4 h-4 text-primary-500" />
                    </div>
                    <div>
                        <p className="font-medium text-text-primary">{component.type || 'Component'}</p>
                        <p className="text-xs text-text-secondary">ID: {component.id}</p>
                    </div>
                </div>
                <pre className="bg-background rounded p-3 text-xs text-text-secondary overflow-x-auto max-h-40">
                    {JSON.stringify({ type: component.type, props: component.props, position: component.position, size: component.size }, null, 2)}
                </pre>
            </div>

            <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3">
                <p className="text-xs text-text-secondary">
                    This will export the component as a JSON file that can be shared and imported by other users.
                </p>
            </div>

            <div className="flex gap-3">
                {onClose && (
                    <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                )}
                <Button variant="primary" onClick={handleExport} leftIcon={<Download className="w-4 h-4" />} className="flex-1">
                    Export JSON
                </Button>
            </div>
        </div>
    );
};

ExportComponent.displayName = 'ExportComponent';
export default ExportComponent;
