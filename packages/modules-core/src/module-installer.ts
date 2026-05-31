import { readJson, pathExists, ensureDir, copy, readFile, writeFile } from 'fs-extra';
import { join } from 'path';

export class ModuleInstaller {
  private projectPath: string;
  private modulesSourcePath: string;

  constructor(projectPath: string, modulesSourcePath: string) {
    this.projectPath = projectPath;
    this.modulesSourcePath = modulesSourcePath;
  }

  async install(moduleName: string): Promise<any> {
    const sourcePath = join(this.modulesSourcePath, moduleName);
    const targetPath = join(this.projectPath, '.sukit', 'plugins', moduleName);

    if (!await pathExists(sourcePath)) {
      throw new Error(`Module ${moduleName} not found in registry`);
    }

    await ensureDir(targetPath);
    await copy(sourcePath, targetPath);

    const config = await readJson(join(sourcePath, 'module.json'));

    const frontendSrc = join(sourcePath, 'frontend');
    const frontendDest = join(this.projectPath, 'packages', 'modules', moduleName);
    if (await pathExists(frontendSrc)) {
      await ensureDir(frontendDest);
      await copy(frontendSrc, frontendDest);
    }

    return config;
  }

  async updateProjectFiles(): Promise<void> {
    const pluginsDir = join(this.projectPath, '.sukit', 'plugins');
    if (!await pathExists(pluginsDir)) return;

    const { readdir } = await import('fs-extra');
    const plugins = await readdir(pluginsDir);

    for (const plugin of plugins) {
      const envVarsPath = join(pluginsDir, plugin, 'env-vars.json');
      if (await pathExists(envVarsPath)) {
        const envVars: string[] = await readJson(envVarsPath);
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
  }
}
