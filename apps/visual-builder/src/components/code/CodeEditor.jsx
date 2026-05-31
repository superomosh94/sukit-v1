import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { 
    Plus, Save, Play, Download, Upload, GitBranch, GitCommit, GitPullRequest, 
    Search, X, Copy, Check, Terminal, FileCode, FolderTree, 
    Maximize2, Minimize2, Split, Columns, Zap, AlertCircle, ChevronDown, ChevronRight,
    Edit, Trash2, XCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import { Toast } from '../shared/Toast';

// File Tree Component
const FileTree = ({ files, onFileSelect, selectedFile, onFileCreate, onFileDelete, onFileRename }) => {
    const [expandedFolders, setExpandedFolders] = useState({});
    const [showNewFileModal, setShowNewFileModal] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [newFileParent, setNewFileParent] = useState('');

    const toggleFolder = (path) => {
        setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
    };

    const renderTree = (items, level = 0) => {
        return items.map((item) => {
            const isExpanded = expandedFolders[item.path];
            
            if (item.type === 'folder') {
                return (
                    <div key={item.path}>
                        <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer hover:bg-surface-light transition-colors group`}
                            style={{ paddingLeft: `${level * 16 + 8}px` }}
                            onClick={() => toggleFolder(item.path)}
                        >
                            {isExpanded ? 
                                <ChevronDown className="w-3 h-3 text-text-secondary" /> : 
                                <ChevronRight className="w-3 h-3 text-text-secondary" />
                            }
                            <FolderTree className="w-4 h-4 text-primary-500" />
                            <span className="text-sm text-text-primary flex-1">{item.name}</span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setNewFileParent(item.path); setShowNewFileModal(true); }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-surface"
                            >
                                <Plus className="w-3 h-3 text-text-secondary" />
                            </button>
                        </div>
                        {isExpanded && item.children && (
                            <div>{renderTree(item.children, level + 1)}</div>
                        )}
                    </div>
                );
            }
            
            return (
                <div
                    key={item.path}
                    className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-colors group ${
                        selectedFile?.path === item.path
                            ? 'bg-primary-500/20 text-primary-500'
                            : 'hover:bg-surface-light text-text-primary'
                    }`}
                    style={{ paddingLeft: `${level * 16 + 28}px` }}
                    onClick={() => onFileSelect(item)}
                >
                    <FileCode className="w-4 h-4" />
                    <span className="text-sm flex-1">{item.name}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                         <button onClick={(e) => { e.stopPropagation(); onFileRename(item); }} className="p-0.5 rounded hover:bg-surface">
                             <Edit className="w-3 h-3 text-text-secondary" />
                         </button>
                        <button onClick={(e) => { e.stopPropagation(); onFileDelete(item); }} className="p-0.5 rounded hover:bg-danger-500/10">
                            <Trash2 className="w-3 h-3 text-danger-500" />
                        </button>
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="w-64 bg-surface border-r border-border flex flex-col">
            <div className="p-3 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-text-primary">Explorer</h3>
                <button onClick={() => setShowNewFileModal(true)} className="p-1 rounded hover:bg-surface-light">
                    <Plus className="w-4 h-4 text-text-secondary" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {renderTree(files)}
            </div>
            
            <Modal isOpen={showNewFileModal} onClose={() => setShowNewFileModal(false)} title="New File" size="sm">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">File Name</label>
                        <input
                            type="text"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            placeholder="index.jsx"
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setShowNewFileModal(false)} fullWidth>Cancel</Button>
                        <Button variant="primary" onClick={() => {
                            onFileCreate(newFileName, newFileParent);
                            setNewFileName('');
                            setShowNewFileModal(false);
                        }} fullWidth>Create</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// Console Panel Component
const ConsolePanel = ({ logs, onClear, onRun }) => {
    const [filter, setFilter] = useState('all');
    const [isExpanded, setIsExpanded] = useState(true);

    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        return log.type === filter;
    });

    const getIcon = (type) => {
        switch (type) {
            case 'error': return <XCircle className="w-4 h-4 text-danger-500" />;
            case 'warning': return <AlertCircle className="w-4 h-4 text-warning-500" />;
            case 'success': return <Check className="w-4 h-4 text-success-500" />;
            default: return <Terminal className="w-4 h-4 text-primary-500" />;
        }
    };

    if (!isExpanded) {
        return (
            <div className="bg-surface border-t border-border p-2 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(true)}>
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-primary-500" />
                    <span className="text-sm text-text-primary">Console</span>
                    <span className="text-xs text-text-secondary">({logs.length} entries)</span>
                </div>
                <Maximize2 className="w-4 h-4 text-text-secondary" />
            </div>
        );
    }

    return (
        <div className="bg-surface border-t border-border flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium text-text-primary">Console</span>
                    <div className="flex gap-1 ml-4">
                        <button onClick={() => setFilter('all')} className={cn("px-2 py-0.5 text-xs rounded", filter === 'all' ? "bg-primary-500 text-white" : "text-text-secondary hover:bg-surface-light")}>All</button>
                        <button onClick={() => setFilter('info')} className={cn("px-2 py-0.5 text-xs rounded", filter === 'info' ? "bg-primary-500 text-white" : "text-text-secondary hover:bg-surface-light")}>Info</button>
                        <button onClick={() => setFilter('success')} className={cn("px-2 py-0.5 text-xs rounded", filter === 'success' ? "bg-success-500 text-white" : "text-text-secondary hover:bg-surface-light")}>Success</button>
                        <button onClick={() => setFilter('warning')} className={cn("px-2 py-0.5 text-xs rounded", filter === 'warning' ? "bg-warning-500 text-white" : "text-text-secondary hover:bg-surface-light")}>Warning</button>
                        <button onClick={() => setFilter('error')} className={cn("px-2 py-0.5 text-xs rounded", filter === 'error' ? "bg-danger-500 text-white" : "text-text-secondary hover:bg-surface-light")}>Error</button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onRun} className="p-1 rounded hover:bg-surface-light" title="Run">
                        <Play className="w-4 h-4 text-text-secondary" />
                    </button>
                    <button onClick={onClear} className="p-1 rounded hover:bg-surface-light" title="Clear">
                        <X className="w-4 h-4 text-text-secondary" />
                    </button>
                    <button onClick={() => setIsExpanded(false)} className="p-1 rounded hover:bg-surface-light" title="Minimize">
                        <Minimize2 className="w-4 h-4 text-text-secondary" />
                    </button>
                </div>
            </div>
            <div className="h-48 overflow-y-auto font-mono text-xs">
                {filteredLogs.length === 0 ? (
                    <div className="px-4 py-2 text-text-secondary">No output</div>
                ) : (
                    filteredLogs.map((log, index) => (
                        <div key={index} className="flex items-start gap-2 px-4 py-1 hover:bg-surface-light">
                            {getIcon(log.type)}
                            <span className="text-text-secondary">{log.timestamp}</span>
                            <span className={cn(
                                "flex-1",
                                log.type === 'error' && "text-danger-500",
                                log.type === 'warning' && "text-warning-500",
                                log.type === 'success' && "text-success-500"
                            )}>{log.message}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Git Actions Component
const GitActions = ({ repo, onCommit, onPush, onPull, onBranch, onMerge }) => {
    const [commitMessage, setCommitMessage] = useState('');
    const [showCommitDialog, setShowCommitDialog] = useState(false);
    const [branch, setBranch] = useState('main');

    const handleCommit = () => {
        if (commitMessage.trim()) {
            onCommit(commitMessage);
            setCommitMessage('');
            setShowCommitDialog(false);
        }
    };

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 px-2 py-1 bg-surface-light rounded-md">
                <GitBranch className="w-3 h-3 text-primary-500" />
                <span className="text-xs text-text-primary">{branch}</span>
            </div>
            
            <div className="w-px h-4 bg-border mx-1" />
            
            <button onClick={() => setShowCommitDialog(true)} className="p-1.5 rounded hover:bg-surface-light" title="Commit">
                <GitCommit className="w-4 h-4 text-text-secondary" />
            </button>
            <button onClick={onPull} className="p-1.5 rounded hover:bg-surface-light" title="Pull">
                <Download className="w-4 h-4 text-text-secondary" />
            </button>
            <button onClick={onPush} className="p-1.5 rounded hover:bg-surface-light" title="Push">
                <Upload className="w-4 h-4 text-text-secondary" />
            </button>
            <button onClick={onBranch} className="p-1.5 rounded hover:bg-surface-light" title="New Branch">
                <GitBranch className="w-4 h-4 text-text-secondary" />
            </button>
            <button onClick={onMerge} className="p-1.5 rounded hover:bg-surface-light" title="Merge">
                <GitPullRequest className="w-4 h-4 text-text-secondary" />
            </button>

            <Modal isOpen={showCommitDialog} onClose={() => setShowCommitDialog(false)} title="Commit Changes" size="md">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Commit Message</label>
                        <input
                            type="text"
                            value={commitMessage}
                            onChange={(e) => setCommitMessage(e.target.value)}
                            placeholder="feat: add new feature"
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setShowCommitDialog(false)} fullWidth>Cancel</Button>
                        <Button variant="primary" onClick={handleCommit} fullWidth>Commit</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// Search in Files Component
const SearchInFiles = ({ isOpen, onClose, files, onOpenFile }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [wholeWord, setWholeWord] = useState(false);

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        const results = [];
        const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();

        const searchInFile = (file, path) => {
            if (file.content) {
                const lines = file.content.split('\n');
                lines.forEach((line, index) => {
                    const searchLine = caseSensitive ? line : line.toLowerCase();
                    let found = false;
                    if (wholeWord) {
                        const regex = new RegExp(`\\b${term}\\b`, caseSensitive ? 'g' : 'gi');
                        found = regex.test(searchLine);
                    } else {
                        found = searchLine.includes(term);
                    }
                    if (found) {
                        results.push({
                            file: path,
                            line: index + 1,
                            content: line.trim(),
                            matches: (line.match(new RegExp(term, caseSensitive ? 'g' : 'gi')) || []).length
                        });
                    }
                });
            }
        };

        const traverse = (items, currentPath = '') => {
            items.forEach(item => {
                const newPath = currentPath ? `${currentPath}/${item.name}` : item.name;
                if (item.type === 'file') {
                    searchInFile(item, newPath);
                } else if (item.children) {
                    traverse(item.children, newPath);
                }
            });
        };

        traverse(files);
        setSearchResults(results);
    };

    useEffect(() => {
        const debounce = setTimeout(handleSearch, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm, caseSensitive, wholeWord]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Search in Files" size="lg">
            <div className="space-y-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setCaseSensitive(!caseSensitive)}
                            className={cn("px-3 py-2 rounded-lg border transition-colors", caseSensitive ? "border-primary-500 text-primary-500" : "border-border text-text-secondary")}
                        >
                            Aa
                        </button>
                        <button
                            onClick={() => setWholeWord(!wholeWord)}
                            className={cn("px-3 py-2 rounded-lg border transition-colors", wholeWord ? "border-primary-500 text-primary-500" : "border-border text-text-secondary")}
                        >
                            " "
                        </button>
                    </div>
                </div>

                {searchResults.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {searchResults.map((result, idx) => (
                            <div key={idx} className="border border-border rounded-lg overflow-hidden">
                                <div className="px-3 py-2 bg-surface-light border-b border-border flex items-center justify-between">
                                    <span className="text-sm font-medium text-text-primary">{result.file}</span>
                                    <span className="text-xs text-text-secondary">{result.matches} match(es)</span>
                                </div>
                                <div
                                    onClick={() => onOpenFile(result.file, result.line)}
                                    className="px-3 py-2 hover:bg-surface-light cursor-pointer transition-colors"
                                >
                                    <span className="text-xs text-text-secondary mr-3">Line {result.line}</span>
                                    <span className="text-sm text-text-primary">{result.content}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : searchTerm && (
                    <div className="text-center py-8 text-text-secondary">No results found</div>
                )}
            </div>
        </Modal>
    );
};

// Prettier Format Component
const usePrettier = () => {
    const formatCode = async (code, language = 'javascript') => {
        try {
            // Dynamic import for prettier
            const prettier = await import('prettier/standalone');
            const parser = await import('prettier/parser-babel');
            
            const formatted = prettier.format(code, {
                parser: language === 'javascript' ? 'babel' : language,
                plugins: [parser],
                semi: true,
                singleQuote: true,
                trailingComma: 'es5',
                tabWidth: 2,
                printWidth: 100,
            });
            return formatted;
        } catch (error) {
            console.error('Prettier error:', error);
            return code;
        }
    };

    return { formatCode };
};

// Main Code Editor Component
export const CodeEditor = () => {
    const [files, setFiles] = useState([
        { name: 'src', path: '/src', type: 'folder', children: [
            { name: 'App.jsx', path: '/src/App.jsx', type: 'file', content: `import React from 'react';\n\nconst App = () => {\n  return (\n    <div className="app">\n      <h1>Hello World!</h1>\n    </div>\n  );\n};\n\nexport default App;` },
            { name: 'main.jsx', path: '/src/main.jsx', type: 'file', content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);` },
            { name: 'index.css', path: '/src/index.css', type: 'file', content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  margin: 0;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',\n    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',\n    sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}` },
            { name: 'components', path: '/src/components', type: 'folder', children: [
                { name: 'Button.jsx', path: '/src/components/Button.jsx', type: 'file', content: `import React from 'react';\n\nconst Button = ({ children, onClick, variant = 'primary' }) => {\n  const variants = {\n    primary: 'bg-blue-500 text-white',\n    secondary: 'bg-gray-500 text-white',\n    danger: 'bg-red-500 text-white',\n  };\n  \n  return (\n    <button \n      onClick={onClick}\n      className={\`px-4 py-2 rounded-lg \${variants[variant]}\`}\n    >\n      {children}\n    </button>\n  );\n};\n\nexport default Button;` },
            ] },
        ] },
        { name: 'package.json', path: '/package.json', type: 'file', content: `{\n  "name": "my-app",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  },\n  "devDependencies": {\n    "@vitejs/plugin-react": "^4.0.0",\n    "vite": "^5.0.0"\n  }\n}` },
        { name: 'vite.config.js', path: '/vite.config.js', type: 'file', content: `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  server: {\n    port: 3000,\n  },\n});` },
    ]);

    const [selectedFile, setSelectedFile] = useState(null);
    const [code, setCode] = useState('');
    const [logs, setLogs] = useState([
        { type: 'info', message: 'Editor initialized', timestamp: new Date().toLocaleTimeString() },
    ]);
    const [splitView, setSplitView] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [isFormatting, setIsFormatting] = useState(false);
    const { formatCode } = usePrettier();

    useEffect(() => {
        if (selectedFile) {
            setCode(selectedFile.content || '');
        }
    }, [selectedFile]);

    const handleFileSelect = (file) => {
        setSelectedFile(file);
    };

    const handleCodeChange = (value) => {
        setCode(value);
        if (selectedFile) {
            const updateFile = (items) => {
                return items.map(item => {
                    if (item.path === selectedFile.path) {
                        return { ...item, content: value };
                    }
                    if (item.children) {
                        return { ...item, children: updateFile(item.children) };
                    }
                    return item;
                });
            };
            setFiles(updateFile(files));
        }
    };

    const handleSave = () => {
        setLogs(prev => [{ type: 'success', message: `File "${selectedFile?.name}" saved successfully`, timestamp: new Date().toLocaleTimeString() }, ...prev]);
    };

    const handleRun = async () => {
        setLogs(prev => [{ type: 'info', message: 'Building project...', timestamp: new Date().toLocaleTimeString() }, ...prev]);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLogs(prev => [{ type: 'success', message: 'Build completed successfully!', timestamp: new Date().toLocaleTimeString() }, ...prev]);
    };

    const handleFormat = async () => {
        setIsFormatting(true);
        try {
            const formatted = await formatCode(code);
            setCode(formatted);
            setLogs(prev => [{ type: 'success', message: 'Code formatted with Prettier', timestamp: new Date().toLocaleTimeString() }, ...prev]);
        } catch (error) {
            setLogs(prev => [{ type: 'error', message: `Format failed: ${error.message}`, timestamp: new Date().toLocaleTimeString() }, ...prev]);
        }
        setIsFormatting(false);
    };

    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedFile?.name || 'code.jsx';
        a.click();
        URL.revokeObjectURL(url);
        setLogs(prev => [{ type: 'success', message: `File "${selectedFile?.name}" downloaded`, timestamp: new Date().toLocaleTimeString() }, ...prev]);
    };

    const handleExportZip = async () => {
        setLogs(prev => [{ type: 'info', message: 'Exporting project as ZIP...', timestamp: new Date().toLocaleTimeString() }, ...prev]);
        // ZIP generation logic would go here
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLogs(prev => [{ type: 'success', message: 'Project exported as ZIP!', timestamp: new Date().toLocaleTimeString() }, ...prev]);
    };

    const handleCommit = (message) => {
        setLogs(prev => [{ type: 'success', message: `Committed: ${message}`, timestamp: new Date().toLocaleTimeString() }, ...prev]);
    };

    const handlePush = () => {
        setLogs(prev => [{ type: 'info', message: 'Pushing to remote...', timestamp: new Date().toLocaleTimeString() }, ...prev]);
        setTimeout(() => {
            setLogs(prev => [{ type: 'success', message: 'Push completed!', timestamp: new Date().toLocaleTimeString() }, ...prev]);
        }, 1000);
    };

    const handlePull = () => {
        setLogs(prev => [{ type: 'info', message: 'Pulling from remote...', timestamp: new Date().toLocaleTimeString() }, ...prev]);
        setTimeout(() => {
            setLogs(prev => [{ type: 'success', message: 'Pull completed!', timestamp: new Date().toLocaleTimeString() }, ...prev]);
        }, 1000);
    };

    const languageMap = {
        '.js': 'javascript',
        '.jsx': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.css': 'css',
        '.json': 'json',
        '.html': 'html',
        '.md': 'markdown',
    };

    const getLanguage = () => {
        if (!selectedFile) return 'javascript';
        const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.'));
        return languageMap[ext] || 'javascript';
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="bg-surface border-b border-border px-4 py-2 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <GitActions 
                        onCommit={handleCommit}
                        onPush={handlePush}
                        onPull={handlePull}
                        onBranch={() => setLogs(prev => [{ type: 'info', message: 'Creating new branch...', timestamp: new Date().toLocaleTimeString() }, ...prev])}
                        onMerge={() => setLogs(prev => [{ type: 'info', message: 'Merging branches...', timestamp: new Date().toLocaleTimeString() }, ...prev])}
                    />
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button variant="ghost" size="sm" onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
                        Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleRun} leftIcon={<Play className="w-4 h-4" />}>
                        Run
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleFormat} leftIcon={<Zap className="w-4 h-4" />} disabled={isFormatting}>
                        {isFormatting ? 'Formatting...' : 'Format'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />}>
                        Download
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleExportZip} leftIcon={<Download className="w-4 h-4" />}>
                        Export ZIP
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowSearch(true)} leftIcon={<Search className="w-4 h-4" />}>
                        Search
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setSplitView(!splitView)} className="p-1.5 rounded hover:bg-surface-light" title="Split View">
                        {splitView ? <Columns className="w-4 h-4 text-text-secondary" /> : <Split className="w-4 h-4 text-text-secondary" />}
                    </button>
                    {selectedFile && (
                        <span className="text-xs text-text-secondary px-2 py-1 bg-surface-light rounded">
                            {selectedFile.name} • {getLanguage().toUpperCase()}
                        </span>
                    )}
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                <FileTree 
                    files={files}
                    onFileSelect={handleFileSelect}
                    selectedFile={selectedFile}
                    onFileCreate={(name, parent) => {
                        setLogs(prev => [{ type: 'success', message: `Created file: ${name}`, timestamp: new Date().toLocaleTimeString() }, ...prev]);
                    }}
                    onFileDelete={(file) => {
                        setLogs(prev => [{ type: 'info', message: `Deleted: ${file.name}`, timestamp: new Date().toLocaleTimeString() }, ...prev]);
                    }}
                    onFileRename={(file) => {
                        setLogs(prev => [{ type: 'info', message: `Renamed: ${file.name}`, timestamp: new Date().toLocaleTimeString() }, ...prev]);
                    }}
                />
                
                {splitView ? (
                    <div className="flex-1 flex">
                        <div className="flex-1 border-r border-border">
                            <Editor
                                height="100%"
                                language={getLanguage()}
                                value={code}
                                onChange={handleCodeChange}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: 'on',
                                    automaticLayout: true,
                                    wordWrap: 'on',
                                    formatOnPaste: true,
                                    formatOnType: true,
                                    suggestOnTriggerCharacters: true,
                                    quickSuggestions: true,
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <Editor
                                height="100%"
                                language={getLanguage()}
                                value={code}
                                onChange={handleCodeChange}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: 'on',
                                    automaticLayout: true,
                                    wordWrap: 'on',
                                    readOnly: false,
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            language={getLanguage()}
                            value={code}
                            onChange={handleCodeChange}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                automaticLayout: true,
                                wordWrap: 'on',
                                formatOnPaste: true,
                                formatOnType: true,
                                suggestOnTriggerCharacters: true,
                                quickSuggestions: true,
                                acceptSuggestionOnEnter: 'on',
                                tabCompletion: 'on',
                                snippetSuggestions: 'top',
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Console Panel */}
            <ConsolePanel logs={logs} onClear={() => setLogs([])} onRun={handleRun} />

            {/* Search Modal */}
            <SearchInFiles
                isOpen={showSearch}
                onClose={() => setShowSearch(false)}
                files={files}
                onOpenFile={(filePath, line) => {
                    const findFile = (items) => {
                        for (const item of items) {
                            if (item.path === filePath) {
                                setSelectedFile(item);
                                return true;
                            }
                            if (item.children && findFile(item.children)) {
                                return true;
                            }
                        }
                        return false;
                    };
                    findFile(files);
                    setShowSearch(false);
                }}
            />
        </div>
    );
};

export default CodeEditor;