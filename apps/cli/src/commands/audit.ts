import chalk from 'chalk';
import { StateManager } from '@sukit/modules-core';

export async function auditCommand(options: { limit?: number } = {}): Promise<void> {
  const projectPath = process.cwd();
  const stateManager = new StateManager(projectPath);

  try {
    const state = await stateManager.loadState();
    const entries = (state.audit || []).slice(0, options.limit || 50);

    if (entries.length === 0) {
      console.log(chalk.yellow('\n  No audit entries.\n'));
      return;
    }

    console.log(chalk.bold(`\n  Audit log (last ${entries.length} entries):\n`));

    const actionIcons: Record<string, string> = {
      plugin_installed: chalk.green('+'),
      plugin_removed: chalk.red('-'),
      plugin_updated: chalk.blue('~'),
      project_created: chalk.magenta('*'),
    };

    for (const entry of entries) {
      const icon = actionIcons[entry.action] || chalk.gray('•');
      const timestamp = new Date(entry.timestamp).toLocaleString();
      console.log(`  ${icon} ${chalk.bold(entry.action)} ${chalk.gray(timestamp)}`);
      if (entry.data?.pluginName) {
        console.log(`    Plugin: ${entry.data.pluginName} ${entry.data.version ? 'v' + entry.data.version : ''}`);
      }
    }
    console.log();
  } catch (error: any) {
    console.log(chalk.red('\n  No sukit project found.\n'));
  }
}
