import ora from 'ora';
import chalk from 'chalk';
import { StateManager, ConflictResolver, ModuleInstaller, DependencyResolver } from '@sukit/modules-core';
import { resolve } from 'path';

export async function addCommand(pluginName: string): Promise<void> {
  const spinner = ora(`Installing ${pluginName}...`).start();
  const projectPath = process.cwd();

  try {
    const stateManager = new StateManager(projectPath);
    const pluginsPath = resolve(projectPath, 'plugins');
    const conflictResolver = new ConflictResolver(pluginsPath, stateManager);

    const conflicts = await conflictResolver.detectConflicts(pluginName);
    if (conflicts.length > 0) {
      const result = await conflictResolver.resolveConflicts(conflicts);
      if (!result.resolved) {
        spinner.fail('Installation cancelled due to conflicts');
        return;
      }
    }

    const installer = new ModuleInstaller(projectPath, pluginsPath);
    const config = await installer.install(pluginName);
    await installer.updateProjectFiles();

    const dependencyResolver = new DependencyResolver(pluginsPath);
    const deps = await dependencyResolver.resolveDependencies([pluginName]);
    if (deps.length > 1) {
      spinner.info(`Dependencies resolved: ${deps.join(', ')}`);
    }

    await stateManager.addPlugin(pluginName, config.version || '1.0.0');
    spinner.succeed(`${chalk.green(pluginName)} installed successfully`);
  } catch (error: any) {
    spinner.fail(`Failed to install ${pluginName}`);
    throw error;
  }
}
