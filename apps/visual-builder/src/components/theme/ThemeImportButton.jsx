import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import Button from '../shared/Button';

const ThemeImportButton = ({ onImport }) => {
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const theme = JSON.parse(event.target.result);
                onImport(theme);
            } catch (error) {
                console.error('Invalid theme file:', error);
                alert('Invalid theme file. Please select a valid JSON file.');
            }
        };
        reader.readAsText(file);
        
        // Reset input
        e.target.value = '';
    };

    return (
        <>
            <input 
                ref={fileInputRef} 
                type="file" 
                accept=".json" 
                onChange={handleFileSelect} 
                className="hidden" 
            />
            <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()} 
                leftIcon={<Upload className="w-4 h-4" />}
            >
                Import Theme
            </Button>
        </>
    );
};

export default ThemeImportButton;
