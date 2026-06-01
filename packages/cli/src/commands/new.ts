import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));

import { resolve, join } from 'node:path';
import { existsSync, mkdirSync, writeFileSync, cpSync } from 'node:fs';
import { execSync } from 'node:child_process';
import chalk from 'chalk';
import ora from 'ora';

interface NewOptions {
  template: string;
  typescript: boolean;
}

export async function newCommand(projectName: string, options: NewOptions) {
  const root = resolve(__dirname, '..', '..', '..', '..');
  const cwd = process.cwd();
  const projectDir = resolve(cwd, projectName);

  if (existsSync(projectDir)) {
    console.error(
      chalk.red(`\n  Error: Directory "${projectName}" already exists.\n`)
    );
    process.exit(1);
  }

  console.log(chalk.cyan('\n  ╔══════════════════════════════════════╗'));
  console.log(chalk.cyan('  ║     SUKIT — New Project             ║'));
  console.log(chalk.cyan('  ╚══════════════════════════════════════╝\n'));

  console.log(chalk.blue(`  Project:  ${projectName}`));
  console.log(chalk.blue(`  Template: ${options.template}`));
  console.log(chalk.blue(`  TypeScript: ${options.typescript ? 'yes' : 'no'}`));
  console.log('');

  const spinner = ora('  Scaffolding project...').start();

  try {
    mkdirSync(projectDir, { recursive: true });

    const templateDir = resolve(root, 'templates', options.template);
    if (existsSync(templateDir)) {
      cpSync(templateDir, projectDir, { recursive: true });
    }

    const ext = options.typescript ? 'ts' : 'js';
    const pkg = {
      name: projectName,
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'sukit dev',
        build: 'sukit build',
        export: 'sukit export',
      },
    };
    writeFileSync(
      join(projectDir, 'package.json'),
      JSON.stringify(pkg, null, 2)
    );

    writeFileSync(
      join(projectDir, 'README.md'),
      `# ${projectName}

Scaffolded with SUKIT CLI.

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:3000
`
    );

    spinner.succeed(chalk.green('  Project created'));

    const installSpinner = ora('  Installing dependencies...').start();
    try {
      execSync('npm install', { cwd: projectDir, stdio: 'pipe' });
      installSpinner.succeed(chalk.green('  Dependencies installed'));
    } catch {
      installSpinner.warn(chalk.yellow('  Run npm install manually'));
    }

    console.log(chalk.gray(`\n  ${projectName}/`));
    console.log(chalk.gray('    package.json'));
    console.log(chalk.gray('    README.md'));
    console.log(chalk.gray('    (more files from template)\n'));
    console.log(chalk.green('  Done!'));
    console.log(chalk.gray(`\n  cd ${projectName}`));
    console.log(chalk.gray('  npm run dev\n'));
  } catch (err) {
    spinner.fail(chalk.red('  Failed to create project'));
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(`\n  ${message}\n`));
    process.exit(1);
  }
}
