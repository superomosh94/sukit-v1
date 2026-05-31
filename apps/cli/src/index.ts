#!/usr/bin/env node
import { Command } from 'commander';
import { serveCommand } from './commands/serve';
import { buildCommand } from './commands/build';
import { exportCommand } from './commands/export';
import { installCommand } from './commands/install';
import { moduleAddCommand, moduleRemoveCommand, moduleListCommand } from './commands/module';
import { newCommand } from './commands/new';
import { addCommand } from './commands/add';
import { removeCommand } from './commands/remove';
import { listCommand } from './commands/list';
import { searchCommand } from './commands/search';
import { infoCommand } from './commands/info';
import { updateCommand } from './commands/update';
import { publishCommand } from './commands/publish';
import { loginCommand } from './commands/login';
import { logoutCommand } from './commands/logout';
import { deployCommand } from './commands/deploy';
import { ciCommand } from './commands/ci';
import { secretCommand } from './commands/secret';
import { teamCommand } from './commands/team';
import { statusCommand } from './commands/status';
import { auditCommand } from './commands/audit';
import { createPluginCommand } from './commands/create-plugin';
import { previewCommand } from './commands/preview';

const program = new Command();

program
  .name('sukit')
  .description('SUKIT - Self-hosted visual website builder')
  .version('1.0.0');

// Project commands
program
  .command('new')
  .description('Create a new SUKIT project')
  .option('--name <project>', 'Project name (skip prompt)')
  .option('--plugins <items>', 'Comma-separated list of plugins to include')
  .option('--minimal', 'Create minimal project')
  .action(newCommand);

program
  .command('serve')
  .description('Start the SUKIT production server')
  .action(serveCommand);

program
  .command('build')
  .description('Build the Next.js application')
  .action(buildCommand);

program
  .command('status')
  .description('Show project status and system information')
  .action(statusCommand);

// Export commands
program
  .command('export')
  .description('Export a site to static HTML')
  .argument('[siteId]', 'Site ID to export')
  .option('-o, --output <dir>', 'Output directory (default: dist/)')
  .action((siteId?: string, options?: { output?: string }) => {
    if (!siteId) {
      console.error('Error: siteId is required');
      process.exit(1);
    }
    return exportCommand(siteId, { output: options?.output });
  });

// Plugin/module commands
program
  .command('add')
  .description('Install a plugin/module')
  .argument('<plugin>', 'Plugin name to install')
  .action(addCommand);

program
  .command('remove')
  .description('Uninstall a plugin/module')
  .argument('<plugin>', 'Plugin name to remove')
  .action(removeCommand);

program
  .command('list')
  .description('List installed plugins/modules')
  .action(listCommand);

program
  .command('search')
  .description('Search the plugin registry')
  .argument('[query]', 'Search query')
  .action(searchCommand);

program
  .command('info')
  .description('Show plugin/module information')
  .argument('<plugin>', 'Plugin name')
  .action(infoCommand);

program
  .command('update')
  .description('Update plugin(s) to latest version')
  .argument('[plugin]', 'Plugin name (omit to update all)')
  .action(updateCommand);

program
  .command('install')
  .description('Install a module from URL or local path')
  .argument('<moduleId>', 'Module URL or local path')
  .action(installCommand);

program
  .command('publish')
  .description('Publish a plugin to the registry')
  .argument('[path]', 'Plugin path (defaults to current dir)')
  .action(publishCommand);

program
  .command('login')
  .description('Login to the plugin registry')
  .action(loginCommand);

program
  .command('logout')
  .description('Logout from the plugin registry')
  .action(logoutCommand);

program
  .command('create-plugin')
  .description('Scaffold a new plugin')
  .argument('[name]', 'Plugin name')
  .action(createPluginCommand);

program
  .command('preview')
  .description('Generate preview screenshots for a plugin')
  .argument('<plugin>', 'Plugin name')
  .action(previewCommand);

// Module subcommands
const moduleCommand = program
  .command('module')
  .description('Module management commands');

moduleCommand
  .command('add')
  .description('Scaffold a new module')
  .argument('<name>', 'Module name')
  .action(moduleAddCommand);

moduleCommand
  .command('remove')
  .description('Remove an installed module')
  .argument('<name>', 'Module name to remove')
  .action(moduleRemoveCommand);

moduleCommand
  .command('list')
  .description('List all installed modules')
  .action(moduleListCommand);

// Deployment commands
program
  .command('deploy')
  .description('Deploy to hosting provider')
  .argument('[target]', 'Provider: setup, vercel, railway, aws')
  .action(deployCommand);

program
  .command('ci')
  .description('Generate CI/CD pipeline configuration')
  .argument('[provider]', 'Provider: github, gitlab, circleci')
  .action(ciCommand);

// Infrastructure commands
program
  .command('secret')
  .description('Manage environment secrets')
  .argument('[action]', 'Action: list, add, remove')
  .action(secretCommand);

program
  .command('team')
  .description('Manage team members and roles')
  .argument('[action]', 'Action: init, add, remove, list, sync')
  .action(teamCommand);

program
  .command('audit')
  .description('View plugin/module audit log')
  .option('-n, --limit <number>', 'Number of entries', '50')
  .action((options) => auditCommand({ limit: parseInt(options.limit) }));

program.parse(process.argv);
