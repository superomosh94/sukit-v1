import ora from 'ora';
import chalk from 'chalk';
import { ModulePublisher, RegistryClient } from '@sukit/modules-core';
import { resolve } from 'path';

export async function publishCommand(pluginPath?: string): Promise<void> {
  const targetPath = pluginPath ? resolve(pluginPath) : resolve(process.cwd());
  const spinner = ora('Validating module...').start();

  try {
    const publisher = new ModulePublisher(targetPath);
    const valid = await publisher.validate();

    if (!valid) {
      spinner.fail('Validation failed');
      for (const error of publisher.getErrors()) {
        console.log(`  ${chalk.red('✗')} ${error}`);
      }
      return;
    }

    spinner.text = 'Publishing to registry...';
    const moduleData = await publisher.getModuleData();
    const client = new RegistryClient();
    const result = await client.publishPlugin(moduleData);

    spinner.succeed(`${chalk.green(moduleData.name)} v${moduleData.version} published successfully!`);
  } catch (error: any) {
    spinner.fail('Publish failed');
    throw error;
  }
}
