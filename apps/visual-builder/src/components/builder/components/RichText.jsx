import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List as ListIcon, ListOrdered, Link as LinkIcon, Image } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const RichText = ({ 
    value = '', 
    onChange, 
    placeholder = 'Write something...',
    className 
}) => {
    const [content, setContent] = useState(value);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const editorRef = useRef(null);

    useEffect(() => {
        if (editorRef.current && !value) {
            editorRef.current.innerHTML = '';
        }
    }, [value]);

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
            onChange?.(editorRef.current.innerHTML);
        }
    };

    const insertLink = () => {
        if (linkUrl) {
            execCommand('createLink', linkUrl);
            setLinkUrl('');
            setShowLinkModal(false);
        }
    };

    const insertImage = () => {
        const url = prompt('Enter image URL:');
        if (url) {
            execCommand('insertImage', url);
        }
    };

    return (
        <div className={cn('rich-text-editor bg-surface border border-border rounded-lg overflow-hidden', className)}>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-surface-light">
                <button
                    onClick={() => execCommand('bold')}
                    className="p-1.5 rounded hover:bg-surface transition-colors"
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="w-4 h-4 text-text-secondary" />
                </button>
                <button
                    onClick={() => execCommand('italic')}
                    className="p-1.5 rounded hover:bg-surface transition-colors"
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="w-4 h-4 text-text-secondary" />
                </button>
                <button
                    onClick={() => execCommand('underline')}
                    className="p-1.5 rounded hover:bg-surface transition-colors"
                    title="Underline (Ctrl+U)"
                >
                    <Underline className="w-4 h-4 text-text-secondary" />
                </button>
                <div className="w-px h-6 bg-border mx-1" />
                <button
                    onClick={() => execCommand('justifyLeft')}
                    className="p-1.5 rounded hover:bg-surface transition-colors"
                >
                    <AlignLeft className="w-4 h-4 text-text-secondary" />
                </button>
                <button
                    onClick={() => execCommand('justifyCenter')}
                    className="p-1.5 rounded hover:bg-surface transition-colors"
                >
                    <AlignCenter className="w-4 h-4 text-text-secondary" />
                </button>
                <button
                    onClick={() => execCommand('justifyRight')}
                    className="p-1.5 rounded hover:bg-surface transition-colors"
                >
                    <AlignRight className="w-4 h-4 text-text-secondary" />
                </button>
                <div className="w-px h-6 bg-border mx-1" />
                <button
                    onClick={() => execCommand('insertUnorderedList')}
                    className="p-1.5 rounded hover:bg-surface transition-colors"
                >
                    <ListIcon className="w-4 h-4 text-text-secondary" />
                </button>
                <button
                    onClick={() => execCommand('insertOrderedList')}
                    className="p-1.5 rounded hover:bg-surface transition-colors"
                >
                    <ListOrdered className="w-4 h-4 text-text-secondary" />
                </button>
                <div className="w-px h-6 bg-border mx-1" />
                <button
                    onClick={() => setShowLinkModal(true)}
                    className="p-1.5 rounded hover:bg-surface transition-colors"
                >
                    <LinkIcon className="w-4 h-4 text-text-secondary" />
                </button>
                <button
                    onClick={insertImage}
                    className="p-1.5 rounded hover:bg-surface transition-colors"
                >
                    <Image className="w-4 h-4 text-text-secondary" />
                </button>
            </div>

            {/* Editor Content */}
            <div
                ref={editorRef}
                contentEditable
                className="min-h-[200px] p-4 focus:outline-none prose prose-invert max-w-none text-text-primary"
                onInput={(e) => {
                    setContent(e.currentTarget.innerHTML);
                    onChange?.(e.currentTarget.innerHTML);
                }}
                dangerouslySetInnerHTML={{ __html: content }}
                data-placeholder={placeholder}
                style={{
                    '&:empty:before': {
                        content: 'attr(data-placeholder)',
                        color: '#94A3B8'
                    }
                }}
            />

            {/* Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface rounded-lg p-6 w-96">
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Insert Link</h3>
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg mb-4 text-text-primary"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLinkModal(false)}
                                className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg text-text-primary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={insertLink}
                                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg"
                            >
                                Insert
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

RichText.displayName = 'RichText';
export default RichText;
