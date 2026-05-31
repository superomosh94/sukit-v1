import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { EnvManager } from '@sukit/modules-core';

export async function secretCommand(action?: string): Promise<void> {
  const projectPath = process.cwd();
  const envManager = new EnvManager(projectPath);

  if (!action) {
    console.log(chalk.yellow('\nUsage: sukit secret <list|add|remove>\n'));
    return;
  }

  switch (action) {
    case 'list': {
      const secrets = await envManager.listSecrets();
      if (secrets.length === 0) {
        console.log(chalk.yellow('\n  No secrets configured.\n'));
        return;
      }
      console.log(chalk.bold(`\n  Secrets (${secrets.length}):\n`));
      for (const { key } of secrets) {
        console.log(`  ${chalk.cyan(key)}`);
      }
      console.log();
      break;
    }

    case 'add': {
      const answers = await inquirer.prompt([
        { type: 'input', name: 'key', message: 'Secret key:' },
        { type: 'password', name: 'value', message: 'Secret value:', mask: '*' },
      ]);
      const spinner = ora('Adding secret...').start();
      try {
        await envManager.addSecret(answers.key, answers.value);
        spinner.succeed(chalk.green(`Secret ${answers.key} added`));
      } catch (error: any) {
        spinner.fail('Failed to add secret');
        throw error;
      }
      break;
    }

    case 'remove': {
      const secrets = await envManager.listSecrets();
      if (secrets.length === 0) {
        console.log(chalk.yellow('\n  No secrets to remove.\n'));
        return;
      }
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'key',
          message: 'Select secret to remove:',
          choices: secrets.map(s => s.key),
        },
      ]);
      const spinner = ora('Removing secret...').start();
      try {
        await envManager.removeSecret(answers.key);
        spinner.succeed(chalk.green(`Secret ${answers.key} removed`));
      } catch (error: any) {
        spinner.fail('Failed to remove secret');
        throw error;
      }
      break;
    }

    default:
      console.log(chalk.red(`Unknown action: ${action}. Use: list, add, remove`));
  }
}
