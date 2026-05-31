import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import {
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Code, Quote
} from 'lucide-react';

export const RichText = ({ 
    value = '',
    onChange,
    placeholder = 'Write something...',
    toolbar = true,
    minHeight = 200,
    className,
    ...props 
}) => {
    const [editorValue, setEditorValue] = useState(value);
    const textareaRef = React.useRef(null);

    const updateValue = (newValue) => {
        setEditorValue(newValue);
        onChange?.(newValue);
    };

    const insertFormat = (before, after = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = editorValue.substring(start, end);
        const newText = editorValue.substring(0, start) + before + selectedText + after + editorValue.substring(end);
        updateValue(newText);
        setTimeout(() => {
            textarea.selectionStart = start + before.length;
            textarea.selectionEnd = end + before.length;
            textarea.focus();
        }, 0);
    };

    const applyBold = () => insertFormat('**', '**');
    const applyItalic = () => insertFormat('*', '*');
    const applyUnderline = () => insertFormat('<u>', '</u>');
    const applyLink = () => { const url = prompt('Enter URL:', 'https://'); if (url) insertFormat('[', `](${url})`); };
    const applyImage = () => { const url = prompt('Enter image URL:', 'https://'); if (url) insertFormat('![alt](', ')'); };
    const applyList = () => insertFormat('- ');
    const applyNumberedList = () => insertFormat('1. ');
    const applyQuote = () => insertFormat('> ');
    const applyCode = () => insertFormat('```\n', '\n```');

    const ToolbarButton = ({ icon: Icon, onClick, title }) => (
        <button type="button" onClick={onClick} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" title={title}>
            <Icon size={16} />
        </button>
    );

    return (
        <div className={cn('border border-border rounded-lg overflow-hidden', className)} {...props}>
            {toolbar && (
                <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-surface-light">
                    <ToolbarButton icon={Bold} onClick={applyBold} title="Bold (Ctrl+B)" />
                    <ToolbarButton icon={Italic} onClick={applyItalic} title="Italic (Ctrl+I)" />
                    <ToolbarButton icon={Underline} onClick={applyUnderline} title="Underline (Ctrl+U)" />
                    <div className="w-px h-6 bg-border mx-1" />
                    <ToolbarButton icon={AlignLeft} onClick={() => {}} title="Align Left" />
                    <ToolbarButton icon={AlignCenter} onClick={() => {}} title="Align Center" />
                    <ToolbarButton icon={AlignRight} onClick={() => {}} title="Align Right" />
                    <div className="w-px h-6 bg-border mx-1" />
                    <ToolbarButton icon={List} onClick={applyList} title="Bullet List" />
                    <ToolbarButton icon={ListOrdered} onClick={applyNumberedList} title="Numbered List" />
                    <div className="w-px h-6 bg-border mx-1" />
                    <ToolbarButton icon={LinkIcon} onClick={applyLink} title="Insert Link" />
                    <ToolbarButton icon={ImageIcon} onClick={applyImage} title="Insert Image" />
                    <div className="w-px h-6 bg-border mx-1" />
                    <ToolbarButton icon={Quote} onClick={applyQuote} title="Quote" />
                    <ToolbarButton icon={Code} onClick={applyCode} title="Code Block" />
                </div>
            )}
            <textarea
                ref={textareaRef}
                value={editorValue}
                onChange={(e) => updateValue(e.target.value)}
                placeholder={placeholder}
                className="w-full p-4 bg-surface text-text-primary resize-y focus:outline-none"
                style={{ minHeight }}
            />
            <div className="p-2 border-t border-border bg-surface-light text-xs text-text-secondary">
                Markdown supported
            </div>
        </div>
    );
};

export const Link = ({ 
    href,
    target = '_self',
    rel,
    children,
    underline = true,
    variant = 'default',
    className,
    ...props 
}) => {
    const variantClasses = {
        default: 'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300',
        subtle: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
        button: 'inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700',
    };
    const relValue = rel || (target === '_blank' ? 'noopener noreferrer' : undefined);
    return (
        <a href={href} target={target} rel={relValue} className={cn(variantClasses[variant], underline && 'underline', className)} {...props}>
            {children}
        </a>
    );
};

export const List = ({ 
    items,
    type = 'unordered',
    ordered = false,
    nested = false,
    className,
    ...props 
}) => {
    const ListTag = ordered ? 'ol' : 'ul';
    const listClasses = cn(nested ? 'ml-4' : 'ml-6', ordered ? 'list-decimal' : 'list-disc', className);
    
    if (Array.isArray(items)) {
        return (
            <ListTag className={listClasses} {...props}>
                {items.map((item, index) => (
                    <li key={index} className="mb-1">
                        {typeof item === 'string' ? item : item.content}
                        {item.children && <List items={item.children} nested {...props} />}
                    </li>
                ))}
            </ListTag>
        );
    }
    return <ListTag className={listClasses} {...props} />;
};

export const Quote = ({ 
    children,
    author,
    variant = 'default',
    className,
    ...props 
}) => {
    const variantClasses = {
        default: 'border-l-4 border-primary-500 pl-4 italic',
        modern: 'bg-surface-light p-6 rounded-lg italic border-none',
        elegant: 'text-center text-2xl font-light italic border-none',
    };
    return (
        <blockquote className={cn('my-4', variantClasses[variant], className)} {...props}>
            <p className="text-gray-700 dark:text-gray-300">{children}</p>
            {author && <footer className="mt-2 text-sm text-text-secondary">— {author}</footer>}
        </blockquote>
    );
};

export const CodeBlock = ({ 
    code,
    language = 'javascript',
    showLineNumbers = true,
    className,
    ...props 
}) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    const lines = code.split('\n');
    
    return (
        <div className={cn('relative group', className)} {...props}>
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={handleCopy} className="px-2 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600">
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="bg-background rounded-lg overflow-x-auto p-4">
                <code className={`language-${language}`}>
                    {showLineNumbers ? (
                        <div className="flex">
                            <div className="text-right pr-4 select-none text-text-secondary">
                                {lines.map((_, i) => <div key={i + 1} className="text-sm">{i + 1}</div>)}
                            </div>
                            <div className="flex-1">
                                <div className="text-gray-200 font-mono text-sm">{code}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-200 font-mono text-sm">{code}</div>
                    )}
                </code>
            </pre>
        </div>
    );
};

export const DropCap = ({ 
    children,
    size = 'lg',
    className,
    ...props 
}) => {
    const sizeClasses = { sm: 'text-3xl', md: 'text-4xl', lg: 'text-5xl', xl: 'text-6xl' };
    const firstChar = typeof children === 'string' ? children.charAt(0) : '';
    const restText = typeof children === 'string' ? children.slice(1) : children;
    return (
        <div className={cn('dropcap', className)} {...props}>
            <span className={cn('float-left font-bold leading-none mr-2', sizeClasses[size])}>{firstChar}</span>
            {restText}
        </div>
    );
};
