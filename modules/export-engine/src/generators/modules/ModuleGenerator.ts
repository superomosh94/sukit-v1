import { FileTree } from '../file-tree.js';

export interface ModuleGenerator {
  readonly moduleId: string;
  readonly moduleName: string;

  generateBackendRoutes(): string;
  generateBackendControllers?(): string;
  generatePrismaModels(): string;
  generateFrontendComponents(): Array<{ path: string; content: string }>;
  generateValidationSchemas?(): string;
  generateEmailTemplates?(): string;
}

export interface ModuleGeneratorContext {
  siteName: string;
  modules: string[];
  settings: Record<string, unknown>;
}

export function generateModuleRoutes(generators: ModuleGenerator[]): string {
  const parts = generators.map((g) => g.generateBackendRoutes());
  return `import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

${parts.join('\n\n')}
`;
}

export function generatePrismaSchema(generators: ModuleGenerator[]): string {
  const models = generators
    .map((g) => g.generatePrismaModels())
    .filter(Boolean);
  return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

${models.join('\n\n')}
`;
}

export function generateFrontendFiles(generators: ModuleGenerator[]): FileTree {
  const tree = new FileTree();
  for (const gen of generators) {
    const components = gen.generateFrontendComponents();
    for (const comp of components) {
      tree.add(`src/components/modules/${comp.path}`, comp.content);
    }
  }
  return tree;
}
