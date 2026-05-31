import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { ProjectGenerator, SukitProject } from '@sukit/modules-core';

export async function newCommand(options: { name?: string; plugins?: string; minimal?: boolean }): Promise<void> {
  let projectName = options.name;

  if (!projectName) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        validate: (input: string) => {
          if (!input.trim()) return 'Project name is required';
          if (!/^[a-z0-9-]+$/.test(input)) return 'Use lowercase letters, numbers, and hyphens only';
          return true;
        },
      },
    ]);
    projectName = answers.projectName;
  }

  const spinner = ora(`Creating project ${projectName!}...`).start();

  try {
    const generator = new ProjectGenerator(projectName!);
    const outputPath = await generator.generate();

    const project = new SukitProject(outputPath);
    await project.init(projectName!);

    spinner.succeed(`Project created at ${outputPath}`);
    console.log(chalk.green(`\n  Project "${projectName}" created successfully!\n`));
    console.log('  Next steps:');
    console.log(`    cd ${projectName}`);
    console.log('    pnpm dev');
    console.log(`  Metadata: ${chalk.dim('.sukit/')}`);
    console.log();
  } catch (error: any) {
    spinner.fail('Failed to create project');
    throw error;
  }
}
