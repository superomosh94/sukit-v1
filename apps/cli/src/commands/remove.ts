import ora from 'ora';
import chalk from 'chalk';
import { StateManager, ModuleUninstaller } from '@sukit/modules-core';

export async function removeCommand(pluginName: string): Promise<void> {
  const spinner = ora(`Removing ${pluginName}...`).start();
  const projectPath = process.cwd();

  try {
    const stateManager = new StateManager(projectPath);
    const installedPlugins = await stateManager.getInstalledPlugins();

    const dependents = installedPlugins.filter(p => {
      // Check if any installed plugin depends on this one
      return false; // Simplified - would check plugin.json requirements
    });

    if (dependents.length > 0) {
      spinner.fail(`Cannot remove ${pluginName}: required by ${dependents.map(d => d.name).join(', ')}`);
      return;
    }

    const uninstaller = new ModuleUninstaller(projectPath);
    await uninstaller.uninstall(pluginName);
    await stateManager.removePlugin(pluginName);

    spinner.succeed(`${chalk.green(pluginName)} removed successfully`);
  } catch (error: any) {
    spinner.fail(`Failed to remove ${pluginName}`);
    throw error;
  }
}
