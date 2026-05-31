// Core modules
const path = require('path');
const fs = require('fs-extra');

// Electron and related modules
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const express = require('express');
const http = require('http');
const { exec } = require('child_process');
const Store = require('electron-store');
const QRCode = require('qrcode');
const WebSocket = require('ws');

// Enable live reload in development
if (process.env.NODE_ENV !== 'production') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
  });
}

// Ensure logs directory exists
fs.ensureDirSync(path.join(__dirname, 'logs'));

// Default project setup
const DEFAULT_PROJECT_PATH = path.join(__dirname, 'default-project');
if (!fs.existsSync(DEFAULT_PROJECT_PATH)) {
  fs.ensureDirSync(DEFAULT_PROJECT_PATH);
  const defaultProject = {
    name: 'Default Project',
    version: '1.0.0',
    pages: [],
    components: [],
    createdAt: new Date()
  };
  fs.writeJsonSync(path.join(DEFAULT_PROJECT_PATH, 'project.json'), defaultProject, { spaces: 2 });
}

// IPC handler for logging errors from renderer
ipcMain.handle('log:error', async (event, msg) => {
  const logFile = path.join(__dirname, 'logs', 'error.log');
  const entry = `${new Date().toISOString()} ${msg}\n`;
  await fs.appendFile(logFile, entry);
});


// Ensure only one instance of the Visual Builder runs
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  // Exit early; another instance is already running
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Focus the existing window if a second instance is launched
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}



const store = new Store({ defaults: { recentProjects: [], theme: 'dark' } });

let mainWindow = null;
let previewServer = null;
let wsServer = null;
let isDev = true; // force dev mode for debugging

// Preview Server
async function startPreviewServer(projectPath) {
  if (previewServer) previewServer.close();
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });
  wss.on('connection', (ws) => {


  });
  app.use(express.static(projectPath));
  app.use(express.json());
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.post('/api/update', (req, res) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(req.body));
    });
    res.json({ success: true });
  });
  server.listen(3000, () => console.log('Preview server running on port 3000'));
  previewServer = server;
  wsServer = wss;
  return { port: 3000, url: `http://localhost:3000` };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1a2e',
    show: false
  });

  mainWindow.loadFile('dist/index.html');
  if (isDev) mainWindow.webContents.openDevTools();
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  if (gotLock) {
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  }
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// IPC Handlers
ipcMain.handle('store:get', (event, key) => store.get(key));
ipcMain.handle('store:set', (event, key, value) => store.set(key, value));

ipcMain.handle('project:create', async (event, { name, path: projectPath, template }) => {
  const fullPath = `${projectPath}/${name}`;
  await fs.ensureDir(fullPath);
  await fs.ensureDir(`${fullPath}/src/components`);
  await fs.ensureDir(`${fullPath}/src/pages`);
  await fs.writeJson(`${fullPath}/project.json`, { name, version: '1.0.0', pages: [], components: [], createdAt: new Date() }, { spaces: 2 });
  const recent = store.get('recentProjects') || [];
  recent.unshift({ name, path: fullPath, timestamp: Date.now() });
  store.set('recentProjects', recent.slice(0, 10));
  return { success: true, path: fullPath };
});

ipcMain.handle('project:load', async (event, projectPath) => {
  const pathToLoad = projectPath || DEFAULT_PROJECT_PATH;
  const project = await fs.readJson(`${pathToLoad}/project.json`);
  const preview = await startPreviewServer(pathToLoad);
  const qrCode = await QRCode.toDataURL(`http://localhost:3000`);
  return { project, preview, qrCode };
});

ipcMain.handle('project:save', async (event, { projectPath, project }) => {
  await fs.writeJson(`${projectPath}/project.json`, project, { spaces: 2 });
  if (wsServer) wsServer.clients.forEach(client => client.send(JSON.stringify({ type: 'project-updated', data: project })));
  return { success: true };
});

ipcMain.handle('component:generate', async (event, { component, props }) => {
  const code = `import React from 'react';\n\nconst ${component.name} = (${JSON.stringify(props)}) => {\n  return <div>${component.name} Component</div>;\n};\n\nexport default ${component.name};\n`;
  return { success: true, code };
});

ipcMain.handle('deploy:vercel', async (event, projectPath) => {
  return new Promise((resolve) => {
    exec('vercel --prod', { cwd: projectPath }, (error, stdout) => {
      if (error) resolve({ success: false, error: error.message });
      else resolve({ success: true, url: stdout.match(/https:\/\/[^\s]+/)?.[0] || 'deployed' });
    });
  });
});

ipcMain.handle('dialog:selectDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory', 'createDirectory'] });
  return result.filePaths[0] || null;
});

ipcMain.handle('fs:exists', (event, filePath) => fs.pathExists(filePath));

ipcMain.handle('plugins:list', async () => {
  const pluginsDir = path.join(__dirname, '..', 'plugins');
  const entries = await fs.readdir(pluginsDir, { withFileTypes: true });
  const plugins = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(pluginsDir, entry.name, 'plugin.json');
    if (await fs.pathExists(manifestPath)) {
      const manifest = await fs.readJson(manifestPath);
      plugins.push({
        id: entry.name,
        name: entry.name,
        displayName: manifest.displayName || entry.name,
        version: manifest.version || '0.0.0',
        author: manifest.author || 'Unknown',
        description: manifest.description || '',
        category: manifest.category || 'uncategorized',
        icon: manifest.icon || '📦',
        license: manifest.license || 'MIT',
        price: manifest.price || 'free',
        rating: manifest.rating || 0,
        downloads: manifest.downloads || 0,
        tags: manifest.tags || [],
        settings: manifest.settings || {},
        requirements: manifest.requirements || {},
        envVars: manifest.envVars || []
      });
    }
  }
  return plugins;
});
