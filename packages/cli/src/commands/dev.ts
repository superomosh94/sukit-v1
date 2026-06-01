import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));

import { execSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import chalk from 'chalk';

interface DevOptions {
  port: string;
}

export async function devCommand(options: DevOptions) {
  const root = resolve(__dirname, '..', '..', '..', '..');
  const webDir = resolve(root, 'apps', 'web');
  const serverDir = resolve(root, 'apps', 'server');
  const hasServer = existsSync(serverDir);

  console.log(chalk.cyan('\n  ╔══════════════════════════════════════╗'));
  console.log(chalk.cyan('  ║     SUKIT Development Server        ║'));
  console.log(chalk.cyan('  ╚══════════════════════════════════════╝\n'));

  if (hasServer) {
    console.log(chalk.blue('  Starting API server...'));
    const server = spawn('pnpm', ['--filter', '@sukit/server', 'dev'], {
      cwd: root,
      stdio: 'inherit',
      shell: true,
    });
    server.on('error', (err) => {
      console.log(chalk.yellow(`  API server: ${err.message}`));
    });
  }

  console.log(
    chalk.blue(`  Starting web dev server on port ${options.port}...\n`)
  );

  const web = spawn('pnpm', ['--filter', 'sukit-web', 'dev'], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: options.port },
  });

  web.on('close', (code) => {
    console.log(chalk.red(`\n  Web server exited with code ${code}\n`));
    process.exit(code ?? 1);
  });
}
