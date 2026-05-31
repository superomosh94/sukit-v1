import { readFile, pathExists } from 'fs-extra';
import { join } from 'path';

export class ModulePublisher {
  private modulePath: string;
  private errors: string[];

  constructor(modulePath: string) {
    this.modulePath = modulePath;
    this.errors = [];
  }

  async validate(): Promise<boolean> {
    this.errors = [];

    const moduleJsonPath = join(this.modulePath, 'module.json');
    if (!await pathExists(moduleJsonPath)) {
      this.errors.push('Missing module.json');
      return false;
    }

    try {
      const content = await readFile(moduleJsonPath, 'utf-8');
      const config = JSON.parse(content);

      const requiredFields = ['id', 'name', 'version'];
      for (const field of requiredFields) {
        if (!config[field]) {
          this.errors.push(`Missing required field: ${field}`);
        }
      }

      if (config.id && !/^[a-z0-9-]+$/.test(config.id)) {
        this.errors.push('Module id must be lowercase letters, numbers, and hyphens only');
      }

      if (config.version && !/^\d+\.\d+\.\d+$/.test(config.version)) {
        this.errors.push('Version must follow semver format (e.g., 1.0.0)');
      }
    } catch (error: any) {
      this.errors.push(`Invalid module.json: ${error.message}`);
      return false;
    }

    const readmePath = join(this.modulePath, 'README.md');
    if (!await pathExists(readmePath)) {
      this.errors.push('Missing README.md');
    }

    return this.errors.length === 0;
  }

  getErrors(): string[] {
    return this.errors;
  }

  async getModuleData(): Promise<Record<string, any>> {
    const moduleJsonPath = join(this.modulePath, 'module.json');
    const content = await readFile(moduleJsonPath, 'utf-8');
    const config = JSON.parse(content);

    return config;
  }
}
