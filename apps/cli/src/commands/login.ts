import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { RegistryClient } from '@sukit/modules-core';

export async function loginCommand(): Promise<void> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Username:',
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password:',
      mask: '*',
    },
  ]);

  const spinner = ora('Logging in...').start();

  try {
    const client = new RegistryClient();
    const user = await client.login(answers.username, answers.password);
    spinner.succeed(`${chalk.green(`Logged in as ${user.username}`)}`);
  } catch (error: any) {
    spinner.fail('Login failed');
    throw error;
  }
}
