const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'sukit-dev-secret-key-change-in-production';
const PORT = process.env.PORT || 3001;
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: 'Too many requests' } });
app.use('/api/', limiter);

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed, name } });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const resetTokens = new Map();

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    const token = crypto.randomBytes(32).toString('hex');
    resetTokens.set(token, { email, expires: Date.now() + 3600000 });
    console.log(`\n[SuKit Dev] Password reset link: http://localhost:5173/#/reset-password?token=${token}\n`);
    if (user) {
      console.log(`[SuKit Dev] Reset requested for: ${email}`);
    }
    res.json({ message: 'If an account exists, a reset link has been sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const stored = resetTokens.get(token);
    if (!stored) return res.status(400).json({ error: 'Invalid or expired reset token' });
    if (Date.now() > stored.expires) {
      resetTokens.delete(token);
      return res.status(400).json({ error: 'Reset token has expired' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email: stored.email }, data: { password: hashed } });
    resetTokens.delete(token);
    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', (req, res) => res.json({ message: 'Logged out' }));

app.get('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, email: true, name: true, createdAt: true } });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Project Routes
app.get('/api/projects', authenticate, async (req, res) => {
  const projects = await prisma.project.findMany({ where: { userId: req.user.id }, orderBy: { updatedAt: 'desc' } });
  res.json(projects);
});

app.get('/api/projects/:id', authenticate, async (req, res) => {
  const project = await prisma.project.findFirst({ where: { id: parseInt(req.params.id), userId: req.user.id } });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

app.post('/api/projects', authenticate, async (req, res) => {
  const project = await prisma.project.create({ data: { ...req.body, userId: req.user.id } });
  res.json(project);
});

app.put('/api/projects/:id', authenticate, async (req, res) => {
  const project = await prisma.project.updateMany({ where: { id: parseInt(req.params.id), userId: req.user.id }, data: req.body });
  res.json(project);
});

app.delete('/api/projects/:id', authenticate, async (req, res) => {
  await prisma.project.deleteMany({ where: { id: parseInt(req.params.id), userId: req.user.id } });
  res.status(204).send();
});

// File Upload
app.post('/api/upload', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  res.json({ id: Date.now(), filename: req.file.filename, originalName: req.file.originalname, size: req.file.size, path: `/uploads/${req.file.filename}` });
});

app.delete('/api/files/:id', authenticate, (req, res) => {
  res.status(204).send();
});

// Plugin Routes
app.get('/api/plugins', async (req, res) => {
  const plugins = await prisma.plugin.findMany({ orderBy: { downloads: 'desc' } });
  res.json(plugins);
});

app.post('/api/plugins/:id/install', authenticate, async (req, res) => {
  const plugin = await prisma.plugin.update({ where: { id: parseInt(req.params.id) }, data: { installs: { increment: 1 } } });
  res.json(plugin);
});

app.post('/api/plugins/:id/uninstall', authenticate, async (req, res) => {
  res.json({ message: 'Plugin uninstalled' });
});

// Discover available preview components for a plugin from the filesystem
app.get('/api/plugins/:name/components', (req, res) => {
  const pluginsDir = path.resolve(__dirname, '..', '..', '..', 'plugins');
  const srcDir = path.resolve(pluginsDir, req.params.name, 'frontend', 'src');
  if (!srcDir.startsWith(pluginsDir)) return res.status(403).json({ error: 'Invalid path' });
  if (!fs.existsSync(srcDir)) return res.json([]);
  const files = fs.readdirSync(srcDir);
  const components = files.filter(f => f.endsWith('.jsx')).map(f => f.replace('.jsx', '')).sort();
  res.json(components);
});

// Serve raw plugin component source files for preview
app.get('/api/plugins/:name/component/:component', (req, res) => {
  const pluginsDir = path.resolve(__dirname, '..', '..', '..', 'plugins');
  const filePath = path.resolve(pluginsDir, req.params.name, 'frontend', 'src', `${req.params.component}.jsx`);
  if (!filePath.startsWith(pluginsDir)) return res.status(403).json({ error: 'Invalid path' });
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Component not found' });
  res.type('text/plain').send(fs.readFileSync(filePath, 'utf-8'));
});

// Template Routes
app.get('/api/templates', async (req, res) => {
  const where = req.query.category ? { category: req.query.category } : {};
  const templates = await prisma.template.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(templates);
});

app.post('/api/templates', authenticate, async (req, res) => {
  const template = await prisma.template.create({ data: { ...req.body, userId: req.user.id } });
  res.json(template);
});

app.delete('/api/templates/:id', authenticate, async (req, res) => {
  await prisma.template.deleteMany({ where: { id: parseInt(req.params.id), userId: req.user.id } });
  res.status(204).send();
});

// Form Routes
app.post('/api/forms/:id/submit', async (req, res) => {
  const submission = await prisma.formSubmission.create({ data: { formId: parseInt(req.params.id), data: req.body } });
  res.json(submission);
});

app.get('/api/forms/:id/submissions', authenticate, async (req, res) => {
  const submissions = await prisma.formSubmission.findMany({ where: { formId: parseInt(req.params.id) }, orderBy: { createdAt: 'desc' } });
  res.json(submissions);
});

// Deployment Routes
app.post('/api/deploy/:projectId', authenticate, async (req, res) => {
  const deployment = { id: Date.now(), projectId: parseInt(req.params.projectId), provider: req.body.provider, status: 'deploying', timestamp: new Date().toISOString() };
  setTimeout(async () => {
    await prisma.deployment.create({ data: { ...deployment, status: 'live', userId: req.user.id } });
  }, 3000);
  res.json(deployment);
});

app.get('/api/deploy/:projectId', authenticate, async (req, res) => {
  const deployments = await prisma.deployment.findMany({ where: { projectId: parseInt(req.params.projectId) }, orderBy: { timestamp: 'desc' } });
  res.json(deployments);
});

app.get('/api/deploy/status/:id', authenticate, async (req, res) => {
  res.json({ id: parseInt(req.params.id), status: 'live' });
});

// WebSocket
const clients = new Map();
wss.on('connection', (ws, req) => {
  const params = new URLSearchParams(req.url.split('?')[1]);
  const projectId = params.get('projectId');
  const userId = params.get('userId') || 'anonymous';

  if (!clients.has(projectId)) clients.set(projectId, new Map());
  clients.get(projectId).set(userId, ws);

  // Notify others
  broadcast(projectId, { type: 'user-joined', userId, timestamp: Date.now() }, userId);

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw);
      broadcast(projectId, { ...data, userId, timestamp: Date.now() }, userId);
    } catch (e) {
      console.error('WS message error:', e);
    }
  });

  ws.on('close', () => {
    if (clients.has(projectId)) {
      clients.get(projectId).delete(userId);
      if (clients.get(projectId).size === 0) clients.delete(projectId);
    }
    broadcast(projectId, { type: 'user-left', userId, timestamp: Date.now() });
  });
});

function broadcast(projectId, message, excludeUserId = null) {
  const projectClients = clients.get(projectId);
  if (!projectClients) return;
  projectClients.forEach((client, userId) => {
    if (userId !== excludeUserId && client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
}

async function seedDefaultUser() {
  try {
    const existing = await prisma.user.findUnique({ where: { email: 'admin@sukit.dev' } });
    if (!existing) {
      const hashed = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: { email: 'admin@sukit.dev', password: hashed, name: 'Admin', role: 'ADMIN' },
      });
      console.log('\n  Default user created: admin@sukit.dev / admin123\n');
    }
  } catch (e) {
    console.log('Seed check skipped (database may not exist yet)');
  }
}

server.listen(PORT, async () => {
  console.log(`SuKit API server running on port ${PORT}`);
  await seedDefaultUser();
});
