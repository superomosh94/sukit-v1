import chalk from 'chalk';
import ora from 'ora';
import { RegistryClient } from '@sukit/modules-core';

export async function logoutCommand(): Promise<void> {
  const spinner = ora('Logging out...').start();

  try {
    const client = new RegistryClient();
    await client.logout();
    spinner.succeed(chalk.green('Logged out successfully'));
  } catch (error: any) {
    spinner.fail('Logout failed');
    throw error;
  }
}
