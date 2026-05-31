import { readFile, writeFile, readJson, writeJson, pathExists, ensureDir } from 'fs-extra';
import { join, dirname } from 'path';

export class EnvManager {
  private projectPath: string;
  private secretsPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.secretsPath = join(projectPath, '.sukit', 'secrets.json');
  }

  async loadSecrets(): Promise<Record<string, string>> {
    if (!await pathExists(this.secretsPath)) return {};
    return readJson(this.secretsPath);
  }

  async saveSecrets(secrets: Record<string, string>): Promise<void> {
    await ensureDir(dirname(this.secretsPath));
    await writeJson(this.secretsPath, secrets, { spaces: 2 });
  }

  async listSecrets(): Promise<{ key: string }[]> {
    const secrets = await this.loadSecrets();
    return Object.keys(secrets).map(key => ({ key }));
  }

  async addSecret(key: string, value: string): Promise<boolean> {
    const secrets = await this.loadSecrets();
    secrets[key] = value;
    await this.saveSecrets(secrets);
    await this.updateEnvFile(key, value);
    return true;
  }

  async removeSecret(key: string): Promise<boolean> {
    const secrets = await this.loadSecrets();
    delete secrets[key];
    await this.saveSecrets(secrets);
    await this.removeFromEnvFile(key);
    return true;
  }

  async updateEnvFile(key: string, value: string): Promise<void> {
    const envPath = join(this.projectPath, '.env');
    if (!await pathExists(envPath)) return;

    let envContent = await readFile(envPath, 'utf-8');
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const newLine = `${key}=${value}`;

    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, newLine);
    } else {
      envContent += `\n${newLine}`;
    }

    await writeFile(envPath, envContent);
  }

  async removeFromEnvFile(key: string): Promise<void> {
    const envPath = join(this.projectPath, '.env');
    if (!await pathExists(envPath)) return;

    let envContent = await readFile(envPath, 'utf-8');
    const regex = new RegExp(`^${key}=.*$\n?`, 'm');
    envContent = envContent.replace(regex, '');
    await writeFile(envPath, envContent);
  }

  async mergeEnvVars(envVars: string[]): Promise<void> {
    const envPath = join(this.projectPath, '.env');
    const envExamplePath = join(this.projectPath, '.env.example');

    for (const filePath of [envPath, envExamplePath]) {
      if (!await pathExists(filePath)) continue;
      let content = await readFile(filePath, 'utf-8');
      for (const envVar of envVars) {
        const key = envVar.split('=')[0];
        if (!content.includes(key)) {
          content += `\n${envVar}`;
        }
      }
      await writeFile(filePath, content);
    }
  }
}
