import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { devCommand } from './commands/dev.js';
import { buildCommand } from './commands/build.js';
import { exportCommand } from './commands/export.js';
import { newCommand } from './commands/new.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(resolve(__dirname, '../package.json'), 'utf-8')
);
const version = pkg.version;

export function run(args: string[]) {
  const program = new Command();

  program
    .name('sukit')
    .description('SUKIT — Visual full-stack application generator')
    .version(version);

  program
    .command('dev')
    .description('Start the development server')
    .option('-p, --port <port>', 'Port to run on', '3000')
    .action(devCommand);

  program
    .command('build')
    .description('Build for production')
    .option('--mode <mode>', 'Build mode: production | static', 'production')
    .action(buildCommand);

  program
    .command('export')
    .description('Export a site to a full-stack application')
    .argument('<site-id>', 'ID of the site to export')
    .option('-o, --output <path>', 'Output directory', './sukit-export')
    .option('--github <repo>', 'Push to GitHub repository')
    .action(exportCommand);

  program
    .command('new')
    .description('Scaffold a new SUKIT project')
    .argument('<project-name>', 'Name of the project')
    .option('--template <template>', 'Template to use', 'default')
    .option('--typescript', 'Use TypeScript', true)
    .action(newCommand);

  program.parse([process.argv[0], process.argv[1] || 'sukit', ...args]);
}
