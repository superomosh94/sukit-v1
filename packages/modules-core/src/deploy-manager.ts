import { readJson, writeJson, writeFile, pathExists, ensureDir } from 'fs-extra';
import { join, basename } from 'path';

export type DeployProvider = 'vercel' | 'railway' | 'aws';

export class DeployManager {
  private projectPath: string;
  private configPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.configPath = join(projectPath, '.sukit', 'deploy.json');
  }

  async setupProvider(provider: DeployProvider, config: Record<string, any>): Promise<void> {
    let deployConfig: Record<string, any> = {};
    if (await pathExists(this.configPath)) {
      deployConfig = await readJson(this.configPath);
    }

    deployConfig[provider] = { ...config, configuredAt: new Date().toISOString() };
    await ensureDir(join(this.projectPath, '.sukit'));
    await writeJson(this.configPath, deployConfig, { spaces: 2 });

    switch (provider) {
      case 'vercel':
        await this.generateVercelConfig();
        break;
      case 'railway':
        await this.generateRailwayConfig();
        break;
      case 'aws':
        await this.generateAWSConfig();
        break;
    }
  }

  private async generateVercelConfig(): Promise<void> {
    const vercelConfig = {
      name: basename(this.projectPath),
      version: 2,
      buildCommand: 'pnpm build',
      outputDirectory: 'apps/web/.next',
      installCommand: 'pnpm install',
      framework: 'nextjs',
    };
    await writeJson(join(this.projectPath, 'vercel.json'), vercelConfig, { spaces: 2 });
  }

  private async generateRailwayConfig(): Promise<void> {
    const railwayConfig = {
      build: { builder: 'NIXPACKS', buildCommand: 'pnpm build' },
      deploy: { startCommand: 'pnpm start', healthcheckPath: '/api/health' },
    };
    await writeJson(join(this.projectPath, 'railway.json'), railwayConfig, { spaces: 2 });
  }

  private async generateAWSConfig(): Promise<void> {
    const amplifyConfig = {
      version: 1,
      frontend: {
        phases: {
          preBuild: { commands: ['pnpm install'] },
          build: { commands: ['pnpm build'] },
        },
        artifacts: { baseDirectory: 'apps/web/.next', files: ['**/*'] },
        cache: { paths: ['node_modules/**/*', '.next/cache/**/*'] },
      },
    };
    await writeFile(join(this.projectPath, 'amplify.yml'), JSON.stringify(amplifyConfig, null, 2));
  }

  async deployToVercel(): Promise<{ success: boolean; url: string }> {
    try {
      const { execSync } = await import('child_process');
      execSync('npx vercel --prod', { cwd: this.projectPath, stdio: 'pipe' });
      return { success: true, url: 'https://your-project.vercel.app' };
    } catch {
      throw new Error('Vercel deployment failed. Make sure Vercel CLI is installed.');
    }
  }

  async deployToRailway(): Promise<{ success: boolean; url: string }> {
    try {
      const { execSync } = await import('child_process');
      execSync('npx railway up --detach', { cwd: this.projectPath, stdio: 'pipe' });
      return { success: true, url: 'https://your-project.railway.app' };
    } catch {
      throw new Error('Railway deployment failed. Make sure Railway CLI is installed.');
    }
  }

  async deployToAWS(): Promise<{ success: boolean; url: string }> {
    try {
      const { execSync } = await import('child_process');
      execSync('npx aws amplify start-deployment', { cwd: this.projectPath, stdio: 'pipe' });
      return { success: true, url: 'https://your-project.amplifyapp.com' };
    } catch {
      throw new Error('AWS deployment failed. Make sure AWS CLI is configured.');
    }
  }
}
