import type { SukitKernel } from '@sukit/core';
import type {
  InstallProgress,
  PermissionRequest,
  InstallOptions,
  InstallResult,
  InstallSource,
  InstallStatus,
  UpdateInfo,
  UpdateCheckResult,
  UpdateOptions,
  ModuleInstallData,
} from './types';

export class ModuleInstaller {
  private kernel: SukitKernel;
  private progressListeners: Map<string, (progress: InstallProgress) => void> =
    new Map();

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  // ─── Installation Flow (Category 2) ────────────────────────────

  async install(
    moduleId: string,
    source: InstallSource = 'marketplace',
    options: InstallOptions = {}
  ): Promise<InstallResult> {
    const progress = this.createProgressTracker(moduleId);

    try {
      progress({
        status: 'validating',
        percent: 0,
        message: 'Validating module...',
        log: [],
      });

      const hasPermission = await this.kernel.permissions.check(
        'marketplace:install'
      );
      if (!hasPermission) {
        throw new Error('You do not have permission to install modules');
      }

      const module = await this.fetchModule(moduleId);
      if (!module) throw new Error(`Module "${moduleId}" not found`);

      if (module.status !== 'approved') {
        throw new Error(
          `Module "${module.name}" is not available for installation`
        );
      }

      if (options.installBeta !== true) {
        const nonBeta = module.versions?.filter((v) => !v.isBeta && v.isLatest);
        if (!nonBeta?.length) throw new Error('No stable version available');
      }

      progress({
        status: 'downloading',
        percent: 20,
        message: 'Downloading module...',
        log: ['Download started'],
      });

      const sourceUrl =
        source === 'marketplace'
          ? `/api/marketplace/install/${moduleId}`
          : source === 'url'
            ? options.version || moduleId
            : `/api/marketplace/install/file`;

      const downloadResult = await this.downloadModule(sourceUrl, options);
      progress({
        status: 'downloading',
        percent: 40,
        message: 'Download complete',
        log: [...downloadResult.log, 'Download complete'],
      });

      progress({
        status: 'validating',
        percent: 50,
        message: 'Validating integrity...',
        log: ['Validating module integrity'],
      });
      await this.validateModule(downloadResult);

      if (options.autoResolveDeps !== false) {
        progress({
          status: 'installing_deps',
          percent: 60,
          message: 'Resolving dependencies...',
          log: ['Checking dependencies'],
        });

        const depsResult = await this.resolveAndInstallDependencies(
          moduleId,
          options
        );
        if (depsResult.failed.length > 0) {
          throw new Error(
            `Failed to install dependencies: ${depsResult.failed.join(', ')}`
          );
        }
      }

      progress({
        status: 'activating',
        percent: 80,
        message: 'Activating module...',
        log: ['Activating module'],
      });

      const installedVersion = options.version || module.version;
      await this.kernel.modules.load(moduleId);

      const result = await this.performInstall({
        moduleId,
        version: installedVersion,
        siteId: options.siteId,
        permissions: options.grantPermissions,
      });

      progress({
        status: 'complete',
        percent: 100,
        message: 'Installation complete!',
        log: [...downloadResult.log, 'Installation complete'],
      });

      await this.kernel.events.emit('marketplace:moduleInstalled', {
        moduleId,
        version: installedVersion,
        userId: await this.getCurrentUserId(),
      });

      return {
        success: true,
        moduleId,
        version: installedVersion,
        dependencies: depsResult?.installed ?? [],
      };
    } catch (error: any) {
      progress({
        status: 'failed',
        percent: 0,
        message: error.message,
        log: [`Error: ${error.message}`],
      });

      await this.rollbackInstall(moduleId);
      return {
        success: false,
        moduleId,
        version: options.version || '',
        dependencies: [],
        errors: [error.message],
        rollbackPerformed: true,
      };
    }
  }

  async installFromUrl(
    url: string,
    options: InstallOptions = {}
  ): Promise<InstallResult> {
    return this.install(url, 'url', options);
  }

  async installFromFile(
    file: File,
    options: InstallOptions = {}
  ): Promise<InstallResult> {
    const formData = new FormData();
    formData.append('module', file);

    const res = await fetch('/api/marketplace/install/file', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return this.install(data.moduleId, 'file', options);
  }

  async uninstall(moduleId: string): Promise<boolean> {
    const hasPermission = await this.kernel.permissions.check(
      'marketplace:uninstall'
    );
    if (!hasPermission) throw new Error('Permission denied');

    await fetch(`/api/marketplace/uninstall/${moduleId}`, {
      method: 'POST',
    });
    await this.kernel.modules.unload(moduleId);
    await this.kernel.events.emit('marketplace:moduleUninstalled', {
      moduleId,
      userId: await this.getCurrentUserId(),
    });
    return true;
  }

  async getInstalledModules(): Promise<ModuleInstallData[]> {
    const res = await fetch('/api/marketplace/installed');
    return res.json();
  }

  // ─── Permission Review (Category 2.2) ──────────────────────────

  async getRequiredPermissions(
    moduleId: string,
    version?: string
  ): Promise<PermissionRequest[]> {
    const module = await this.fetchModule(moduleId);
    if (!module) return [];

    const versionData = version
      ? module.versions?.find((v) => v.version === version)
      : module.versions?.find((v) => v.isLatest);

    const perms = versionData?.compatibility
      ? (versionData.compatibility as any)?.permissions || module.permissions
      : module.permissions;

    return perms.map((p: string) => ({
      permission: p,
      label: this.getPermissionLabel(p),
      description: this.getPermissionDescription(p),
      required: this.isPermissionRequired(p),
      granted: false,
    }));
  }

  async setPermissionChoices(
    moduleId: string,
    permissions: { permission: string; granted: boolean }[]
  ): Promise<void> {
    await this.kernel.settings.set(
      `marketplace:permissions:${moduleId}`,
      permissions.reduce(
        (acc, p) => ({ ...acc, [p.permission]: p.granted }),
        {}
      )
    );
  }

  // ─── Module Updates (Category 3) ───────────────────────────────

  async checkForUpdates(options?: {
    moduleIds?: string[];
    includeBeta?: boolean;
  }): Promise<UpdateCheckResult> {
    const params = new URLSearchParams();
    if (options?.moduleIds?.length)
      params.set('modules', options.moduleIds.join(','));
    if (options?.includeBeta) params.set('includeBeta', 'true');

    const res = await fetch(`/api/marketplace/updates/check?${params}`);
    return res.json();
  }

  async updateModule(
    moduleId: string,
    options: { version?: string; backup?: boolean } = {}
  ): Promise<InstallResult> {
    const progress = this.createProgressTracker(`${moduleId}:update`);

    try {
      if (options.backup !== false) {
        progress({
          status: 'downloading',
          percent: 10,
          message: 'Creating backup...',
          log: ['Backing up module data'],
        });
        await this.backupModule(moduleId);
      }

      progress({
        status: 'downloading',
        percent: 30,
        message: 'Downloading update...',
        log: ['Downloading new version'],
      });

      const updatedModule = await this.fetchModule(moduleId);
      if (!updatedModule) throw new Error(`Module "${moduleId}" not found`);

      const targetVersion = options.version || updatedModule.version;

      const res = await fetch(`/api/marketplace/update/${moduleId}`, {
        method: 'POST',
        body: JSON.stringify({ version: targetVersion }),
      });
      const result = await res.json();

      progress({
        status: 'activating',
        percent: 80,
        message: 'Activating update...',
        log: ['Update applied'],
      });

      await this.kernel.modules.reload(moduleId);
      await this.kernel.events.emit('marketplace:moduleUpdated', {
        moduleId,
        fromVersion: result.previousVersion,
        toVersion: targetVersion,
      });

      progress({
        status: 'complete',
        percent: 100,
        message: 'Update complete!',
        log: ['Update completed successfully'],
      });

      return {
        success: true,
        moduleId,
        version: targetVersion,
        dependencies: [],
      };
    } catch (error: any) {
      progress({
        status: 'failed',
        percent: 0,
        message: error.message,
        log: [`Error: ${error.message}`],
      });

      if (options.backup !== false) {
        await this.restoreBackup(moduleId);
      }

      return {
        success: false,
        moduleId,
        version: '',
        dependencies: [],
        errors: [error.message],
        rollbackPerformed: true,
      };
    }
  }

  async updateAllModules(options: UpdateOptions = {}): Promise<{
    updated: string[];
    failed: { moduleId: string; error: string }[];
  }> {
    const res = await fetch('/api/marketplace/update-all', {
      method: 'POST',
      body: JSON.stringify(options),
    });
    return res.json();
  }

  async getUpdateHistory(moduleId: string): Promise<
    {
      version: string;
      previousVersion: string;
      installedAt: string;
    }[]
  > {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/update-history`
    );
    return res.json();
  }

  async rollbackModule(
    moduleId: string,
    version: string
  ): Promise<InstallResult> {
    const res = await fetch(`/api/marketplace/rollback/${moduleId}`, {
      method: 'POST',
      body: JSON.stringify({ version }),
    });
    const result = await res.json();

    await this.kernel.modules.reload(moduleId);
    await this.kernel.events.emit('marketplace:moduleUpdated', {
      moduleId,
      fromVersion: result.previousVersion,
      toVersion: version,
    });

    return { success: true, moduleId, version, dependencies: [] };
  }

  async setAutoUpdate(moduleId: string, enabled: boolean): Promise<void> {
    await this.kernel.settings.set(
      `marketplace:auto-update:${moduleId}`,
      enabled
    );
  }

  async pinVersion(moduleId: string, version: string): Promise<void> {
    await this.kernel.settings.set(`marketplace:pinned:${moduleId}`, version);
  }

  // ─── Progress Tracking ─────────────────────────────────────────

  onProgress(
    moduleId: string,
    listener: (progress: InstallProgress) => void
  ): () => void {
    this.progressListeners.set(moduleId, listener);
    return () => this.progressListeners.delete(moduleId);
  }

  cancelInstall(moduleId: string): void {
    const listener = this.progressListeners.get(moduleId);
    if (listener) {
      listener({
        status: 'cancelled',
        percent: 0,
        message: 'Installation cancelled',
        log: ['Cancelled by user'],
      });
    }
  }

  // ─── Private Helpers ───────────────────────────────────────────

  private createProgressTracker(moduleId: string) {
    return (progress: InstallProgress) => {
      const listener = this.progressListeners.get(moduleId);
      if (listener) listener(progress);
    };
  }

  private async fetchModule(moduleId: string) {
    const res = await fetch(`/api/marketplace/modules/${moduleId}`);
    if (!res.ok) return null;
    return res.json();
  }

  private async downloadModule(
    source: string,
    options: InstallOptions
  ): Promise<{ path: string; log: string[] }> {
    const res = await fetch(source, {
      method: 'POST',
      body: JSON.stringify(options),
    });
    if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
    return res.json();
  }

  private async validateModule(data: any): Promise<void> {
    if (!data.path) throw new Error('Invalid module package');
  }

  private async resolveAndInstallDependencies(
    moduleId: string,
    options: InstallOptions
  ): Promise<{ installed: string[]; failed: string[] }> {
    const res = await fetch(
      `/api/marketplace/modules/${moduleId}/dependencies/resolve`
    );
    const deps = await res.json();
    const installed: string[] = [];
    const failed: string[] = [];

    for (const dep of deps.modules || []) {
      try {
        await this.install(dep.moduleId, 'marketplace', {
          ...options,
          autoResolveDeps: true,
        });
        installed.push(dep.moduleId);
      } catch {
        if (!dep.optional) failed.push(dep.moduleId);
      }
    }
    return { installed, failed };
  }

  private async performInstall(data: {
    moduleId: string;
    version: string;
    siteId?: string;
    permissions?: string[];
  }): Promise<any> {
    const res = await fetch(`/api/marketplace/install/${data.moduleId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  }

  private async rollbackInstall(moduleId: string): Promise<void> {
    try {
      await fetch(`/api/marketplace/install/${moduleId}/rollback`, {
        method: 'POST',
      });
    } catch {
      // Best-effort rollback
    }
  }

  private async backupModule(moduleId: string): Promise<void> {
    await fetch(`/api/marketplace/backup/${moduleId}`, {
      method: 'POST',
    });
  }

  private async restoreBackup(moduleId: string): Promise<void> {
    await fetch(`/api/marketplace/restore/${moduleId}`, {
      method: 'POST',
    });
  }

  private async getCurrentUserId(): Promise<string> {
    try {
      const session = await this.kernel.auth.getSession();
      return session?.userId || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  private getPermissionLabel(permission: string): string {
    const labels: Record<string, string> = {
      'sites:read': 'Read Sites',
      'sites:write': 'Write Sites',
      'pages:read': 'Read Pages',
      'pages:write': 'Write Pages',
      'media:read': 'Read Media',
      'media:write': 'Upload Media',
      'settings:read': 'Read Settings',
      'settings:write': 'Change Settings',
      'users:read': 'Read Users',
      'admin:access': 'Admin Access',
      'modules:install': 'Install Modules',
      'modules:manage': 'Manage Modules',
      'fs:read': 'Read Files',
      'fs:write': 'Write Files',
    };
    return labels[permission] || permission;
  }

  private getPermissionDescription(permission: string): string {
    const descriptions: Record<string, string> = {
      'sites:read': 'View and read site configuration',
      'sites:write': 'Create, update, and delete sites',
      'pages:read': 'View and read page content',
      'pages:write': 'Create, update, and delete pages',
      'media:read': 'Access media library files',
      'media:write': 'Upload new media files',
      'settings:read': 'View module and system settings',
      'settings:write': 'Modify module and system settings',
      'users:read': 'View user information',
      'admin:access': 'Full administrative access to the system',
      'modules:install': 'Install and manage modules',
      'modules:manage': 'Activate, deactivate, and configure modules',
      'fs:read': 'Read files from the file system',
      'fs:write': 'Write and modify files on the file system',
    };
    return descriptions[permission] || `Access to ${permission} functionality`;
  }

  private isPermissionRequired(permission: string): boolean {
    const optional = ['media:read', 'users:read', 'analytics:read'];
    return !optional.includes(permission);
  }
}
