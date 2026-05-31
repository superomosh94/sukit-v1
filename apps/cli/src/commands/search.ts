import chalk from 'chalk';
import ora from 'ora';
import { RegistryClient } from '@sukit/modules-core';

export async function searchCommand(query?: string): Promise<void> {
  const spinner = ora(query ? `Searching for "${query}"...` : 'Fetching available plugins...').start();

  try {
    const client = new RegistryClient();
    const plugins = await client.searchPlugins(query || '');

    spinner.stop();

    if (plugins.length === 0) {
      console.log(chalk.yellow('\n  No plugins found.\n'));
      return;
    }

    console.log(chalk.bold(`\n  Found ${plugins.length} plugin(s):\n`));
    for (const plugin of plugins) {
      const rating = plugin.rating ? `${'★'.repeat(Math.round(plugin.rating))} ${plugin.rating.toFixed(1)}` : '';
      console.log(`  ${chalk.cyan(plugin.name)} ${chalk.gray('v' + plugin.version)}`);
      console.log(`    ${plugin.description || 'No description'}`);
      if (rating) console.log(`    ${chalk.yellow(rating)} ${chalk.gray(plugin.downloads + ' downloads')}`);
      console.log();
    }
  } catch (error: any) {
    spinner.fail('Search failed');
    throw error;
  }
}
