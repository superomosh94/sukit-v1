import React, { useState } from 'react';
import { Code2, Copy, Check, Save } from 'lucide-react';
import Button from '../shared/Button';

const CustomCSSEditor = ({ initialValue, onSave }) => {
    const [css, setCSS] = useState(initialValue || '');
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(css);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = () => {
        onSave(css);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const exampleCSS = `/* Custom CSS Example */
.btn-custom {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    transition: transform 0.2s;
}

.btn-custom:hover {
    transform: translateY(-2px);
}

.hero-section {
    background-image: url('/hero-bg.jpg');
    background-size: cover;
    background-position: center;
}`;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-primary-500" />
                    <h3 className="font-semibold text-text-primary">Custom CSS</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCSS(exampleCSS)}
                        className="px-3 py-1 text-xs bg-surface-light rounded text-text-secondary hover:text-text-primary transition-colors"
                    >
                        Load Example
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 rounded hover:bg-surface-light transition-colors"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check className="w-4 h-4 text-success-500" /> : <Copy className="w-4 h-4 text-text-secondary" />}
                    </button>
                </div>
            </div>

            <textarea
                value={css}
                onChange={(e) => setCSS(e.target.value)}
                rows={15}
                placeholder="/* Add your custom CSS here */"
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <div className="flex gap-3">
                <Button variant="primary" onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
                    {saved ? 'Saved!' : 'Save CSS'}
                </Button>
                <Button variant="outline" onClick={() => setCSS('')}>
                    Clear All
                </Button>
            </div>

            <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-3">
                <p className="text-xs text-text-secondary">
                    💡 Tip: Your custom CSS will be applied globally to your entire site. 
                    Use classes like <code className="px-1 py-0.5 bg-surface rounded">.btn-custom</code> in your components.
                </p>
            </div>
        </div>
    );
};

export default CustomCSSEditor;
