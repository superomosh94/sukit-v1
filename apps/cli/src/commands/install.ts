import ora from 'ora';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import inquirer from 'inquirer';

export async function installCommand(moduleId: string): Promise<void> {
  const modulesDir = resolve(process.cwd(), 'packages/modules');
  if (!existsSync(modulesDir)) {
    mkdirSync(modulesDir, { recursive: true });
  }

  if (moduleId.startsWith('http')) {
    const spinner = ora(`Downloading module from ${moduleId}...`).start();
    try {
      const { default: axios } = await import('axios');
      const response = await axios.get(moduleId, { responseType: 'json' });
      const manifest = response.data;
      const targetDir = resolve(modulesDir, manifest.name || moduleId);
      mkdirSync(targetDir, { recursive: true });
      spinner.succeed(`Module ${manifest.name || moduleId} downloaded`);
    } catch (err: any) {
      spinner.fail('Download failed');
      throw new Error(err?.message || 'Download failed');
    }
  } else {
    const sourcePath = resolve(moduleId);
    if (!existsSync(sourcePath)) {
      throw new Error(`Module path not found: ${moduleId}`);
    }

    const spinner = ora(`Installing module from ${moduleId}...`).start();
    const manifestPath = resolve(sourcePath, 'module.json');
    if (!existsSync(manifestPath)) {
      spinner.fail('No module.json found');
      throw new Error('Invalid module: missing module.json');
    }

    const manifest = JSON.parse(await import('fs').then(f => f.readFileSync(manifestPath, 'utf-8')));
    const targetDir = resolve(modulesDir, manifest.name || `module-${Date.now()}`);
    copyFilesRecursive(sourcePath, targetDir);
    spinner.succeed(`Module ${manifest.name || moduleId} installed to ${targetDir}`);
  }
}

function copyFilesRecursive(src: string, dest: string): void {
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = resolve(src, entry.name);
    const destPath = resolve(dest, entry.name);
    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true });
      copyFilesRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}
