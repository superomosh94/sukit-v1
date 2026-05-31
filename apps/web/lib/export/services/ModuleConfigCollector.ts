import { prisma } from '@/lib/db/prisma';

export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  moduleId: string;
  auth: boolean;
  description: string;
}

export interface ModelDefinition {
  name: string;
  moduleId: string;
  prisma: string;
  relations: string[];
}

export interface HookDefinition {
  name: string;
  moduleId: string;
  trigger: string;
  handler: string;
}

export interface ModuleConfigMap {
  [moduleId: string]: Record<string, unknown>;
}

const MODULE_ROUTES: Record<string, RouteDefinition[]> = {
  auth: [
    {
      method: 'POST',
      path: '/api/auth/register',
      moduleId: 'auth',
      auth: false,
      description: 'Register',
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      moduleId: 'auth',
      auth: false,
      description: 'Login',
    },
    {
      method: 'GET',
      path: '/api/auth/me',
      moduleId: 'auth',
      auth: true,
      description: 'Current user',
    },
  ],
  'form-builder': [
    {
      method: 'POST',
      path: '/api/forms/:formId/submit',
      moduleId: 'form-builder',
      auth: false,
      description: 'Submit form',
    },
    {
      method: 'GET',
      path: '/api/forms/:formId/submissions',
      moduleId: 'form-builder',
      auth: true,
      description: 'List submissions',
    },
  ],
  blog: [
    {
      method: 'GET',
      path: '/api/blog/posts',
      moduleId: 'blog',
      auth: false,
      description: 'List posts',
    },
    {
      method: 'GET',
      path: '/api/blog/posts/:slug',
      moduleId: 'blog',
      auth: false,
      description: 'Get post',
    },
    {
      method: 'POST',
      path: '/api/blog/posts',
      moduleId: 'blog',
      auth: true,
      description: 'Create post',
    },
    {
      method: 'GET',
      path: '/api/blog/categories',
      moduleId: 'blog',
      auth: false,
      description: 'List categories',
    },
  ],
  commerce: [
    {
      method: 'GET',
      path: '/api/commerce/products',
      moduleId: 'commerce',
      auth: false,
      description: 'List products',
    },
    {
      method: 'GET',
      path: '/api/commerce/products/:id',
      moduleId: 'commerce',
      auth: false,
      description: 'Get product',
    },
    {
      method: 'POST',
      path: '/api/commerce/cart',
      moduleId: 'commerce',
      auth: false,
      description: 'Manage cart',
    },
    {
      method: 'POST',
      path: '/api/commerce/checkout',
      moduleId: 'commerce',
      auth: false,
      description: 'Checkout',
    },
    {
      method: 'GET',
      path: '/api/commerce/orders',
      moduleId: 'commerce',
      auth: true,
      description: 'List orders',
    },
  ],
  analytics: [
    {
      method: 'POST',
      path: '/api/analytics/track',
      moduleId: 'analytics',
      auth: false,
      description: 'Track event',
    },
    {
      method: 'GET',
      path: '/api/analytics/stats',
      moduleId: 'analytics',
      auth: true,
      description: 'Get stats',
    },
  ],
  'seo-module': [
    {
      method: 'GET',
      path: '/api/seo/score',
      moduleId: 'seo-module',
      auth: true,
      description: 'SEO score',
    },
    {
      method: 'POST',
      path: '/api/seo/analyze',
      moduleId: 'seo-module',
      auth: true,
      description: 'Analyze page',
    },
  ],
  chat: [
    {
      method: 'POST',
      path: '/api/chat/message',
      moduleId: 'chat',
      auth: false,
      description: 'Send message',
    },
    {
      method: 'GET',
      path: '/api/chat/conversations',
      moduleId: 'chat',
      auth: true,
      description: 'List conversations',
    },
  ],
  'popup-builder': [
    {
      method: 'GET',
      path: '/api/popups',
      moduleId: 'popup-builder',
      auth: false,
      description: 'List popups',
    },
    {
      method: 'POST',
      path: '/api/popups/track',
      moduleId: 'popup-builder',
      auth: false,
      description: 'Track view/click',
    },
  ],
};

const MODULE_MODELS: Record<string, ModelDefinition[]> = {
  auth: [
    {
      name: 'User',
      moduleId: 'auth',
      prisma: `model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  image     String?
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`,
      relations: [],
    },
  ],
  'form-builder': [
    {
      name: 'FormSubmission',
      moduleId: 'form-builder',
      prisma: `model FormSubmission {
  id        String   @id @default(cuid())
  formId    String
  data      Json
  page      String?
  createdAt DateTime @default(now())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("form_submissions")
}`,
      relations: ['User'],
    },
  ],
  blog: [
    {
      name: 'BlogPost',
      moduleId: 'blog',
      prisma: `model BlogPost {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  content     String
  excerpt     String?
  image       String?
  published   Boolean   @default(false)
  featured    Boolean   @default(false)
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  authorId    String?
  author      User?     @relation(fields: [authorId], references: [id], onDelete: SetNull)
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
}`,
      relations: ['User', 'Category'],
    },
    {
      name: 'Category',
      moduleId: 'blog',
      prisma: `model Category {
  id        String     @id @default(cuid())
  name      String
  slug      String     @unique
  createdAt DateTime   @default(now())
  posts     BlogPost[]
}`,
      relations: ['BlogPost'],
    },
  ],
  commerce: [
    {
      name: 'Product',
      moduleId: 'commerce',
      prisma: `model Product {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Float
  compareAt   Float?
  image       String?
  images      Json     @default("[]")
  inventory   Int      @default(0)
  sku         String?
  published   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}`,
      relations: [],
    },
    {
      name: 'Order',
      moduleId: 'commerce',
      prisma: `model Order {
  id         String   @id @default(cuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  email      String?
  items      Json
  total      Float
  status     String   @default("pending")
  createdAt  DateTime @default(now())
}`,
      relations: ['User'],
    },
    {
      name: 'CartItem',
      moduleId: 'commerce',
      prisma: `model CartItem {
  id        String   @id @default(cuid())
  sessionId String
  productId String
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
}`,
      relations: [],
    },
  ],
  analytics: [
    {
      name: 'AnalyticsEvent',
      moduleId: 'analytics',
      prisma: `model AnalyticsEvent {
  id        String   @id @default(cuid())
  siteId    String
  event     String
  data      Json?
  page      String?
  session   String?
  timestamp DateTime @default(now())
}`,
      relations: [],
    },
  ],
  'popup-builder': [
    {
      name: 'Popup',
      moduleId: 'popup-builder',
      prisma: `model Popup {
  id         String   @id @default(cuid())
  name       String
  content    Json
  triggers   Json
  targeting  Json?
  views      Int      @default(0)
  clicks     Int      @default(0)
  published  Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}`,
      relations: [],
    },
  ],
  chat: [
    {
      name: 'ChatConversation',
      moduleId: 'chat',
      prisma: `model ChatConversation {
  id        String   @id @default(cuid())
  sessionId String
  messages  Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`,
      relations: [],
    },
  ],
};

export class ModuleConfigCollector {
  async collectModuleConfigs(
    siteId: string,
    modules: string[]
  ): Promise<ModuleConfigMap> {
    const dbModules = await prisma.module.findMany({
      where: { siteId, moduleId: { in: modules } },
    });

    const configs: ModuleConfigMap = {};
    for (const mod of modules) {
      const dbMod = dbModules.find((m) => m.moduleId === mod);
      configs[mod] = (dbMod?.settings as Record<string, unknown>) || {};
    }
    return configs;
  }

  collectModuleRoutes(modules: string[]): RouteDefinition[] {
    const routes: RouteDefinition[] = [];
    for (const mod of modules) {
      const modRoutes = MODULE_ROUTES[mod];
      if (modRoutes) routes.push(...modRoutes);
    }
    return routes;
  }

  collectModuleModels(modules: string[]): ModelDefinition[] {
    const models: ModelDefinition[] = [];
    const added = new Set<string>();
    for (const mod of modules) {
      const modModels = MODULE_MODELS[mod];
      if (modModels) {
        for (const model of modModels) {
          if (!added.has(model.name)) {
            models.push(model);
            added.add(model.name);
          }
        }
      }
    }
    return models;
  }

  collectModuleHooks(_modules: string[]): HookDefinition[] {
    return [];
  }
}

export const moduleConfigCollector = new ModuleConfigCollector();
