import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { DeployManager, DeployProvider } from '@sukit/modules-core';

export async function deployCommand(target?: string): Promise<void> {
  const projectPath = process.cwd();

  if (!target || target === 'setup') {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select deployment provider:',
        choices: [
          { name: 'Vercel', value: 'vercel' },
          { name: 'Railway', value: 'railway' },
          { name: 'AWS Amplify', value: 'aws' },
        ],
      },
    ]);

    const spinner = ora(`Setting up ${answers.provider}...`).start();
    try {
      const manager = new DeployManager(projectPath);
      await manager.setupProvider(answers.provider as DeployProvider, {});
      spinner.succeed(`${answers.provider} configured successfully`);
    } catch (error: any) {
      spinner.fail('Setup failed');
      throw error;
    }
    return;
  }

  const validTargets: DeployProvider[] = ['vercel', 'railway', 'aws'];
  if (!validTargets.includes(target as DeployProvider)) {
    console.log(chalk.red(`Unknown target: ${target}. Use: setup, vercel, railway, aws`));
    return;
  }

  const spinner = ora(`Deploying to ${target}...`).start();
  try {
    const manager = new DeployManager(projectPath);
    const result = await (target === 'vercel'
      ? manager.deployToVercel()
      : target === 'railway'
        ? manager.deployToRailway()
        : manager.deployToAWS());
    spinner.succeed(`Deployed to ${result.url}`);
  } catch (error: any) {
    spinner.fail('Deployment failed');
    throw error;
  }
}
