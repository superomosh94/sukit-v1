'use client';

import { useRef, useEffect, useState } from 'react';
import { Terminal as TerminalIcon, X, Trash2 } from 'lucide-react';
import { useCodeEditorStore } from '../stores/codeEditorStore';
import { cn } from '../utils/cn';

interface TerminalProps {
  className?: string;
}

export function Terminal({ className }: TerminalProps) {
  const terminal = useCodeEditorStore((s) => s.terminal);
  const addTerminalOutput = useCodeEditorStore((s) => s.addTerminalOutput);
  const addTerminalHistory = useCodeEditorStore((s) => s.addTerminalHistory);
  const setTerminalCommand = useCodeEditorStore((s) => s.setTerminalCommand);
  const toggleTerminal = useCodeEditorStore((s) => s.toggleTerminal);
  const setTerminalOutput = useCodeEditorStore((s) => s.setTerminalOutput);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [terminal.output]);

  useEffect(() => {
    if (terminal.isOpen) {
      inputRef.current?.focus();
    }
  }, [terminal.isOpen]);

  const executeCommand = async (cmd: string) => {
    addTerminalOutput(`$ ${cmd}`);
    addTerminalHistory(cmd);
    setTerminalCommand('');

    if (cmd === 'clear') {
      setTerminalOutput([]);
      return;
    }

    try {
      const res = await fetch('/api/code-editor/terminal/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      if (data.output) {
        addTerminalOutput(data.output);
      }
      if (data.error) {
        addTerminalOutput(`Error: ${data.error}`);
      }
    } catch (err) {
      addTerminalOutput(`Error: ${err}`);
    }
  };

  if (!terminal.isOpen) return null;

  return (
    <div
      className={cn(
        'flex flex-col border-t bg-black text-green-400 font-mono text-xs',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <TerminalIcon className="size-3" />
          <span className="text-[10px] font-medium">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTerminalOutput([])}
            className="rounded p-0.5 hover:bg-white/10"
            title="Clear"
          >
            <Trash2 className="size-3" />
          </button>
          <button
            onClick={toggleTerminal}
            className="rounded p-0.5 hover:bg-white/10"
            title="Close"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>

      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-3"
        style={{ maxHeight: '200px' }}
      >
        {terminal.output.length === 0 && (
          <div className="text-green-600">
            Welcome to SUKIT Terminal. Type 'help' for commands.
          </div>
        )}
        {terminal.output.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-all">
            {line}
          </div>
        ))}
      </div>

      <div className="flex items-center border-t border-white/10 px-3 py-1.5">
        <span className="mr-2 text-green-600">$</span>
        <input
          ref={inputRef}
          type="text"
          value={terminal.currentCommand}
          onChange={(e) => setTerminalCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && terminal.currentCommand.trim()) {
              executeCommand(terminal.currentCommand.trim());
            }
          }}
          className="flex-1 bg-transparent text-green-400 outline-none placeholder-green-700"
          placeholder="Type a command..."
        />
      </div>
    </div>
  );
}
