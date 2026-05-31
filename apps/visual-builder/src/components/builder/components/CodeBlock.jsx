import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const CodeBlock = ({ 
    code, 
    language = 'javascript',
    showLineNumbers = true,
    className 
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn('relative bg-gray-900 rounded-lg overflow-hidden', className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-xs text-gray-400">{language}</span>
                <button
                    onClick={handleCopy}
                    className="p-1 rounded hover:bg-gray-700 transition-colors"
                >
                    {copied ? <Check className="w-4 h-4 text-success-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
            </div>

            {/* Code */}
            <pre className="p-4 overflow-x-auto">
                <code className={cn(`language-${language}`, showLineNumbers && 'line-numbers')}>
                    {code}
                </code>
            </pre>
        </div>
    );
};

CodeBlock.displayName = 'CodeBlock';
export default CodeBlock;
