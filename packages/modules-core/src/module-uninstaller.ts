import { pathExists, remove } from 'fs-extra';
import { join } from 'path';

export class ModuleUninstaller {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  async uninstall(moduleName: string): Promise<boolean> {
    const pluginPath = join(this.projectPath, '.sukit', 'plugins', moduleName);
    if (!await pathExists(pluginPath)) {
      throw new Error(`Module ${moduleName} not found`);
    }

    const frontendPath = join(this.projectPath, 'packages', 'modules', moduleName);
    if (await pathExists(frontendPath)) {
      await remove(frontendPath);
    }

    await remove(pluginPath);
    return true;
  }
}
