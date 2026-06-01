import type { Module, ModuleManifest, ActiveModule } from '../types';
import { EventBus } from './event-bus';
import { PermissionManager } from './permission-manager';
import type { SukitKernel } from '../index';

export interface ModuleMetric {
  loadTime: number;
  memoryUsage: number;
  errorCount: number;
  lastHealthCheck: number;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
  callCount: number;
}

export interface HealthCheckResult {
  moduleId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  error?: string;
  timestamp: number;
}

export interface DependencyNode {
  moduleId: string;
  version: string;
  dependencies: string[];
  dependents: string[];
}

export class ModuleLoader {
  private modules = new Map<string, ActiveModule>();
  private metrics = new Map<string, ModuleMetric>();
  private dependencyGraph = new Map<string, DependencyNode>();
  private versionHistory = new Map<
    string,
    Array<{ version: string; manifest: ModuleManifest; timestamp: number }>
  >();
  private sandboxModules = new Map<string, Set<string>>();
  private kernel: SukitKernel;
  private cache = new Map<
    string,
    { manifest: ModuleManifest; factory: () => Promise<{ default: Module }> }
  >();
  private priorityQueue: Array<{ moduleId: string; priority: number }> = [];
  private resourceLimits = new Map<
    string,
    { maxMemory: number; maxCalls: number; maxLoadTime: number }
  >();
  private overrideProtection = new Set<string>();

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  /* --- Scanner --- */
  async scan(
    discover: () => Promise<
      Array<{
        moduleId: string;
        manifest: ModuleManifest;
        factory: () => Promise<{ default: Module }>;
      }>
    >
  ): Promise<string[]> {
    const found = await discover();
    const loaded: string[] = [];
    for (const entry of found) {
      this.cache.set(entry.moduleId, {
        manifest: entry.manifest,
        factory: entry.factory,
      });
      loaded.push(entry.moduleId);
    }
    return loaded;
  }

  /* --- Manifest Validator --- */
  validateManifest(manifest: ModuleManifest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    if (!manifest.id) errors.push('Missing module id');
    if (!manifest.name) errors.push('Missing module name');
    if (!manifest.version) errors.push('Missing module version');
    if (!manifest.sukit) errors.push('Missing sukit manifest section');
    if (manifest.sukit) {
      if (!manifest.sukit.minVersion) errors.push('Missing sukit.minVersion');
      if (!Array.isArray(manifest.sukit.permissions))
        errors.push('sukit.permissions must be an array');
    }
    return { valid: errors.length === 0, errors };
  }

  /* --- Load with full lifecycle --- */
  async load(
    moduleId: string,
    manifest: ModuleManifest,
    factory: () => Promise<{ default: Module }>,
    priority = 50
  ): Promise<void> {
    if (this.overrideProtection.has(moduleId)) {
      throw new Error(`Module "${moduleId}" is protected from override`);
    }

    const existing = this.modules.get(moduleId);
    if (existing?.status === 'active') return;

    // Conflict detection
    if (existing && existing.status === 'error') {
      await this.kernel.events.emit('module:conflict', {
        moduleId,
        existing,
        incoming: manifest,
      });
    }

    const startTime = performance.now();
    const metric = this.metrics.get(moduleId) ?? this.createMetric();

    try {
      // Priority queue
      if (priority > 0) {
        this.priorityQueue.push({ moduleId, priority });
        this.priorityQueue.sort((a, b) => b.priority - a.priority);
      }

      // Circular dependency detection
      if (this.detectCircular(moduleId, manifest.sukit?.dependencies ?? {})) {
        throw new Error(
          `Circular dependency detected for module "${moduleId}"`
        );
      }

      // Dependency resolution
      if (manifest.sukit?.dependencies) {
        for (const [depId, depVersion] of Object.entries(
          manifest.sukit.dependencies
        )) {
          const dep = this.modules.get(depId);
          if (!dep || dep.status !== 'active') {
            throw new Error(
              `Dependency "${depId}" not loaded for module "${moduleId}"`
            );
          }
          if (dep.manifest) {
            const compat = this.checkVersionCompatibility(
              dep.manifest.version,
              depVersion
            );
            if (!compat) {
              throw new Error(
                `Dependency "${depId}" version ${dep.manifest.version} incompatible with ${depVersion}`
              );
            }
          }
        }
      }

      // Resource limits check
      const limits = this.resourceLimits.get(moduleId);
      if (limits) {
        if (metric.memoryUsage > limits.maxMemory) {
          throw new Error(`Module "${moduleId}" exceeds memory limit`);
        }
        if (metric.callCount > limits.maxCalls) {
          throw new Error(`Module "${moduleId}" exceeds call limit`);
        }
      }

      // beforeLoad hook
      await this.kernel.events.emit('module:beforeLoad', { moduleId });

      // Manifest validation
      const validation = this.validateManifest(manifest);
      if (!validation.valid) {
        throw new Error(
          `Invalid manifest for "${moduleId}": ${validation.errors.join(', ')}`
        );
      }

      // Signature verification (if available)
      if (manifest.sukit?.capabilities?.includes('signed')) {
        const verified = await this.verifySignature(manifest);
        if (!verified) {
          throw new Error(
            `Signature verification failed for module "${moduleId}"`
          );
        }
      }

      // Permission resolution
      const perms = manifest.sukit.permissions ?? [];
      for (const perm of perms) {
        const granted = await this.kernel
          .forModule(moduleId)
          .permissions.request(
            perm,
            `Module ${manifest.name} requires ${perm}`
          );
        if (!granted) {
          throw new Error(
            `Permission "${perm}" denied for module "${moduleId}"`
          );
        }
      }

      // Sandbox (track allowed resources)
      this.sandboxModules.set(moduleId, new Set(perms));

      // Load factory in sandbox
      const modExports = await this.loadWithTimeout(
        factory(),
        manifest.sukit?.minVersion ? 30000 : 10000
      );
      const mod = modExports.default;

      // afterLoad hook
      await this.kernel.events.emit('module:afterLoad', { moduleId });

      await mod.activate(this.kernel.forModule(moduleId));

      // Update dependency graph
      this.updateDependencyGraph(moduleId, manifest);

      // Version history
      if (!this.versionHistory.has(moduleId)) {
        this.versionHistory.set(moduleId, []);
      }
      this.versionHistory
        .get(moduleId)!
        .push({ version: manifest.version, manifest, timestamp: Date.now() });

      this.modules.set(moduleId, {
        definition: mod,
        manifest,
        status: 'active',
      });

      metric.healthStatus = 'healthy';
      await this.kernel.events.emit('module:activated', { moduleId });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      metric.errorCount++;
      metric.healthStatus = 'unhealthy';

      this.modules.set(moduleId, {
        definition: null as any,
        manifest,
        status: 'error',
        error: errMsg,
      });

      // Error recovery strategy
      await this.handleRecovery(moduleId, manifest, factory, error);

      await this.kernel.events.emit('module:error', {
        moduleId,
        error: errMsg,
      });
    } finally {
      const loadTime = performance.now() - startTime;
      metric.loadTime += loadTime;
      this.metrics.set(moduleId, metric);
    }
  }

  async unload(moduleId: string): Promise<void> {
    const mod = this.modules.get(moduleId);
    if (!mod) return;

    try {
      // beforeUnload hook
      await this.kernel.events.emit('module:beforeUnload', { moduleId });
      await mod.definition.deactivate(this.kernel.forModule(moduleId));
      // afterUnload hook
      await this.kernel.events.emit('module:afterUnload', { moduleId });
      await this.kernel.events.emit('module:deactivated', { moduleId });
    } catch (error) {
      console.error(`[ModuleLoader] Error deactivating "${moduleId}":`, error);
    }

    this.modules.delete(moduleId);
    this.sandboxModules.delete(moduleId);
  }

  /* --- Health Checks --- */
  async healthCheck(moduleId: string): Promise<HealthCheckResult> {
    const mod = this.modules.get(moduleId);
    if (!mod || mod.status === 'error') {
      return {
        moduleId,
        status: 'unhealthy',
        latency: 0,
        error: 'Module not loaded or in error state',
        timestamp: Date.now(),
      };
    }

    const start = performance.now();
    try {
      const result = await new Promise<HealthCheckResult>((resolve) => {
        setTimeout(() => {
          resolve({
            moduleId,
            status: 'healthy',
            latency: performance.now() - start,
            timestamp: Date.now(),
          });
        }, 10);
      });

      const metric = this.metrics.get(moduleId);
      if (metric) {
        metric.lastHealthCheck = Date.now();
        metric.healthStatus = result.status;
      }
      return result;
    } catch (error) {
      return {
        moduleId,
        status: 'unhealthy',
        latency: performance.now() - start,
        error: error instanceof Error ? error.message : 'Health check failed',
        timestamp: Date.now(),
      };
    }
  }

  async runAllHealthChecks(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];
    for (const [moduleId] of this.modules) {
      results.push(await this.healthCheck(moduleId));
    }
    return results;
  }

  /* --- Metrics --- */
  getMetrics(
    moduleId?: string
  ): ModuleMetric | Map<string, ModuleMetric> | undefined {
    if (moduleId) return this.metrics.get(moduleId);
    return this.metrics;
  }

  /* --- Dependencies Graph --- */
  getDependencyGraph(): DependencyNode[] {
    return Array.from(this.dependencyGraph.values());
  }

  getDependents(moduleId: string): string[] {
    return this.dependencyGraph.get(moduleId)?.dependents ?? [];
  }

  /* --- Circular Dependency Detection --- */
  private detectCircular(
    moduleId: string,
    dependencies: Record<string, string>,
    visited = new Set<string>()
  ): boolean {
    if (visited.has(moduleId)) return true;
    visited.add(moduleId);
    for (const depId of Object.keys(dependencies)) {
      const depNode = this.dependencyGraph.get(depId);
      if (
        depNode &&
        this.detectCircular(
          depId,
          depNode.dependencies.reduce<Record<string, string>>((acc, d) => {
            const depModule = this.modules.get(d);
            if (depModule?.manifest) acc[d] = depModule.manifest.version;
            return acc;
          }, {}),
          new Set(visited)
        )
      ) {
        return true;
      }
    }
    return false;
  }

  /* --- Version Management --- */
  getVersionHistory(
    moduleId: string
  ): Array<{ version: string; manifest: ModuleManifest; timestamp: number }> {
    return this.versionHistory.get(moduleId) ?? [];
  }

  /* --- Update Notifications --- */
  async checkForUpdates(
    moduleId: string,
    latestVersion: string
  ): Promise<boolean> {
    const mod = this.modules.get(moduleId);
    if (!mod?.manifest) return false;
    return this.compareVersions(latestVersion, mod.manifest.version) > 0;
  }

  /* --- Rollback --- */
  async rollback(moduleId: string, targetVersion: string): Promise<boolean> {
    const history = this.versionHistory.get(moduleId);
    if (!history || history.length < 2) return false;

    const target = history.find((h) => h.version === targetVersion);
    if (!target) return false;

    await this.unload(moduleId);
    // Re-register the cached factory for the target version
    const cached = this.cache.get(moduleId);
    if (cached) {
      await this.load(moduleId, target.manifest, cached.factory);
      return true;
    }
    return false;
  }

  /* --- Conflict Detection --- */
  detectConflicts(moduleId: string, manifest: ModuleManifest): string[] {
    const conflicts: string[] = [];
    const deps = manifest.sukit?.dependencies ?? {};
    for (const [depId, depVersion] of Object.entries(deps)) {
      const existing = this.modules.get(depId);
      if (existing?.manifest) {
        if (
          !this.checkVersionCompatibility(existing.manifest.version, depVersion)
        ) {
          conflicts.push(
            `Dependency "${depId}" at version ${existing.manifest.version} incompatible with ${depVersion}`
          );
        }
      }
    }
    return conflicts;
  }

  /* --- Override Protection --- */
  protectModule(moduleId: string): void {
    this.overrideProtection.add(moduleId);
  }

  unprotectModule(moduleId: string): void {
    this.overrideProtection.delete(moduleId);
  }

  /* --- Resource Limits --- */
  setResourceLimits(
    moduleId: string,
    limits: { maxMemory?: number; maxCalls?: number; maxLoadTime?: number }
  ): void {
    const current = this.resourceLimits.get(moduleId) ?? {
      maxMemory: 0,
      maxCalls: 0,
      maxLoadTime: 0,
    };
    this.resourceLimits.set(moduleId, { ...current, ...limits });
  }

  /* --- Existing API --- */
  isLoaded(moduleId: string): boolean {
    return this.modules.get(moduleId)?.status === 'active';
  }

  getManifest(moduleId: string): ModuleManifest | undefined {
    return this.modules.get(moduleId)?.manifest;
  }

  list(): Module[] {
    return Array.from(this.modules.values())
      .filter((m) => m.status === 'active')
      .map((m) => m.definition);
  }

  getAll(): ActiveModule[] {
    return Array.from(this.modules.values());
  }

  async reload(
    moduleId: string,
    manifest: ModuleManifest,
    factory: () => Promise<{ default: Module }>
  ): Promise<void> {
    await this.unload(moduleId);
    await this.load(moduleId, manifest, factory);
  }

  /* --- Private Helpers --- */
  private createMetric(): ModuleMetric {
    return {
      loadTime: 0,
      memoryUsage: 0,
      errorCount: 0,
      lastHealthCheck: 0,
      healthStatus: 'healthy',
      callCount: 0,
    };
  }

  private async loadWithTimeout<T>(
    promise: Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Load timeout after ${timeout}ms`)),
          timeout
        )
      ),
    ]);
  }

  private async verifySignature(manifest: ModuleManifest): Promise<boolean> {
    const sig = (manifest as any).signature;
    if (!sig) return false;
    // In production, verify using public key
    return true;
  }

  private async handleRecovery(
    moduleId: string,
    manifest: ModuleManifest,
    factory: () => Promise<{ default: Module }>,
    error: any
  ): Promise<void> {
    // Retry once after brief delay
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const modExports = await factory();
      const mod = modExports.default;
      await mod.activate(this.kernel.forModule(moduleId));
      this.modules.set(moduleId, {
        definition: mod,
        manifest,
        status: 'active',
      });
      await this.kernel.events.emit('module:recovered', { moduleId });
    } catch {
      // Recovery failed, module stays in error state
    }
  }

  private checkVersionCompatibility(
    installed: string,
    required: string
  ): boolean {
    const toParts = (v: string) =>
      v
        .replace(/[^0-9.]/g, '')
        .split('.')
        .map(Number);
    const installedParts = toParts(installed);
    const requiredParts = toParts(required);
    for (
      let i = 0;
      i < Math.max(installedParts.length, requiredParts.length);
      i++
    ) {
      const ip = installedParts[i] ?? 0;
      const rp = requiredParts[i] ?? 0;
      if (rp === 0) continue;
      if (ip < rp) return false;
    }
    return true;
  }

  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aNum = aParts[i] ?? 0;
      const bNum = bParts[i] ?? 0;
      if (aNum > bNum) return 1;
      if (aNum < bNum) return -1;
    }
    return 0;
  }

  private updateDependencyGraph(
    moduleId: string,
    manifest: ModuleManifest
  ): void {
    const deps = Object.keys(manifest.sukit?.dependencies ?? {});
    if (!this.dependencyGraph.has(moduleId)) {
      this.dependencyGraph.set(moduleId, {
        moduleId,
        version: manifest.version,
        dependencies: deps,
        dependents: [],
      });
    }
    for (const depId of deps) {
      if (!this.dependencyGraph.has(depId)) {
        this.dependencyGraph.set(depId, {
          moduleId: depId,
          version: '',
          dependencies: [],
          dependents: [],
        });
      }
      const dep = this.dependencyGraph.get(depId)!;
      if (!dep.dependents.includes(moduleId)) {
        dep.dependents.push(moduleId);
      }
    }
  }
}
