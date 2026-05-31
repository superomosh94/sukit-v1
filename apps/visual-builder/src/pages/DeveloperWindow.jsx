import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Eye, Terminal, Beaker, Bug, Play, Square, RefreshCw, Monitor, Smartphone, Tablet, Sidebar, X, ChevronRight, ChevronDown, File, Folder, Info, AlertTriangle, XCircle, CheckCircle, FileText } from 'lucide-react';
import { cn } from '../utils/cn';
import { usePluginStore } from '../stores/pluginStore';

const getLogColor = (type) => {
  switch (type) {
    case 'info': return 'text-blue-400';
    case 'warn': return 'text-yellow-400';
    case 'error': return 'text-red-400';
    case 'success': return 'text-green-400';
    default: return 'text-gray-300';
  }
};

const getLogIcon = (type) => {
  switch (type) {
    case 'info': return <Info className="w-4 h-4 text-blue-400" />;
    case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
    case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
    default: return <FileText className="w-4 h-4 text-gray-300" />;
  }
};

let logId = 0;
const addLog = (type, message) => ({
  id: ++logId,
  type,
  message,
  timestamp: new Date().toISOString()
});

const runTests = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        passed: 45,
        failed: 3,
        time: '2.3s',
        results: [
          { name: 'Plugin mounts correctly', status: 'pass' },
          { name: 'Theme colors match snapshot', status: 'pass' },
          { name: 'Settings are persisted', status: 'pass' },
          { name: 'Hot reload preserves state', status: 'pass' },
          { name: 'API endpoints return 200', status: 'pass' },
          { name: 'Cross-plugin communication', status: 'fail', error: 'Timeout exceeded' },
          { name: 'Responsive layout matches breakpoints', status: 'pass' },
          { name: 'Accessibility attributes present', status: 'fail', error: 'Missing aria-label on button' },
          { name: 'Error boundary catches exceptions', status: 'pass' },
          { name: 'Plugin unregister cleans up', status: 'pass' },
          { name: 'CSS isolation works', status: 'pass' },
          { name: 'E2E: Full workflow completes', status: 'fail', error: 'Step 3: Assertion failed' }
        ],
        coverage: {
          statements: 78.5,
          branches: 65.2,
          functions: 82.1,
          lines: 76.8
        }
      });
    }, 1500);
  });
};

export const DeveloperWindow = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('preview');
  const [activePlugin, setActivePlugin] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hotReloading, setHotReloading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deviceMode, setDeviceMode] = useState('desktop');
  const [rtlPreview, setRtlPreview] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [selectedFile, setSelectedFile] = useState('src/components/PluginComponent.jsx');
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);
  const iframeRef = useRef(null);
  const consoleRef = useRef(null);
  const { availablePlugins, installedPlugins, fetchPlugins } = usePluginStore();
  const plugins = [...availablePlugins];

  useEffect(() => {
    fetchPlugins();
  }, []);

  useEffect(() => {
    if (availablePlugins.length > 0) {
      setLogs(prev => [...prev, addLog('success', `Loaded ${availablePlugins.length} plugins from marketplace`)]);
    }
  }, [availablePlugins]);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const handleStart = () => {
    if (!activePlugin) return;
    setIsRunning(true);
    setLogs(prev => [...prev, addLog('info', `Starting dev environment for ${activePlugin.displayName || activePlugin.name}...`)]);
    setHotReloading(true);
    setTimeout(() => {
      setHotReloading(false);
      setLogs(prev => [...prev, addLog('success', `${activePlugin.displayName || activePlugin.name} ready at http://localhost:5173`)]);
    }, 1500);
  };

  const handleStop = () => {
    setIsRunning(false);
    setHotReloading(false);
    setLogs(prev => [...prev, addLog('warn', `Stopped ${activePlugin?.displayName || activePlugin?.name || 'dev environment'}`)]);
  };

  const handleClearLogs = () => {
    setLogs([]);
    logId = 0;
  };

  const handleExportLogs = () => {
    const logText = logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'developer-logs.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCommandSubmit = () => {
    if (!commandInput.trim() || !iframeRef.current) return;
    iframeRef.current.contentWindow.postMessage({ type: 'execute-command', command: commandInput }, '*');
    setLogs(prev => [...prev, addLog('info', `> ${commandInput}`)]);
    setCommandInput('');
  };

  const handleRunTests = async (type) => {
    setTesting(true);
    setLogs(prev => [...prev, addLog('info', `Running ${type || 'all'} tests...`)]);
    const results = await runTests();
    setTestResults(results);
    setTesting(false);
    setLogs(prev => [...prev, addLog('success', `${type || 'All'} tests completed: ${results.passed} passed, ${results.failed} failed`)]);
  };

  const tabs = [
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'console', label: 'Console', icon: Terminal },
    { id: 'code', label: 'Code', icon: Code },
    { id: 'tests', label: 'Tests', icon: Beaker }
  ];

  return (
    <div className="h-screen w-screen bg-gray-900 text-gray-200 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Bug size={18} className="text-primary-400" />
          <span className="font-semibold text-sm">Developer Window</span>
          <div className="h-4 w-px bg-gray-600" />
          <select
            value={activePlugin?.name || ''}
            onChange={(e) => setActivePlugin(plugins.find(p => p.name === e.target.value) || null)}
            className="bg-gray-700 text-sm text-gray-200 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-primary-500"
          >
            <option value="">Select plugin...</option>
            {plugins.map(p => (
              <option key={p.name} value={p.name}>{p.displayName || p.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button onClick={handleStart} disabled={!activePlugin} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded">
              <Play size={14} /> Start
            </button>
          ) : (
            <button onClick={handleStop} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 rounded">
              <Square size={14} /> Stop
            </button>
          )}
          <button onClick={() => navigate(-1)} className="p-1.5 text-gray-400 hover:text-white rounded">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={cn('flex flex-col bg-gray-850 border-r border-gray-700 transition-all duration-200', sidebarOpen ? 'w-56' : 'w-0 overflow-hidden')}>
          <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
            <span className="text-xs font-medium">Plugins</span>
            <span className="text-xs text-gray-500">{plugins.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {plugins.length === 0 ? (
              <div className="p-3 text-xs text-gray-500 text-center">No plugins found</div>
            ) : (
              plugins.map(p => (
                <button
                  key={p.name}
                  onClick={() => setActivePlugin(p)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-xs hover:bg-gray-700 flex items-center gap-2',
                    activePlugin?.name === p.name ? 'bg-primary-600 bg-opacity-20 text-primary-300 border-l-2 border-primary-500' : 'text-gray-300'
                  )}
                >
                  <Folder size={12} />
                  <span className="truncate">{p.displayName || p.name}</span>
                  {p.buildVersion > 0 && <span className="ml-auto text-gray-500">v{p.buildVersion}</span>}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Bar */}
          <div className="flex items-center bg-gray-800 border-b border-gray-700">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-400 hover:text-white border-r border-gray-700">
              <Sidebar size={14} />
            </button>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-r border-gray-700 transition-colors',
                    activeTab === tab.id ? 'bg-gray-700 text-primary-300 border-b-2 border-b-primary-500' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-750'
                  )}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
            <div className="flex-1" />
            <button onClick={() => setLogs(prev => [...prev, addLog('info', `Plugins loaded: ${plugins.length}`)])} className="p-2 text-gray-400 hover:text-white">
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {!activePlugin ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Bug size={48} className="mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400 text-sm">Select a plugin to begin development</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'preview' && (
                  <div className="h-full flex">
                    <div className="flex-1 flex flex-col bg-gray-900">
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700">
                        <button onClick={() => setDeviceMode('desktop')} className={cn('p-1.5 rounded text-xs', deviceMode === 'desktop' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-700')}>
                          <Monitor size={14} />
                        </button>
                        <button onClick={() => setDeviceMode('tablet')} className={cn('p-1.5 rounded text-xs', deviceMode === 'tablet' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-700')}>
                          <Tablet size={14} />
                        </button>
                        <button onClick={() => setDeviceMode('mobile')} className={cn('p-1.5 rounded text-xs', deviceMode === 'mobile' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-700')}>
                          <Smartphone size={14} />
                        </button>
                      </div>
                      <div className={cn('flex-1 w-full overflow-hidden bg-gray-900', deviceMode !== 'desktop' && 'flex items-center justify-center')}>
                        {activePlugin.preview?.component ? (
                          <iframe
                            ref={iframeRef}
                            src={`/preview.html?plugin=${activePlugin.name}&component=${activePlugin.preview.component}`}
                            className={cn('transition-all', {
                              'w-full h-full': deviceMode === 'desktop',
                              'w-[768px] h-full max-h-[1024px]': deviceMode === 'tablet',
                              'w-[375px] h-full max-h-[812px]': deviceMode === 'mobile'
                            })}
                            title="Plugin Preview"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-gray-500">
                            <Code size={32} />
                            <p className="text-sm">No component preview defined</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-64 bg-gray-850 border-l border-gray-700 overflow-y-auto">
                      <div className="p-3 border-b border-gray-700">
                        <h3 className="text-xs font-medium mb-2">Device Settings</h3>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-xs text-gray-400">
                            <input type="radio" name="device" checked={deviceMode === 'desktop'} onChange={() => setDeviceMode('desktop')} className="accent-primary-500" />
                            Desktop
                          </label>
                          <label className="flex items-center gap-2 text-xs text-gray-400">
                            <input type="radio" name="device" checked={deviceMode === 'tablet'} onChange={() => setDeviceMode('tablet')} className="accent-primary-500" />
                            Tablet
                          </label>
                          <label className="flex items-center gap-2 text-xs text-gray-400">
                            <input type="radio" name="device" checked={deviceMode === 'mobile'} onChange={() => setDeviceMode('mobile')} className="accent-primary-500" />
                            Mobile
                          </label>
                        </div>
                        <div className="mt-3 space-y-2">
                          <label className="flex items-center gap-2 text-xs text-gray-400">
                            <input type="checkbox" checked={rtlPreview} onChange={() => setRtlPreview(!rtlPreview)} className="accent-primary-500" />
                            RTL Preview
                          </label>
                          <label className="flex items-center gap-2 text-xs text-gray-400">
                            <input type="checkbox" checked={accessibilityMode} onChange={() => setAccessibilityMode(!accessibilityMode)} className="accent-primary-500" />
                            Accessibility Mode
                          </label>
                        </div>
                      </div>
                      <div className="p-3 border-b border-gray-700">
                        <h3 className="text-xs font-medium mb-2">Plugin Data</h3>
                        <div className="space-y-2">
                          <button className="w-full text-xs px-2 py-1.5 bg-red-600 bg-opacity-20 text-red-400 hover:bg-opacity-30 rounded text-left">Reset Plugin Data</button>
                          <button className="w-full text-xs px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-left text-gray-300">Export Configuration</button>
                          <button className="w-full text-xs px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-left text-gray-300">Import Configuration</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'console' && (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400">{logs.length} logs</span>
                        <button onClick={handleClearLogs} className="text-xs text-gray-400 hover:text-white">Clear</button>
                        <button onClick={handleExportLogs} className="text-xs text-gray-400 hover:text-white">Export</button>
                      </div>
                    </div>
                    <div ref={consoleRef} className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1 bg-gray-950">
                      {logs.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-600">No logs yet</div>
                      ) : (
                        logs.map(log => (
                          <div key={log.id} className="flex items-start gap-2">
                            <span className="text-gray-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span className="shrink-0">{getLogIcon(log.type)}</span>
                            <span className={cn('break-all', getLogColor(log.type))}>{log.message}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-t border-gray-700">
                      <span className="text-gray-500 text-xs">&gt;</span>
                      <input
                        type="text"
                        value={commandInput}
                        onChange={(e) => setCommandInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCommandSubmit()}
                        placeholder="Execute JavaScript in preview..."
                        className="flex-1 bg-transparent text-xs text-gray-200 outline-none placeholder-gray-600"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'code' && (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedFile}
                          onChange={(e) => setSelectedFile(e.target.value)}
                          className="bg-gray-700 text-xs text-gray-200 border border-gray-600 rounded px-2 py-1 focus:outline-none"
                        >
                          <option>src/components/PluginComponent.jsx</option>
                          <option>src/hooks/usePlugin.js</option>
                          <option>src/utils/pluginHelpers.js</option>
                          <option>plugin.json</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300">Save Changes</button>
                        <button className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300">Format</button>
                        <button className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300">Lint</button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-gray-950 p-4">
                      <pre className="text-xs font-mono text-gray-300 leading-relaxed">
{`import React, { useState } from 'react';
import { useTheme } from '../hooks/usePluginTheme';

export const PluginComponent = ({ settings, onUpdate }) => {
  const { colors } = useTheme();
  const [count, setCount] = useState(0);

  return (
    <div style={{
      padding: '16px',
      background: colors.surface || '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{
        color: colors.primary || '#3B82F6',
        marginBottom: '8px'
      }}>
        Plugin Component
      </h3>
      <p style={{ color: colors.text || '#374151' }}>
        Count: {count}
      </p>
      <button
        onClick={() => setCount(c => c + 1)}
        style={{
          background: colors.primary || '#3B82F6',
          color: '#ffffff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Increment
      </button>
    </div>
  );
};`}
                      </pre>
                    </div>
                    {hotReloading && (
                      <div className="px-3 py-1.5 bg-blue-600 bg-opacity-20 border-t border-blue-500 text-blue-400 text-xs flex items-center gap-2">
                        <RefreshCw size={12} className="animate-spin" />
                        Hot reload active — changes will apply automatically
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'tests' && (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700">
                      <button onClick={() => handleRunTests('all')} disabled={testing} className="px-3 py-1.5 text-xs bg-primary-600 hover:bg-primary-500 disabled:opacity-50 rounded text-white">
                        Run All Tests
                      </button>
                      <button onClick={() => handleRunTests('unit')} disabled={testing} className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded text-gray-300">
                        Run Unit Tests
                      </button>
                      <button onClick={() => handleRunTests('e2e')} disabled={testing} className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded text-gray-300">
                        Run E2E Tests
                      </button>
                      {testing && <RefreshCw size={14} className="animate-spin text-primary-400 ml-2" />}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {testResults ? (
                        <>
                          <div className="flex items-center gap-6 text-sm">
                            <span className="text-green-400">✓ {testResults.passed} passed</span>
                            <span className="text-red-400">✗ {testResults.failed} failed</span>
                            <span className="text-gray-400">⏱ {testResults.time}</span>
                          </div>
                          <div className="space-y-1">
                            {testResults.results.map((r, i) => (
                              <div key={i} className={cn('flex items-center gap-2 text-xs px-3 py-1.5 rounded', r.status === 'pass' ? 'bg-green-900 bg-opacity-20 text-green-400' : 'bg-red-900 bg-opacity-20 text-red-400')}>
                                <span>{r.status === 'pass' ? '✓' : '✗'}</span>
                                <span>{r.name}</span>
                                {r.error && <span className="text-gray-500 ml-auto">{r.error}</span>}
                              </div>
                            ))}
                          </div>
                          {testResults.coverage && (
                            <div className="border-t border-gray-700 pt-4">
                              <h3 className="text-xs font-medium mb-3 text-gray-400 uppercase tracking-wider">Coverage Report</h3>
                              <div className="space-y-2">
                                {Object.entries(testResults.coverage).map(([key, val]) => (
                                  <div key={key} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 w-20 capitalize">{key}</span>
                                    <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                                      <div className={cn('h-full rounded-full transition-all', val >= 80 ? 'bg-green-500' : val >= 60 ? 'bg-yellow-500' : 'bg-red-500')} style={{ width: `${val}%` }} />
                                    </div>
                                    <span className="text-xs text-gray-300 w-12 text-right">{val}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-600 text-sm">Run tests to see results</div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-gray-800 border-t border-gray-700 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          {activePlugin && (
            <>
              <span className="text-gray-300">{activePlugin.displayName || activePlugin.name}</span>
              <span>v{activePlugin.version || '0.0.0'}</span>
              <span className={cn('flex items-center gap-1', isRunning ? 'text-green-400' : 'text-gray-500')}>
                <span className={cn('w-1.5 h-1.5 rounded-full', isRunning ? 'bg-green-400' : 'bg-gray-600')} />
                {isRunning ? 'Running' : 'Stopped'}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className={cn('flex items-center gap-1', hotReloading ? 'text-blue-400' : 'text-gray-500')}>
            <RefreshCw size={10} className={cn(hotReloading && 'animate-spin')} />
            Hot Reload
          </span>
          <span className="text-gray-500">{plugins.length} plugins loaded</span>
        </div>
      </div>

      {/* Hot Reload Overlay */}
      {hotReloading && (
        <div className="fixed bottom-20 right-6 z-50 bg-green-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
          <RefreshCw size={12} className="animate-spin" />
          Hot Reloading...
        </div>
      )}
    </div>
  );
};
