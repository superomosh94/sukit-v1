import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { CIGenerator } from '@sukit/modules-core';

export async function ciCommand(provider?: string): Promise<void> {
  const projectPath = process.cwd();

  if (!provider) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select CI provider:',
        choices: [
          { name: 'GitHub Actions', value: 'github' },
          { name: 'GitLab CI', value: 'gitlab' },
          { name: 'CircleCI', value: 'circleci' },
        ],
      },
      {
        type: 'checkbox',
        name: 'stages',
        message: 'Select pipeline stages:',
        choices: [
          { name: 'Lint', value: 'lint', checked: true },
          { name: 'Test', value: 'test', checked: true },
          { name: 'Build', value: 'build', checked: true },
        ],
      },
    ]);

    provider = answers.provider;
    const spinner = ora(`Generating ${provider} CI configuration...`).start();

    try {
      const generator = new CIGenerator(projectPath);
      let result: { path: string };

      switch (provider) {
        case 'github':
          result = await generator.generateGithubActions({ stages: answers.stages, nodeVersion: '20.x' });
          break;
        case 'gitlab':
          result = await generator.generateGitlabCI({ stages: answers.stages, nodeVersion: '20' });
          break;
        case 'circleci':
          result = await generator.generateCircleCI({ stages: answers.stages, nodeVersion: '20' });
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      spinner.succeed(`CI config generated at ${result.path}`);
    } catch (error: any) {
      spinner.fail('CI generation failed');
      throw error;
    }
    return;
  }

  const spinner = ora(`Generating ${provider} CI configuration...`).start();
  try {
    const generator = new CIGenerator(projectPath);
    let result: { path: string };

    switch (provider) {
      case 'github':
        result = await generator.generateGithubActions({ stages: ['lint', 'test', 'build'] });
        break;
      case 'gitlab':
        result = await generator.generateGitlabCI({ stages: ['lint', 'test', 'build'] });
        break;
      case 'circleci':
        result = await generator.generateCircleCI({ stages: ['lint', 'test', 'build'] });
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    spinner.succeed(`CI config generated at ${result.path}`);
  } catch (error: any) {
    spinner.fail('CI generation failed');
    throw error;
  }
}
