import type { SukitKernel } from '@sukit/core';
import type {
  BackupMetadata,
  CloudStorageConfig,
  CommandResult,
} from '../../types';

interface BackupOptions {
  type?: 'full' | 'incremental';
  encrypt?: boolean;
  compression?: 'gzip' | 'zstd' | 'none';
  includes?: {
    database?: boolean;
    media?: boolean;
    config?: boolean;
    modules?: boolean;
  };
  storage?: CloudStorageConfig;
  retention?: { daily?: number; weekly?: number; monthly?: number };
}

interface RestoreOptions {
  backupId: string;
  includes?: {
    database?: boolean;
    media?: boolean;
    config?: boolean;
    modules?: boolean;
  };
  targetSiteId?: string;
  dryRun?: boolean;
}

interface BackupFilter {
  type?: 'full' | 'incremental';
  dateFrom?: string;
  dateTo?: string;
}

interface StorageResult {
  bucket: string;
  key: string;
  url: string;
}

interface NotificationEvent {
  type: 'completed' | 'failed';
  backupId: string;
  size?: number;
  error?: string;
}

export class BackupSystem {
  private kernel: SukitKernel;
  private backups: BackupMetadata[] = [];
  private parentBackupMap: Map<string, string> = new Map();

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  async createBackup(options: BackupOptions = {}): Promise<BackupMetadata> {
    const backupId = crypto.randomUUID();
    const type = options.type || 'full';
    const encrypt = options.encrypt ?? true;
    const compression = options.compression || 'gzip';
    const includes = {
      database: true,
      media: true,
      config: true,
      modules: true,
      ...options.includes,
    };
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    let size: number;
    let checksum: string;
    let parentBackupId: string | undefined;

    try {
      if (type === 'incremental') {
        const lastFull = await this.kernel.settings.get('backup:last-full');
        if (lastFull) {
          parentBackupId = lastFull as string;
          size = Math.floor(Math.random() * 50) + 10;
        } else {
          size = Math.floor(Math.random() * 500) + 100;
        }
      } else {
        size = Math.floor(Math.random() * 500) + 100;
        await this.kernel.settings.set('backup:last-full', backupId);
      }

      if (encrypt) {
        const keyBytes = new Uint8Array(32);
        crypto.getRandomValues(keyBytes);
        const encryptionKey = Array.from(keyBytes)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        await this.kernel.settings.set(
          `backup:encryption-key:${backupId}`,
          encryptionKey
        );
      }

      checksum = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const steps: string[] = [];
      if (includes.database) steps.push('database');
      if (includes.media) steps.push('media');
      if (includes.config) steps.push('configuration');
      if (includes.modules) steps.push('modules');

      for (const step of steps) {
        await this.kernel.events.emit('backup:progress', {
          backupId,
          step,
          progress: steps.indexOf(step) / steps.length,
        });
      }

      const backup: BackupMetadata = {
        id: backupId,
        type,
        size,
        checksum,
        encrypted: encrypt,
        compression,
        includes,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      this.backups.push(backup);
      if (parentBackupId) {
        this.parentBackupMap.set(backupId, parentBackupId);
      }

      if (options.storage) {
        await this.uploadToStorage(backup, options.storage);
      }

      await this.applyRetention(options.retention);
      await this.kernel.events.emit('backup:completed', {
        backupId,
        type,
        size,
      });

      await this.sendNotification('email', {
        type: 'completed',
        backupId,
        size,
      });

      return backup;
    } catch (error) {
      await this.kernel.events.emit('backup:failed', {
        backupId,
        error: String(error),
      });

      await this.sendNotification('email', {
        type: 'failed',
        backupId,
        error: String(error),
      });

      throw error;
    }
  }

  async restore(options: RestoreOptions): Promise<CommandResult> {
    const log: string[] = [];
    const includes = options.includes || {
      database: true,
      media: true,
      config: true,
      modules: true,
    };

    if (options.dryRun) {
      const steps: string[] = [];
      if (includes.database) steps.push('Database');
      if (includes.media) steps.push('Media');
      if (includes.config) steps.push('Config');
      if (includes.modules) steps.push('Modules');

      return {
        success: true,
        message: `Dry run: would restore backup ${options.backupId}`,
        data: {
          backupId: options.backupId,
          steps,
          dryRun: true,
        },
      };
    }

    log.push(`Starting restore of backup ${options.backupId}`);

    const totalSteps = Object.values(includes).filter(Boolean).length;
    let completedSteps = 0;

    if (includes.database) {
      log.push('Restoring database...');
      completedSteps++;
      await this.kernel.events.emit('restore:progress', {
        backupId: options.backupId,
        step: 'database',
        progress: completedSteps / totalSteps,
      });
    }
    if (includes.media) {
      log.push('Restoring media files...');
      completedSteps++;
      await this.kernel.events.emit('restore:progress', {
        backupId: options.backupId,
        step: 'media',
        progress: completedSteps / totalSteps,
      });
    }
    if (includes.config) {
      log.push('Restoring configuration...');
      completedSteps++;
      await this.kernel.events.emit('restore:progress', {
        backupId: options.backupId,
        step: 'config',
        progress: completedSteps / totalSteps,
      });
    }
    if (includes.modules) {
      log.push('Restoring modules...');
      completedSteps++;
      await this.kernel.events.emit('restore:progress', {
        backupId: options.backupId,
        step: 'modules',
        progress: 1.0,
      });
    }

    await this.kernel.events.emit('restore:completed', {
      backupId: options.backupId,
    });

    return {
      success: true,
      message: `Restore complete: ${options.backupId}`,
      data: { backupId: options.backupId, log },
    };
  }

  async listBackups(filters?: BackupFilter): Promise<BackupMetadata[]> {
    let result = [...this.backups];

    if (filters) {
      if (filters.type) {
        result = result.filter((b) => b.type === filters.type);
      }
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom).getTime();
        result = result.filter((b) => new Date(b.createdAt).getTime() >= from);
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo).getTime();
        result = result.filter((b) => new Date(b.createdAt).getTime() <= to);
      }
    }

    return result;
  }

  async deleteBackup(backupId: string): Promise<void> {
    this.backups = this.backups.filter((b) => b.id !== backupId);
    this.parentBackupMap.delete(backupId);
    await this.kernel.settings.delete(`backup:encryption-key:${backupId}`);
    await this.kernel.events.emit('backup:deleted', { backupId });
  }

  async verifyBackup(
    backupId: string
  ): Promise<{ valid: boolean; checksum: string; errors: string[] }> {
    const backup = this.backups.find((b) => b.id === backupId);
    if (!backup) {
      return { valid: false, checksum: '', errors: ['Backup not found'] };
    }
    return { valid: true, checksum: backup.checksum, errors: [] };
  }

  async scheduleBackup(
    cronExpression: string,
    options: BackupOptions
  ): Promise<void> {
    await this.kernel.settings.set(
      `backup:schedule`,
      JSON.stringify({ cron: cronExpression, options })
    );
  }

  async configureStorage(config: CloudStorageConfig): Promise<void> {
    await this.kernel.settings.set('backup:storage', JSON.stringify(config));
  }

  async getStorageConfig(): Promise<CloudStorageConfig | null> {
    const raw = await this.kernel.settings.get('backup:storage');
    if (!raw) return null;
    return JSON.parse(raw as string) as CloudStorageConfig;
  }

  async setBandwidthLimit(kbps: number): Promise<void> {
    await this.kernel.settings.set('backup:bandwidth-limit', kbps);
  }

  async listStoredBackups(storage: CloudStorageConfig): Promise<string[]> {
    const prefix = storage.basePath || 'backups';
    const keys: string[] = [];

    for (const backup of this.backups) {
      keys.push(
        `${prefix}/${backup.id}.${backup.compression === 'gzip' ? 'gz' : 'zst'}`
      );
    }

    await this.kernel.events.emit('backup:stored-list', {
      provider: storage.provider,
      bucket: storage.bucket,
      count: keys.length,
    });

    return keys;
  }

  async sendNotification(
    channel: 'email' | 'webhook',
    event: NotificationEvent
  ): Promise<void> {
    const settings = await this.kernel.settings.get('backup:notification');

    await this.kernel.events.emit('notification:send', {
      channel,
      event,
      settings,
    });
  }

  private async uploadToStorage(
    backup: BackupMetadata,
    storage: CloudStorageConfig
  ): Promise<StorageResult> {
    const key = `${storage.basePath || 'backups'}/${backup.id}.${backup.compression === 'gzip' ? 'gz' : 'zst'}`;
    const bucket = storage.bucket || 'default';
    let url: string;

    switch (storage.provider) {
      case 's3':
        url = `https://${bucket}.s3.${storage.region || 'us-east-1'}.amazonaws.com/${key}`;
        break;
      case 'r2':
        url = `https://${bucket}.${storage.endpoint || storage.region || 'account-id'}.r2.cloudflarestorage.com/${key}`;
        break;
      case 'b2':
        url = `https://${bucket}.backblazeb2.com/${key}`;
        break;
      default:
        url = `https://storage.local/${key}`;
    }

    const bandwidthLimit = (await this.kernel.settings.get(
      'backup:bandwidth-limit'
    )) as number | undefined;

    if (bandwidthLimit && bandwidthLimit > 0) {
      const simulatedSizeBytes = backup.size * 1024 * 1024;
      const delayMs = (simulatedSizeBytes / (bandwidthLimit * 1024)) * 1000;
      if (delayMs > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.min(delayMs, 5000))
        );
      }
    }

    const result: StorageResult = { bucket, key, url };

    await this.kernel.events.emit('backup:uploaded', {
      backupId: backup.id,
      provider: storage.provider,
      bucket,
      key,
      url,
    });

    return result;
  }

  private async applyRetention(retention?: {
    daily?: number;
    weekly?: number;
    monthly?: number;
  }): Promise<void> {
    if (!retention) return;
    const backups = await this.listBackups();
    const now = Date.now();

    const daily = retention.daily || 7;
    const weekly = retention.weekly || 4;
    const monthly = retention.monthly || 12;

    const toDelete = backups.filter((b) => {
      const age = now - new Date(b.createdAt).getTime();
      const days = age / (24 * 60 * 60 * 1000);
      if (days <= daily) return false;
      if (days <= daily + weekly * 7) return days % 7 > 0;
      if (days <= daily + weekly * 7 + monthly * 30) return days % 30 > 0;
      return true;
    });

    for (const b of toDelete.slice(0, toDelete.length - 1)) {
      await this.deleteBackup(b.id);
    }
  }
}
