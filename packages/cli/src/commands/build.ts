import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));

import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import chalk from 'chalk';
import ora from 'ora';

interface BuildOptions {
  mode: string;
}

export async function buildCommand(options: BuildOptions) {
  const root = resolve(__dirname, '..', '..', '..', '..');

  console.log(chalk.cyan('\n  ╔══════════════════════════════════════╗'));
  console.log(
    chalk.cyan(`  ║     Building SUKIT (${options.mode})           ║`)
  );
  console.log(chalk.cyan('  ╚══════════════════════════════════════╝\n'));

  const spinner = ora('  Building modules...').start();

  try {
    execSync('pnpm turbo run build', {
      cwd: root,
      stdio: 'pipe',
      env: {
        ...process.env,
        NODE_ENV: options.mode === 'production' ? 'production' : 'development',
      },
    });
    spinner.succeed(chalk.green('  Build complete'));
    console.log(chalk.gray('\n  Output:'));
    console.log(chalk.gray('    apps/web/.next/        — Next.js build'));
    console.log(chalk.gray('    apps/server/dist/      — API server build'));
    console.log(chalk.gray('    packages/*/dist/       — Package builds'));
  } catch (err) {
    spinner.fail(chalk.red('  Build failed'));
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(`\n  ${message}\n`));
    process.exit(1);
  }
}
