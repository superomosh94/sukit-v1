import chalk from 'chalk';
import ora from 'ora';
import { RegistryClient } from '@sukit/modules-core';
import { readJson, pathExists } from 'fs-extra';
import { resolve } from 'path';

export async function infoCommand(pluginName: string): Promise<void> {
  const spinner = ora(`Fetching ${pluginName} info...`).start();

  try {
    // Try local first
    const localPath = resolve(process.cwd(), 'plugins', pluginName, 'plugin.json');
    if (await pathExists(localPath)) {
      const config = await readJson(localPath);
      spinner.stop();
      displayPluginInfo(config);
      return;
    }

    // Try registry
    const client = new RegistryClient();
    const plugin = await client.getPlugin(pluginName);
    spinner.stop();
    displayPluginInfo(plugin);
  } catch (error: any) {
    spinner.fail(`Plugin ${pluginName} not found`);
    throw error;
  }
}

function displayPluginInfo(config: Record<string, any>): void {
  console.log(chalk.bold(`\n  ${config.displayName || config.name}`));
  console.log(`  ${chalk.gray('v' + config.version)}`);

  if (config.description) console.log(`  ${config.description}`);
  if (config.category) console.log(`\n  ${chalk.bold('Category:')} ${config.category}`);
  if (config.author) console.log(`  ${chalk.bold('Author:')} ${config.author}`);
  if (config.license) console.log(`  ${chalk.bold('License:')} ${config.license}`);
  if (config.rating) console.log(`  ${chalk.bold('Rating:')} ${'★'.repeat(Math.round(config.rating))} ${config.rating.toFixed(1)}`);
  if (config.downloads) console.log(`  ${chalk.bold('Downloads:')} ${config.downloads}`);

  if (config.requirements?.length) {
    console.log(`\n  ${chalk.bold('Requirements:')} ${config.requirements.join(', ')}`);
  }
  if (config.conflicts?.length) {
    console.log(`  ${chalk.bold('Conflicts:')} ${config.conflicts.join(', ')}`);
  }
  if (config.envVars?.length) {
    console.log(`\n  ${chalk.bold('Environment Variables:')}`);
    for (const env of config.envVars) console.log(`    ${chalk.cyan(env)}`);
  }
  console.log();
}
