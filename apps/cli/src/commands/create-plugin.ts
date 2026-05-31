import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { ModuleSDK } from '@sukit/modules-core';
import { resolve } from 'path';

export async function createPluginCommand(name?: string): Promise<void> {
  if (!name) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Plugin name:',
        validate: (input: string) => {
          if (!input.trim()) return 'Plugin name is required';
          if (!/^[a-z0-9-]+$/.test(input)) return 'Use lowercase letters, numbers, and hyphens only';
          return true;
        },
      },
    ]);
    name = answers.name;
  }

  const prompts = await inquirer.prompt([
    { type: 'input', name: 'displayName', message: 'Display name:', default: name!.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) },
    { type: 'input', name: 'description', message: 'Description:', default: `A SUKIT plugin called ${name}` },
    {
      type: 'list',
      name: 'category',
      message: 'Category:',
      choices: [
        'authentication', 'payments', 'marketing', 'content',
        'commerce', 'analytics', 'ui', 'database', 'storage', 'devops',
      ],
    },
  ]);

  const pluginsDir = resolve(process.cwd(), 'plugins');
  const sdk = new ModuleSDK(pluginsDir);
  const spinner = ora(`Creating plugin ${name}...`).start();

  try {
    const result = await sdk.createModule(name!, {
      displayName: prompts.displayName,
      description: prompts.description,
      category: prompts.category,
      author: 'SuKit User',
    });
    spinner.succeed(`Plugin ${chalk.green(name!)} created`);
    console.log(`\n  Files created:`);
    for (const file of result.files) {
      console.log(`  ${chalk.gray('└─')} ${file}`);
    }
    console.log();
  } catch (error: any) {
    spinner.fail('Failed to create plugin');
    throw error;
  }
}
