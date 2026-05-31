import { readJson, writeJson, writeFile, pathExists, ensureDir, readFile } from 'fs-extra';
import { join } from 'path';

export class MonitorManager {
  private projectPath: string;
  private configPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.configPath = join(projectPath, '.sukit', 'monitor.json');
  }

  async setup(config: { tools: string[]; email: string }): Promise<{ config: Record<string, any>; files: string[] }> {
    const monitorConfig = {
      tools: config.tools,
      alerts: { email: config.email, events: ['error', 'downtime'] },
      configuredAt: new Date().toISOString(),
    };

    await ensureDir(join(this.projectPath, '.sukit'));
    await writeJson(this.configPath, monitorConfig, { spaces: 2 });

    const generatedFiles: string[] = [];

    if (config.tools.includes('Sentry (Errors)')) {
      const sentryFile = await this.generateSentryConfig();
      generatedFiles.push(sentryFile);
    }

    return { config: monitorConfig, files: generatedFiles };
  }

  private async generateSentryConfig(): Promise<string> {
    const sentryConfig = `import * as Sentry from '@sentry/node';

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
}

export function captureError(error: Error, context: Record<string, any> = {}) {
  Sentry.captureException(error, { extra: context });
}`;

    const outputPath = join(this.projectPath, 'apps', 'server', 'src', 'lib', 'sentry.ts');
    await ensureDir(join(this.projectPath, 'apps', 'server', 'src', 'lib'));
    await writeFile(outputPath, sentryConfig);

    const envPath = join(this.projectPath, '.env.example');
    let envContent = '';
    if (await pathExists(envPath)) {
      envContent = await readFile(envPath, 'utf-8');
    }
    if (!envContent.includes('SENTRY_DSN')) {
      envContent += '\n# Sentry\nSENTRY_DSN=\n';
      await writeFile(envPath, envContent);
    }

    return outputPath;
  }

  async getStatus(): Promise<{ services: Record<string, { enabled: boolean }>; alerts: { email: boolean } }> {
    let config: Record<string, any> = {};
    if (await pathExists(this.configPath)) {
      config = await readJson(this.configPath);
    }

    return {
      services: {
        Sentry: { enabled: config.tools?.includes('Sentry (Errors)') || false },
      },
      alerts: { email: !!config.alerts?.email },
    };
  }
}
