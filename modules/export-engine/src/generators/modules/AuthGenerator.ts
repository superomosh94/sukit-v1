import type {
  ModuleGenerator,
  ModuleGeneratorContext,
} from './ModuleGenerator.js';

export class AuthGenerator implements ModuleGenerator {
  readonly moduleId = 'auth';
  readonly moduleName = 'Authentication';
  constructor(private ctx: ModuleGeneratorContext) {}

  generateBackendRoutes(): string {
    return `export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email in use' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed, name } });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) { next(err); }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) { next(err); }
});

authRouter.post('/social', async (req, res, next) => {
  try {
    const { provider, accessToken } = req.body;
    const profile = await fetch(\`https://\${provider}.com/userinfo\`, { headers: { Authorization: \`Bearer \${accessToken}\` } }).then(r => r.json());
    let user = await prisma.user.findUnique({ where: { email: profile.email } });
    if (!user) user = await prisma.user.create({ data: { email: profile.email, name: profile.name, image: profile.picture, password: '' } });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) { next(err); }
});

authRouter.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const token = crypto.randomUUID();
    // Store token and send email
    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (err) { next(err); }
});

authRouter.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;
    // Validate token and update password
    res.json({ message: 'Password updated' });
  } catch (err) { next(err); }
});

authRouter.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, email: true, name: true, image: true, role: true } });
    res.json(user);
  } catch (err) { next(err); }
});`;
  }

  generatePrismaModels(): string {
    return '';
  }

  generateFrontendComponents(): Array<{ path: string; content: string }> {
    return [
      {
        path: 'AuthProvider.tsx',
        content: `import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';

interface User { id: string; email: string; name?: string; image?: string; role?: string; }
interface AuthContext { user: User | null; login: (email: string, password: string) => Promise<void>; register: (email: string, password: string, name: string) => Promise<void>; logout: () => void; loading: boolean; }

const AuthCtx = createContext<AuthContext>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token) api.get<User>('/auth/me').then(setUser).catch(() => localStorage.removeItem('auth-token')).finally(() => setLoading(false));
    else setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    localStorage.setItem('auth-token', res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/register', { email, password, name });
    localStorage.setItem('auth-token', res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => { localStorage.removeItem('auth-token'); setUser(null); }, []);

  return <AuthCtx.Provider value={{ user, login, register, logout, loading }}>{children}</AuthCtx.Provider>;
};

export const useAuth = () => useContext(AuthCtx);`,
      },
    ];
  }
}
