// lib/previewServer.js
// Simple Express server to serve a preview of the generated HTML/CSS
const express = require('express');
const path = require('path');
const { generateHTML, generateCSS } = require('./codeGenerator');

/**
 * Starts a preview server on the given port.
 * @param {Array} components - Component tree from editorStore.
 * @param {number} port - Port number (default 3001).
 */
function startPreviewServer(components, port = 3001) {
  const app = express();
app.use(express.static(path.join(__dirname, '..')));
  app.get('/preview', (req, res) => {
    const html = generateHTML(components);
    const css = generateCSS(components);
    const fullHtml = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}</body></html>`;
    res.send(fullHtml);
  });

  const server = app.listen(port, () => {
    console.log(`Preview server running at http://localhost:${port}/preview`);
  });
  return server;
}

module.exports = { startPreviewServer };
