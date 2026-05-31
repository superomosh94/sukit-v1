// renderer.js
/* High-Fidelity Renderer script for SuKit Visual Builder */

import { useEditorStore } from './stores/editorStore.js';
const store = useEditorStore();

// Helper to get DOM elements
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// Global console logger bridge
window.logToConsole = (msg) => {
  const pre = $('#consoleContent');
  if (pre) {
    const time = new Date().toLocaleTimeString();
    pre.textContent += `[${time}] ${msg}\n`;
    pre.scrollTop = pre.scrollHeight;
  }
};

// Error tracking
window.addEventListener('error', (e) => {
  const msg = `System Error: ${e.message} at ${e.filename}:${e.lineno}`;
  window.logToConsole(msg);
  if (window.api && typeof window.api.logError === 'function') {
    window.api.logError(msg);
  }
});

window.addEventListener('unhandledrejection', (e) => {
  const msg = `Unhandled Rejection: ${e.reason}`;
  window.logToConsole(msg);
  if (window.api && typeof window.api.logError === 'function') {
    window.api.logError(msg);
  }
});

// Categories and lists of components for the library
const COMPONENT_METADATA = {
  layout: [
    { type: 'Container', label: 'Box Container', icon: '<rect x="3" y="3" width="18" height="18" rx="2"></rect>' },
    { type: 'Section', label: 'Section Wrapper', icon: '<rect x="3" y="3" width="18" height="8" rx="1"></rect><rect x="3" y="13" width="18" height="8" rx="1"></rect>' },
    { type: 'Card', label: 'Visual Card', icon: '<rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M7 8h10M7 12h5"></path>' }
  ],
  basic: [
    { type: 'Heading', label: 'Header Text', icon: '<path d="M4 4v16M12 4v16M4 12h8"></path>' },
    { type: 'Paragraph', label: 'Body Copy', icon: '<path d="M4 7h16M4 12h16M4 17h10"></path>' },
    { type: 'Button', label: 'Action Button', icon: '<rect x="3" y="6" width="18" height="12" rx="2"></rect><path d="M8 12h8"></path>' },
    { type: 'Image', label: 'Picture Box', icon: '<rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>' }
  ],
  advanced: [
    { type: 'Form', label: 'Input Form', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line>' },
    { type: 'Table', label: 'Data Grid', icon: '<path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18"></path>' },
    { type: 'Modal', label: 'Popup Overlay', icon: '<rect x="3" y="3" width="18" height="18" rx="2"></rect><rect x="7" y="7" width="10" height="10" rx="1"></rect>' }
  ]
};

// Initialize UI
function init() {
  window.logToConsole('SuKit Visual Builder Initializing...');
  
  // Set up auth logic
  setupAuth();
  
  // Scaffolding panels
  setupTabs();
  loadComponentLibrary();
  setupCanvasDropZone();
  setupToolbar();
  setupKeyboardShortcuts();
  setupDatabaseAndApis();
  
  // Initial render
  updateUI();
  window.logToConsole('Ready.');
}

// Auth screen
function setupAuth() {
  const loginForm = $('#loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = $('#loginUser')?.value || '';
      const pass = $('#loginPass')?.value || '';
      if (user === 'admin' && pass === 'admin') {
        window.logToConsole('Authentication approved.');
        $('#view-login').style.display = 'none';
        $('#appContainer').style.display = 'flex';
        updateUI();
      } else {
        const msg = $('#loginMessage');
        if (msg) msg.textContent = 'Invalid credentials. Access Denied.';
      }
    });
  }
}

// Side tab toggles
function setupTabs() {
  const tabs = $$('.sidebar-nav .nav-btn');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const target = btn.dataset.tab;
      $$('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      $(`#tab-${target}`)?.classList.add('active');
      window.logToConsole(`Switched tab to: ${target}`);
    });
  });

  // Setup properties tabs
  const propTabs = $$('.prop-tab-btn');
  propTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      propTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const comp = store.getState().components.find(c => c.id === store.getState().selectedComponentId);
      renderPropertyPanel(comp);
    });
  });
}

// Component lists
function loadComponentLibrary() {
  // Render search filtering
  $('#componentSearch')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    filterComponents(q);
  });

  renderComponentGrid('layoutComponents', COMPONENT_METADATA.layout);
  renderComponentGrid('basicComponents', COMPONENT_METADATA.basic);
  renderComponentGrid('advancedComponents', COMPONENT_METADATA.advanced);
}

function renderComponentGrid(elementId, list) {
  const grid = $(`#${elementId}`);
  if (!grid) return;
  grid.innerHTML = list.map(item => `
    <div class="component-item" draggable="true" data-type="${item.type}">
      <svg class="icon" viewBox="0 0 24 24">${item.icon}</svg>
      <span>${item.label}</span>
    </div>
  `).join('');

  $$(`#${elementId} .component-item`).forEach(el => {
    el.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', el.dataset.type);
      el.style.opacity = '0.5';
    });
    el.addEventListener('dragend', () => {
      el.style.opacity = '1';
    });
  });
}

function filterComponents(query) {
  $$('.component-item').forEach(el => {
    const label = el.querySelector('span').textContent.toLowerCase();
    const type = el.dataset.type.toLowerCase();
    if (label.includes(query) || type.includes(query)) {
      el.style.display = 'flex';
    } else {
      el.style.display = 'none';
    }
  });
}

// Drag & Drop
function setupCanvasDropZone() {
  const canvas = $('#canvas');
  if (!canvas) return;

  canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    canvas.classList.add('drag-active');
  });

  canvas.addEventListener('dragleave', () => {
    canvas.classList.remove('drag-active');
  });

  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    canvas.classList.remove('drag-active');
    const type = e.dataTransfer.getData('text/plain');
    if (type) {
      window.logToConsole(`Dropped new component: ${type}`);
      store.getState().addComponent(type);
      updateUI();
    }
  });

  // Unselect when clicking on blank canvas area
  canvas.addEventListener('click', (e) => {
    if (e.target === canvas || e.target.classList.contains('canvas-placeholder')) {
      store.getState().selectComponent(null);
      updateUI();
    }
  });
}

// Render dynamic components on canvas
function renderCanvas() {
  const canvas = $('#canvas');
  if (!canvas) return;

  const { components, selectedComponentId } = store.getState();

  if (components.length === 0) {
    canvas.innerHTML = `
      <div class="canvas-placeholder">
        <svg class="placeholder-icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
        <h3>Your Interactive Canvas</h3>
        <p>Drag and drop components from the left sidebar to start building.</p>
      </div>
    `;
    return;
  }

  canvas.innerHTML = components.map(c => {
    const isSelected = selectedComponentId === c.id ? 'selected' : '';
    const styleString = Object.entries(c.styles || {}).map(([k,v]) => `${k}:${v}`).join(';');
    
    let previewContent = `<strong>${c.type}</strong>`;
    if (c.type === 'Button') {
      previewContent = `<button class="tool-btn primary" style="pointer-events:none; width: 100%;">${c.props.text || 'Action Button'}</button>`;
    } else if (c.type === 'Heading') {
      previewContent = `<h2 style="margin:0; font-weight:700; font-size:24px;">${c.props.text || 'Heading'}</h2>`;
    } else if (c.type === 'Paragraph') {
      previewContent = `<p style="margin:0; color:var(--text-muted); font-size:14px; line-height:1.6;">${c.props.text || 'This is paragraph content.'}</p>`;
    } else if (c.type === 'Image') {
      previewContent = `<div style="width:100%; height:120px; background:#1e1e38; border-radius:6px; display:flex; align-items:center; justify-content:center; color:var(--text-muted); overflow:hidden;">${c.props.src ? `<img src="${c.props.src}" style="width:100%;height:100%;object-fit:cover;" />` : 'Image Placebox'}</div>`;
    } else if (c.type === 'Card') {
      previewContent = `
        <div style="background:#131326; border:1px solid var(--border-color); border-radius:8px; padding:16px;">
          <h4 style="margin:0 0 8px 0;">${c.props.title || 'Card Title'}</h4>
          <p style="margin:0; font-size:12px; color:var(--text-muted);">${c.props.text || 'Card body text goes here.'}</p>
        </div>
      `;
    } else {
      previewContent = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>${c.type}</strong>
          <span style="font-size:10px; color:var(--text-muted);">${c.props.text || ''}</span>
        </div>
      `;
    }

    return `
      <div class="canvas-component ${isSelected}" data-id="${c.id}" style="${styleString}">
        <div class="component-remove" data-id="${c.id}">✕</div>
        ${previewContent}
      </div>
    `;
  }).join('');

  // Register selection and removal handlers
  $$('#canvas .canvas-component').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.dataset.id;
      store.getState().selectComponent(id);
      updateUI();
    });
  });

  $$('#canvas .component-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      store.getState().deleteComponent(id);
      updateUI();
    });
  });
}

// Right properties panel
function renderPropertyPanel(comp) {
  const panel = $('#propertyPanel');
  if (!panel) return;

  if (!comp) {
    panel.innerHTML = `<div class="empty-state">Select a component to inspect.</div>`;
    return;
  }

  const activeTab = $('.prop-tab-btn.active')?.dataset.propTab || 'content';

  if (activeTab === 'content') {
    let customFields = '';
    if (comp.type === 'Heading' || comp.type === 'Paragraph' || comp.type === 'Button') {
      customFields = `
        <div class="property-group">
          <label>Display Text</label>
          <input type="text" id="propText" value="${comp.props.text || ''}" />
        </div>
      `;
    } else if (comp.type === 'Image') {
      customFields = `
        <div class="property-group">
          <label>Image URL source</label>
          <input type="text" id="propSrc" value="${comp.props.src || ''}" placeholder="https://images.unsplash.com/..." />
        </div>
      `;
    } else if (comp.type === 'Card') {
      customFields = `
        <div class="property-group">
          <label>Card Title</label>
          <input type="text" id="propCardTitle" value="${comp.props.title || ''}" />
        </div>
        <div class="property-group">
          <label>Card Description</label>
          <textarea id="propCardText" rows="3">${comp.props.text || ''}</textarea>
        </div>
      `;
    }

    panel.innerHTML = `
      <div class="property-group">
        <label>Component ID</label>
        <input type="text" value="${comp.id}" disabled />
      </div>
      <div class="property-group">
        <label>Type Category</label>
        <input type="text" value="${comp.type}" disabled />
      </div>
      ${customFields}
    `;

    // Listeners for Content Inputs
    $('#propText')?.addEventListener('input', (e) => {
      store.getState().updateComponent(comp.id, { props: { ...comp.props, text: e.target.value } });
      renderCanvas();
    });
    $('#propSrc')?.addEventListener('input', (e) => {
      store.getState().updateComponent(comp.id, { props: { ...comp.props, src: e.target.value } });
      renderCanvas();
    });
    $('#propCardTitle')?.addEventListener('input', (e) => {
      store.getState().updateComponent(comp.id, { props: { ...comp.props, title: e.target.value } });
      renderCanvas();
    });
    $('#propCardText')?.addEventListener('input', (e) => {
      store.getState().updateComponent(comp.id, { props: { ...comp.props, text: e.target.value } });
      renderCanvas();
    });

  } else if (activeTab === 'style') {
    // Styling attributes
    panel.innerHTML = `
      <div class="property-group">
        <label>Width</label>
        <input type="text" id="styleWidth" value="${comp.styles.width || '100%'}" placeholder="e.g. 100%, 300px" />
      </div>
      <div class="property-group">
        <label>Padding</label>
        <input type="text" id="stylePadding" value="${comp.styles.padding || '16px'}" placeholder="e.g. 12px, 20px" />
      </div>
      <div class="property-group">
        <label>Background Color</label>
        <input type="color" id="styleBg" value="${comp.styles['background-color'] || '#161630'}" />
      </div>
      <div class="property-group">
        <label>Margin Bottom</label>
        <input type="text" id="styleMargin" value="${comp.styles['margin-bottom'] || '12px'}" />
      </div>
    `;

    const updateStyle = (key, val) => {
      const styles = { ...comp.styles, [key]: val };
      store.getState().updateComponent(comp.id, { styles });
      renderCanvas();
    };

    $('#styleWidth')?.addEventListener('input', (e) => updateStyle('width', e.target.value));
    $('#stylePadding')?.addEventListener('input', (e) => updateStyle('padding', e.target.value));
    $('#styleBg')?.addEventListener('input', (e) => updateStyle('background-color', e.target.value));
    $('#styleMargin')?.addEventListener('input', (e) => updateStyle('margin-bottom', e.target.value));

  } else if (activeTab === 'advanced') {
    // Advanced features
    panel.innerHTML = `
      <div class="property-group">
        <label>CSS Class Attribute</label>
        <input type="text" id="advClass" value="${comp.props.className || ''}" placeholder="custom-class-name" />
      </div>
      <div class="property-group">
        <label>Interactivity Logic</label>
        <select id="advInteraction">
          <option value="none" ${comp.props.action === 'none' ? 'selected' : ''}>None</option>
          <option value="alert" ${comp.props.action === 'alert' ? 'selected' : ''}>Trigger System Alert</option>
          <option value="route" ${comp.props.action === 'route' ? 'selected' : ''}>Redirect to Route</option>
        </select>
      </div>
    `;

    $('#advClass')?.addEventListener('input', (e) => {
      store.getState().updateComponent(comp.id, { props: { ...comp.props, className: e.target.value } });
    });
    $('#advInteraction')?.addEventListener('change', (e) => {
      store.getState().updateComponent(comp.id, { props: { ...comp.props, action: e.target.value } });
    });
  }
}

// Document tree layers panel
function renderLayers() {
  const panel = $('#layerPanel');
  if (!panel) return;

  const { components, selectedComponentId } = store.getState();

  if (components.length === 0) {
    panel.innerHTML = `<div class="empty-state">No components placed yet.</div>`;
    return;
  }

  panel.innerHTML = components.map(c => {
    const activeClass = selectedComponentId === c.id ? 'active' : '';
    return `
      <div class="layer-item ${activeClass}" data-id="${c.id}">
        <span>${c.type} <span style="font-size:9px;color:var(--text-muted);">#${c.id.substring(c.id.length-4)}</span></span>
        <svg class="icon" viewBox="0 0 24 24" style="width:12px;height:12px;opacity:0.6;"><path d="M12 20h9M3 20h4L17 6a2.12 2.12 0 1 0-3-3L3 17v3Z"></path></svg>
      </div>
    `;
  }).join('');

  $$('#layerPanel .layer-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      store.getState().selectComponent(id);
      updateUI();
    });
  });
}

// Side panels: Database, APIs, Pages, Plugins
function setupDatabaseAndApis() {
  // Render flat lists of structural elements
  const renderPagesList = () => {
    const list = $('#pagesList');
    if (!list) return;
    const { pages, currentPageId } = store.getState();
    list.innerHTML = pages.map(p => `
      <div class="layer-item ${currentPageId === p.id ? 'active' : ''}" data-page="${p.id}">
        <span>📄 ${p.name} <span style="font-size:9px;color:var(--text-muted);">${p.path}</span></span>
      </div>
    `).join('');
    
    $$('#pagesList .layer-item').forEach(el => {
      el.addEventListener('click', () => {
        const pid = el.dataset.page;
        store.getState().switchPage(pid);
        updateUI();
        window.logToConsole(`Switched page view to: ${pid}`);
      });
    });
  };

  $('#addPageBtn')?.addEventListener('click', () => {
    const name = prompt('Enter page name:', 'New Page');
    if (name) {
      const path = '/' + name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      store.getState().addPage({ name, path });
      renderPagesList();
      window.logToConsole(`Created new page: ${name}`);
    }
  });

  const apis = ['GET /api/v1/users', 'POST /api/v1/authenticate', 'GET /api/v1/products'];
  const tables = ['Users (id, username, password_hash)', 'Products (id, name, price, stock)', 'Orders (id, user_id, total, status)'];
  const plugins = [
    { name: 'Clerk Auth Wrapper', desc: 'Secure customer authentication module.' },
    { name: 'Stripe Payments', desc: 'Accept visual transactions instantly.' },
    { name: 'Algolia Global Search', desc: 'Optimized search indexing panel.' }
  ];

  const listApis = $('#apisList');
  if (listApis) {
    listApis.innerHTML = apis.map(a => `
      <div class="layer-item">
        <span>⚡ ${a}</span>
      </div>
    `).join('');
  }

  $('#addApiBtn')?.addEventListener('click', () => {
    const route = prompt('Enter API Route (e.g. GET /api/items):');
    if (route) {
      apis.push(route);
      listApis.innerHTML += `<div class="layer-item"><span>⚡ ${route}</span></div>`;
      window.logToConsole(`Added API endpoint: ${route}`);
    }
  });

  const listTables = $('#tablesList');
  if (listTables) {
    listTables.innerHTML = tables.map(t => `
      <div class="layer-item">
        <span>🗄️ ${t}</span>
      </div>
    `).join('');
  }

  $('#addTableBtn')?.addEventListener('click', () => {
    const tableSchema = prompt('Enter Table schema (e.g. Users (id, name)):');
    if (tableSchema) {
      tables.push(tableSchema);
      listTables.innerHTML += `<div class="layer-item"><span>🗄️ ${tableSchema}</span></div>`;
      window.logToConsole(`Added Database Table: ${tableSchema}`);
    }
  });

  const listPlugins = $('#pluginsList');
  if (listPlugins) {
    listPlugins.innerHTML = plugins.map(p => `
      <div class="layer-item" style="flex-direction:column; align-items:flex-start; gap:4px; padding:10px;">
        <span style="font-weight:600; color:var(--primary);">${p.name}</span>
        <span style="font-size:10px; color:var(--text-muted);">${p.desc}</span>
      </div>
    `).join('');
  }

  renderPagesList();
}

// Toolbar triggers & responsive size simulation
function setupToolbar() {
  $('#undoBtn')?.addEventListener('click', () => {
    store.getState().undo();
    updateUI();
    window.logToConsole('Undo operation performed.');
  });

  $('#redoBtn')?.addEventListener('click', () => {
    store.getState().redo();
    updateUI();
    window.logToConsole('Redo operation performed.');
  });

  $('#saveBtn')?.addEventListener('click', saveProject);
  $('#deployBtn')?.addEventListener('click', deployProject);
  $('#previewBtn')?.addEventListener('click', showPreview);

  // Device modes toggle
  const deviceButtons = $$('.device-toggles .device-btn');
  deviceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      deviceButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const dev = btn.dataset.device;
      
      const container = $('#canvasContainer');
      if (container) {
        container.className = `canvas-container ${dev}`;
        window.logToConsole(`Viewport size simulated: ${dev}`);
      }
    });
  });

  // Console toggle
  $('#consoleToggleBtn')?.addEventListener('click', () => {
    const panel = $('#consolePanel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
      window.logToConsole('Console display state toggled.');
    }
  });

  // Clear console
  $('#clearConsoleBtn')?.addEventListener('click', () => {
    const pre = $('#consoleContent');
    if (pre) pre.textContent = '';
  });
}

// Project Actions
async function saveProject() {
  window.logToConsole('Saving visual state components...');
  if (!window.api) {
    alert('Electron preload bridge window.api not initialized.');
    return;
  }
  try {
    const state = store.getState();
    const data = {
      components: state.components,
      pages: state.pages,
      apiEndpoints: [],
      dataModels: []
    };
    await window.api.saveProject({ projectPath: window.currentProjectPath, project: data });
    window.logToConsole('Project successfully committed to storage.');
    alert('Project saved successfully!');
  } catch (err) {
    window.logToConsole(`Error saving: ${err.message}`);
  }
}

async function deployProject() {
  window.logToConsole('Preparing Vercel bundle deployment...');
  if (!window.api) {
    alert('Electron preload bridge window.api not initialized.');
    return;
  }
  try {
    const result = await window.api.deployToVercel(window.currentProjectPath);
    if (result && result.success) {
      window.logToConsole(`Successfully deployed to URL: ${result.url}`);
      alert(`Deployment Successful!\nURL: ${result.url}`);
    } else {
      window.logToConsole(`Deploy failed: ${result?.error || 'Unknown Error'}`);
      alert(`Deployment Failed: ${result?.error || 'Unknown Error'}`);
    }
  } catch (err) {
    window.logToConsole(`Deploy exception: ${err.message}`);
  }
}

async function showPreview() {
  window.logToConsole('Rendering Preview frame viewport...');
  if (!window.api) {
    alert('Electron preload bridge window.api not initialized.');
    return;
  }
  try {
    const data = await window.api.loadProject(window.currentProjectPath);
    const modal = $('#previewModal');
    const frame = $('#previewFrame');
    const qrDiv = $('#qrCode');
    const previewUrlSpan = $('#previewUrl');
    
    if (previewUrlSpan) previewUrlSpan.textContent = data.preview?.url || 'http://localhost:3000';
    if (frame) frame.src = data.preview?.url || 'about:blank';
    if (qrDiv && data.qrCode) {
      qrDiv.innerHTML = `<img src="${data.qrCode}" style="width:120px;height:120px;" />`;
    }
    
    if (modal) modal.style.display = 'flex';
    
    const closeBtn = $('.close-modal');
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.style.display = 'none';
        if (frame) frame.src = 'about:blank';
      };
    }
    
    // Modal device sizes preview
    const modalDevs = $$('[data-preview-device]');
    modalDevs.forEach(btn => {
      btn.onclick = () => {
        modalDevs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const dev = btn.dataset.previewDevice;
        const frameContainer = $('#previewFrameContainer');
        if (frameContainer) {
          frameContainer.className = `preview-frame-container ${dev}`;
        }
      };
    });
  } catch (err) {
    window.logToConsole(`Preview generation error: ${err.message}`);
  }
}

// System Keyboard Shortcuts
function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    // Ctrl + Z (Undo)
    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      store.getState().undo();
      updateUI();
      window.logToConsole('Shortcut: Undo');
    }
    // Ctrl + Y (Redo)
    if (e.ctrlKey && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      store.getState().redo();
      updateUI();
      window.logToConsole('Shortcut: Redo');
    }
    // Delete key (Remove selected component)
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const activeElement = document.activeElement;
      if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        return; // Ignore if focused inside input
      }
      const selId = store.getState().selectedComponentId;
      if (selId) {
        e.preventDefault();
        store.getState().deleteComponent(selId);
        updateUI();
        window.logToConsole(`Shortcut: Deleted Selected Component #${selId}`);
      }
    }
  });
}

// Comprehensive UI rendering cycle
function updateUI() {
  renderCanvas();
  renderLayers();
  
  const selComp = store.getState().components.find(c => c.id === store.getState().selectedComponentId);
  renderPropertyPanel(selComp);
}

// Launch application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  init();
});
