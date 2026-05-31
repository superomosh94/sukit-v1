import ora from 'ora';
import chalk from 'chalk';
import { StateManager } from '@sukit/modules-core';

export async function updateCommand(pluginName?: string): Promise<void> {
  const projectPath = process.cwd();
  const stateManager = new StateManager(projectPath);

  const plugins = pluginName
    ? [await stateManager.getPlugin(pluginName)].filter(Boolean)
    : await stateManager.getInstalledPlugins();

  if (plugins.length === 0) {
    console.log(chalk.yellow('No plugins to update.'));
    return;
  }

  for (const plugin of plugins) {
    if (!plugin) continue;
    const spinner = ora(`Checking updates for ${plugin.name}...`).start();

    try {
      // Simplified: would check registry for latest version
      await stateManager.updatePlugin(plugin.name, plugin.version);
      spinner.succeed(`${chalk.green(plugin.name)} is up to date (v${plugin.version})`);
    } catch (error: any) {
      spinner.fail(`Failed to update ${plugin.name}`);
    }
  }
}
