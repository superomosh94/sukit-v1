import chalk from 'chalk';
import { StateManager } from '@sukit/modules-core';
import { execSync } from 'child_process';

export async function statusCommand(): Promise<void> {
  const projectPath = process.cwd();
  const stateManager = new StateManager(projectPath);

  try {
    const state = await stateManager.loadState();

    console.log(chalk.bold(`\n  Project: ${state.name}`));
    console.log(`  Version: ${chalk.gray(state.version)}`);
    console.log(`  Created: ${chalk.gray(state.createdAt)}`);
    console.log(`  Updated: ${chalk.gray(state.updatedAt)}`);

    // System checks
    console.log(chalk.bold('\n  System:'));
    try {
      const nodeVersion = execSync('node --version', { stdio: 'pipe' }).toString().trim();
      console.log(`  Node.js: ${chalk.green(nodeVersion)}`);
    } catch {
      console.log(`  Node.js: ${chalk.red('not found')}`);
    }
    try {
      const npmVersion = execSync('npm --version', { stdio: 'pipe' }).toString().trim();
      console.log(`  npm: ${chalk.green(npmVersion)}`);
    } catch {
      console.log(`  npm: ${chalk.red('not found')}`);
    }

    // Installed plugins
    const plugins = state.plugins;
    console.log(chalk.bold(`\n  Plugins (${plugins.length}):`));
    if (plugins.length === 0) {
      console.log('  (none)');
    } else {
      for (const plugin of plugins) {
        const statusColor = plugin.status === 'active' ? chalk.green : chalk.yellow;
        console.log(`  ${chalk.cyan(plugin.name)} ${chalk.gray('v' + plugin.version)} ${statusColor(plugin.status)}`);
      }
    }

    // Audit summary
    const auditCount = state.audit?.length || 0;
    console.log(chalk.bold(`\n  Audit entries: ${auditCount}`));
    console.log();
  } catch (error: any) {
    console.log(chalk.red('\n  No sukit project found in current directory.\n'));
  }
}
