const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Store operations
  getStore: (key) => ipcRenderer.invoke('store:get', key),
  setStore: (key, value) => ipcRenderer.invoke('store:set', key, value),

  // Project management
  createProject: (options) => ipcRenderer.invoke('project:create', options),
  loadProject: (path) => ipcRenderer.invoke('project:load', path),
  saveProject: (data) => ipcRenderer.invoke('project:save', data),

  // Component generation
  generateComponent: (payload) => ipcRenderer.invoke('component:generate', payload),

  // Deployment
  deployToVercel: (projectPath) => ipcRenderer.invoke('deploy:vercel', projectPath),

  // Dialogs and file system
  selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),
  fileExists: (path) => ipcRenderer.invoke('fs:exists', path),

  // Error logging from renderer
  logError: (msg) => ipcRenderer.invoke('log:error', msg),

  // Plugins
  getPlugins: () => ipcRenderer.invoke('plugins:list')
});
