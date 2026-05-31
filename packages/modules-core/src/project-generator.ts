import { pathExists, ensureDir, copy, readJson, writeJson } from 'fs-extra';
import { join } from 'path';
import { execSync } from 'child_process';

export class ProjectGenerator {
  private projectName: string;
  private testMode: boolean;
  private projectPath: string;

  constructor(projectName: string, options: { testMode?: boolean } = {}) {
    this.projectName = projectName;
    this.testMode = options.testMode || false;
    this.projectPath = join(process.cwd(), projectName);
  }

  async generate(): Promise<string> {
    await this.ensureDirectory();
    await this.copyTemplate();
    await this.updateProjectNames();
    await this.createEnvFile();

    if (!this.testMode) {
      await this.installDependencies();
    }

    await this.verifySetup();
    return this.projectPath;
  }

  private async ensureDirectory(): Promise<void> {
    if (await pathExists(this.projectPath)) {
      throw new Error(`Directory ${this.projectName} already exists`);
    }
    await ensureDir(this.projectPath);
  }

  private async copyTemplate(): Promise<void> {
    const templatePath = join(this.projectPath, '..', 'templates', 'base-project');
    if (await pathExists(templatePath)) {
      await copy(templatePath, this.projectPath);
    }
  }

  private async updateProjectNames(): Promise<void> {
    const rootPackagePath = join(this.projectPath, 'package.json');
    if (await pathExists(rootPackagePath)) {
      const rootPackage = await readJson(rootPackagePath);
      rootPackage.name = this.projectName;
      await writeJson(rootPackagePath, rootPackage, { spaces: 2 });
    }
  }

  private async createEnvFile(): Promise<void> {
    const envExamplePath = join(this.projectPath, '.env.example');
    const envPath = join(this.projectPath, '.env');
    if (await pathExists(envExamplePath)) {
      await copy(envExamplePath, envPath);
    }
  }

  private async installDependencies(): Promise<void> {
    try {
      execSync('pnpm install', { cwd: this.projectPath, stdio: 'pipe' });
    } catch {
      console.log('  \u26A0\uFE0F  Run "pnpm install" manually');
    }
  }

  private async verifySetup(): Promise<void> {
    const requiredFiles = [
      'package.json',
      'apps/web/package.json',
      'apps/server/package.json',
    ];

    for (const file of requiredFiles) {
      const filePath = join(this.projectPath, file);
      if (!await pathExists(filePath)) {
        throw new Error(`Missing required file: ${file}`);
      }
    }
  }
}
