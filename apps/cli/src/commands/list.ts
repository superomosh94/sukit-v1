import chalk from 'chalk';
import { StateManager } from '@sukit/modules-core';

export async function listCommand(): Promise<void> {
  const projectPath = process.cwd();
  const stateManager = new StateManager(projectPath);
  const plugins = await stateManager.getInstalledPlugins();

  if (plugins.length === 0) {
    console.log(chalk.yellow('\n  No plugins installed.\n'));
    return;
  }

  console.log(chalk.bold(`\n  Installed plugins (${plugins.length}):\n`));
  for (const plugin of plugins) {
    const statusColor = plugin.status === 'active' ? chalk.green : chalk.yellow;
    console.log(`  ${chalk.cyan(plugin.name)} ${chalk.gray('v' + plugin.version)} ${statusColor('(' + plugin.status + ')')} ${chalk.gray(plugin.installedAt)}`);
  }
  console.log();
}
