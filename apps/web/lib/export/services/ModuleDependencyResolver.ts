export interface DependencyGraph {
  nodes: string[];
  edges: Array<{ from: string; to: string }>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const MODULE_DEPENDENCIES: Record<string, string[]> = {
  'visual-builder': [],
  'site-manager': [],
  'media-library': ['site-manager'],
  'form-builder': ['visual-builder'],
  'seo-module': ['site-manager'],
  analytics: ['site-manager'],
  'code-editor': ['visual-builder'],
  chat: ['visual-builder'],
  'popup-builder': ['visual-builder'],
  commerce: ['visual-builder', 'auth'],
  blog: ['visual-builder', 'auth'],
  auth: ['site-manager'],
  backup: ['site-manager'],
  translation: ['site-manager'],
  membership: ['commerce', 'auth'],
  booking: ['visual-builder'],
  newsletter: ['form-builder'],
  webhook: ['site-manager'],
};

export class ModuleDependencyResolver {
  resolveDependencies(modules: string[]): string[] {
    const resolved = new Set<string>();
    const visit = (mod: string, stack: Set<string>) => {
      if (resolved.has(mod)) return;
      if (stack.has(mod))
        throw new Error(
          `Circular dependency detected: ${Array.from(stack).join(' -> ')} -> ${mod}`
        );
      stack.add(mod);
      const deps = MODULE_DEPENDENCIES[mod] || [];
      for (const dep of deps) {
        visit(dep, stack);
      }
      stack.delete(mod);
      resolved.add(mod);
    };

    for (const mod of modules) {
      visit(mod, new Set());
    }

    return Array.from(resolved);
  }

  validateDependencies(modules: string[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const moduleSet = new Set(modules);

    for (const mod of modules) {
      const deps = MODULE_DEPENDENCIES[mod] || [];
      for (const dep of deps) {
        if (!moduleSet.has(dep)) {
          errors.push(
            `Module "${mod}" requires "${dep}" which is not included`
          );
        }
      }
    }

    if (!moduleSet.has('site-manager')) {
      warnings.push('Site Manager is recommended for most modules');
    }

    try {
      this.resolveDependencies(modules);
    } catch (e) {
      errors.push((e as Error).message);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  getDependencyGraph(): DependencyGraph {
    const nodes = Object.keys(MODULE_DEPENDENCIES);
    const edges: Array<{ from: string; to: string }> = [];
    for (const [mod, deps] of Object.entries(MODULE_DEPENDENCIES)) {
      for (const dep of deps) {
        edges.push({ from: mod, to: dep });
      }
    }
    return { nodes, edges };
  }
}

export const dependencyResolver = new ModuleDependencyResolver();
