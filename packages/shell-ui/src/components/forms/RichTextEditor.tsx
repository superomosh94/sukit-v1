'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading,
} from 'lucide-react';

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  label,
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const exec = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      const html = editorRef.current?.innerHTML || '';
      onChange?.(html);
    },
    [onChange]
  );

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}
      <div
        className={`border rounded-lg overflow-hidden ${isFocused ? 'border-ring ring-1 ring-ring' : 'border-border'} ${className || ''}`}
      >
        <div className="flex items-center gap-0.5 px-2 py-1.5 bg-muted/30 border-b border-border flex-wrap">
          <button
            onClick={() => exec('formatBlock', '<h2>')}
            className="p-1 rounded hover:bg-accent"
            title="Heading"
          >
            <Heading size={14} />
          </button>
          <button
            onClick={() => exec('bold')}
            className="p-1 rounded hover:bg-accent font-bold"
            title="Bold"
          >
            <Bold size={14} />
          </button>
          <button
            onClick={() => exec('italic')}
            className="p-1 rounded hover:bg-accent italic"
            title="Italic"
          >
            <Italic size={14} />
          </button>
          <button
            onClick={() => exec('underline')}
            className="p-1 rounded hover:bg-accent underline"
            title="Underline"
          >
            <Underline size={14} />
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button
            onClick={() => exec('insertUnorderedList')}
            className="p-1 rounded hover:bg-accent"
            title="List"
          >
            <List size={14} />
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button
            onClick={() => exec('justifyLeft')}
            className="p-1 rounded hover:bg-accent"
            title="Align left"
          >
            <AlignLeft size={14} />
          </button>
          <button
            onClick={() => exec('justifyCenter')}
            className="p-1 rounded hover:bg-accent"
            title="Align center"
          >
            <AlignCenter size={14} />
          </button>
          <button
            onClick={() => exec('justifyRight')}
            className="p-1 rounded hover:bg-accent"
            title="Align right"
          >
            <AlignRight size={14} />
          </button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => onChange?.(editorRef.current?.innerHTML || '')}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="min-h-[120px] p-3 text-sm outline-none prose prose-sm max-w-none"
          data-placeholder={placeholder}
          dangerouslySetInnerHTML={{ __html: value }}
          style={{ '--placeholder': placeholder } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
