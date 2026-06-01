import { create } from 'zustand';

interface GitState {
  currentBranch: string;
  branches: string[];
  status: Array<{ path: string; status: string }>;
  commitHistory: Array<{
    hash: string;
    message: string;
    author: string;
    date: string;
  }>;
  isSyncing: boolean;
}

interface TerminalState {
  isOpen: boolean;
  history: string[];
  currentCommand: string;
  output: string[];
}

interface CodeEditorStore {
  code: string;
  syncedCode: string;
  git: GitState;
  terminal: TerminalState;
  setCode: (code: string) => void;
  setSyncedCode: (code: string) => void;
  setGitBranch: (branch: string) => void;
  setGitBranches: (branches: string[]) => void;
  setGitStatus: (status: GitState['status']) => void;
  setCommitHistory: (history: GitState['commitHistory']) => void;
  setGitSyncing: (syncing: boolean) => void;
  toggleTerminal: () => void;
  setTerminalOutput: (output: string[]) => void;
  addTerminalOutput: (line: string) => void;
  setTerminalCommand: (cmd: string) => void;
  addTerminalHistory: (cmd: string) => void;
  setIsOpen: (open: boolean) => void;
}

export const useCodeEditorStore = create<CodeEditorStore>()((set, get) => ({
  code: '',
  syncedCode: '',
  git: {
    currentBranch: 'main',
    branches: ['main'],
    status: [],
    commitHistory: [],
    isSyncing: false,
  },
  terminal: {
    isOpen: false,
    history: [],
    currentCommand: '',
    output: [],
  },
  setCode: (code) => set({ code }),
  setSyncedCode: (code) => set({ syncedCode: code }),
  setGitBranch: (branch) =>
    set((s) => ({ git: { ...s.git, currentBranch: branch } })),
  setGitBranches: (branches) => set((s) => ({ git: { ...s.git, branches } })),
  setGitStatus: (status) => set((s) => ({ git: { ...s.git, status } })),
  setCommitHistory: (commitHistory) =>
    set((s) => ({ git: { ...s.git, commitHistory } })),
  setGitSyncing: (isSyncing) => set((s) => ({ git: { ...s.git, isSyncing } })),
  toggleTerminal: () =>
    set((s) => ({ terminal: { ...s.terminal, isOpen: !s.terminal.isOpen } })),
  setTerminalOutput: (output) =>
    set((s) => ({ terminal: { ...s.terminal, output } })),
  addTerminalOutput: (line) =>
    set((s) => ({
      terminal: { ...s.terminal, output: [...s.terminal.output, line] },
    })),
  setTerminalCommand: (currentCommand) =>
    set((s) => ({ terminal: { ...s.terminal, currentCommand } })),
  addTerminalHistory: (cmd) =>
    set((s) => ({
      terminal: {
        ...s.terminal,
        history: [...s.terminal.history, cmd],
        currentCommand: '',
      },
    })),
  setIsOpen: (isOpen) => set((s) => ({ terminal: { ...s.terminal, isOpen } })),
}));
