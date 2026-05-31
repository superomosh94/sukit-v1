import React from 'react';
import { Download } from 'lucide-react';
import Button from '../shared/Button';

const ThemeExportButton = ({ theme, onExport }) => {
    const handleExport = () => {
        const themeJson = JSON.stringify(theme, null, 2);
        const blob = new Blob([themeJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sukit-theme-${new Date().toISOString().slice(0, 19)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onExport?.();
    };

    return (
        <Button variant="outline" onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
            Export Theme
        </Button>
    );
};

export default ThemeExportButton;
