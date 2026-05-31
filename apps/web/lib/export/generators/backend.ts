import { FileTree } from './file-tree';

export interface BackendOptions {
  database: 'postgresql';
  orm: 'prisma';
  auth: 'jwt';
}

export interface ModuleInfo {
  name: string;
  slug: string;
}

export class ExpressPrismaGenerator {
  async generate(siteName: string, modules: ModuleInfo[]): Promise<FileTree> {
    const files = new FileTree();

    files.add('package.json', this.packageJson());
    files.add('tsconfig.json', this.tsConfig());
    files.add('.env.example', this.envExample());
    files.add('.env', this.envDefault());
    files.add('prisma/schema.prisma', this.prismaSchema(modules));
    files.add('prisma/seed.ts', this.seed());
    files.add('src/index.ts', this.entryPoint());
    files.add('src/middleware/auth.ts', this.authMiddleware());
    files.add('src/middleware/error.ts', this.errorMiddleware());
    files.add('src/routes/auth.ts', this.authRoutes());
    files.add('src/routes/health.ts', this.healthRoute());

    if (this.hasModule(modules, 'forms', 'Form Builder')) {
      files.add('src/routes/forms.ts', this.formRoutes());
    }

    files.add('src/lib/prisma.ts', this.prismaClient());
    files.add('src/lib/logger.ts', this.logger());
    files.add('Dockerfile', this.dockerfile());
    files.add('README.md', this.readme(siteName));

    return files;
  }

  private packageJson(): string {
    return JSON.stringify(
      {
        name: 'backend',
        private: true,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'tsx watch src/index.ts',
          build: 'tsc',
          start: 'node dist/index.js',
          'db:generate': 'prisma generate',
          'db:push': 'prisma db push',
          'db:migrate': 'prisma migrate dev',
          'db:seed': 'tsx prisma/seed.ts',
          'db:studio': 'prisma studio',
        },
        dependencies: {
          express: '^5.0.0',
          '@prisma/client': '^6.0.0',
          cors: '^2.8.5',
          helmet: '^8.0.0',
          jsonwebtoken: '^9.0.0',
          bcryptjs: '^2.4.3',
          zod: '^3.24.0',
        },
        devDependencies: {
          typescript: '^5.6.0',
          '@types/express': '^5.0.0',
          '@types/cors': '^2.8.17',
          '@types/jsonwebtoken': '^9.0.0',
          '@types/bcryptjs': '^2.4.6',
          '@types/node': '^22.0.0',
          prisma: '^6.0.0',
          tsx: '^4.19.0',
        },
      },
      null,
      2
    );
  }

  private tsConfig(): string {
    return JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'bundler',
          outDir: './dist',
          rootDir: './src',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true,
          declaration: true,
          sourceMap: true,
        },
        include: ['src'],
        exclude: ['node_modules', 'dist'],
      },
      null,
      2
    );
  }

  private envExample(): string {
    return `# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database (PostgreSQL)
DATABASE_URL=postgresql://app:password@localhost:5432/app

# Auth
JWT_SECRET=change-this-to-a-random-secret

# Email (optional)
EMAIL_ENABLED=false
EMAIL_FROM=noreply@example.com
`;
  }

  private envDefault(): string {
    return `PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://app:password@localhost:5432/app
JWT_SECRET=dev-secret-change-in-production
EMAIL_ENABLED=false
`;
  }

  private prismaSchema(modules: ModuleInfo[]): string {
    let schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  image     String?
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  formSubmissions FormSubmission[]
}
`;

    if (this.hasModule(modules, 'forms', 'Form Builder')) {
      schema += `
model FormSubmission {
  id        String   @id @default(cuid())
  formId    String
  data      Json
  page      String?
  createdAt DateTime @default(now())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("form_submissions")
}
`;
    }

    return schema;
  }

  private seed(): string {
    return `import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  console.log('Seeded admin user:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
`;
  }

  private entryPoint(): string {
    return `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import { authRouter } from './routes/auth.js';
import { healthRouter } from './routes/health.js';
import { errorHandler } from './middleware/error.js';

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

async function lazyLoadRoutes() {
  try {
    const { formRouter } = await import('./routes/forms.js');
    app.use('/api/forms', formRouter);
  } catch {}
}
lazyLoadRoutes();

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
`;
  }

  private prismaClient(): string {
    return `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
`;
  }

  private authRoutes(): string {
    return `import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed, name } });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) { next(err); }
});

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
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

authRouter.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.id },
      select: { id: true, email: true, name: true, image: true, role: true },
    });
    res.json(user);
  } catch (err) { next(err); }
});

function authenticate(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return _res.status(401).json({ error: 'Authentication required' });
  }
  try {
    (req as any).user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    _res.status(401).json({ error: 'Invalid or expired token' });
  }
}
`;
  }

  private formRoutes(): string {
    return `import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index.js';

export const formRouter = Router();

formRouter.post('/:formId/submit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submission = await prisma.formSubmission.create({
      data: {
        formId: req.params.formId,
        data: req.body,
        page: (req.query.page as string) || null,
      },
    });
    res.status(201).json(submission);
  } catch (err) { next(err); }
});

formRouter.get('/:formId/submissions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submissions = await prisma.formSubmission.findMany({
      where: { formId: req.params.formId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });
    res.json(submissions);
  } catch (err) { next(err); }
});
`;
  }

  private healthRoute(): string {
    return `import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
`;
  }

  private authMiddleware(): string {
    return `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET) as { id: string; email: string };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
`;
  }

  private errorMiddleware(): string {
    return `import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('[Error]', err.message);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Resource already exists' });
    if (err.code === 'P2025') return res.status(404).json({ error: 'Resource not found' });
    return res.status(400).json({ error: 'Database error' });
  }

  res.status(500).json({ error: err.message || 'Internal server error' });
}
`;
  }

  private logger(): string {
    return `type Level = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel: Level = (process.env.LOG_LEVEL as Level) || 'info';

function log(level: Level, message: string, meta?: unknown) {
  if (LOG_LEVELS[level] < LOG_LEVELS[currentLevel]) return;
  const entry = { timestamp: new Date().toISOString(), level, message, meta };
  console[level === 'error' ? 'error' : 'log'](JSON.stringify(entry));
}

export const logger = {
  debug: (msg: string, meta?: unknown) => log('debug', msg, meta),
  info: (msg: string, meta?: unknown) => log('info', msg, meta),
  warn: (msg: string, meta?: unknown) => log('warn', msg, meta),
  error: (msg: string, meta?: unknown) => log('error', msg, meta),
};
`;
  }

  private dockerfile(): string {
    return `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
EXPOSE 3001
CMD ["node", "dist/index.js"]
`;
  }

  private githubActions(): string {
    return `name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: app
          POSTGRES_PASSWORD: \${{ secrets.DB_PASSWORD }}
          POSTGRES_DB: app
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx prisma generate
      - run: npx prisma migrate deploy
      - run: npm run build
      - run: echo "Deploy your app here"
`;
  }

  private readme(siteName: string): string {
    return `# ${siteName} - Backend API

Express + Prisma + PostgreSQL backend generated by SUKIT.

## Prerequisites

- Node.js 20+
- PostgreSQL 15+

## Getting Started

\`\`\`bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
\`\`\`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| POST | /api/forms/:id/submit | Submit form |
| GET | /api/forms/:id/submissions | Form submissions |

## Database

\`\`\`bash
npx prisma studio   # GUI database browser
npx prisma db push  # Sync schema
\`\`\`
`;
  }

  private hasModule(modules: ModuleInfo[], ...names: string[]): boolean {
    return modules.some(
      (m) => names.includes(m.name) || names.includes(m.slug)
    );
  }
}
