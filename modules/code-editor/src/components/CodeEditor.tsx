import { Editor, OnMount } from '@monaco-editor/react';
import React, { useState, useCallback } from 'react';

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: 'vs-dark' | 'light';
  fileName?: string;
  readOnly?: boolean;
}

export const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'html',
  'css',
  'scss',
  'json',
  'xml',
  'yaml',
  'markdown',
  'python',
  'sql',
  'shell',
] as const;

export function CodeEditor({
  value,
  onChange,
  language = 'html',
  theme = 'vs-dark',
  fileName,
  readOnly,
}: CodeEditorProps) {
  const [mounted, setMounted] = useState(false);

  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      setMounted(true);

      editor.addAction({
        id: 'save',
        label: 'Save',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
        run: () => {
          onChange(editor.getValue());
        },
      });

      editor.addAction({
        id: 'format',
        label: 'Format Document',
        keybindings: [
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
        ],
        run: () => {
          editor.getAction('editor.action.formatDocument')?.run();
        },
      });
    },
    [onChange]
  );

  const languageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    jsx: 'javascript',
    tsx: 'typescript',
    mjs: 'javascript',
    cjs: 'javascript',
    mts: 'typescript',
    cts: 'typescript',
  };

  const ext = fileName?.split('.').pop() || '';
  const resolvedLanguage = languageMap[ext] || language;

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {fileName && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#252526] border-b border-[#3c3c3c] text-sm text-[#cccccc]">
          <span className="text-[#888]">{fileName}</span>
        </div>
      )}
      <Editor
        height="100%"
        language={resolvedLanguage}
        value={value}
        theme={theme}
        onChange={(val) => val !== undefined && onChange(val)}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
          readOnly,
          bracketPairColorization: { enabled: true },
          'semanticHighlighting.enabled': true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          formatOnPaste: true,
          folding: true,
          foldingHighlight: true,
          renderWhitespace: 'selection',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          multiCursorModifier: 'alt',
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoIndent: 'full',
        }}
      />
    </div>
  );
}

export function getLanguageFromFileName(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    mjs: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    mts: 'typescript',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'scss',
    less: 'less',
    json: 'json',
    jsonc: 'json',
    md: 'markdown',
    mdx: 'markdown',
    py: 'python',
    sql: 'sql',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    svg: 'xml',
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    tf: 'hcl',
    env: 'plaintext',
    gitignore: 'plaintext',
  };
  return map[ext] || 'plaintext';
}
