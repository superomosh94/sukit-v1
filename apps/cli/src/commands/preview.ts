import chalk from 'chalk';
import ora from 'ora';
import { readJson, pathExists } from 'fs-extra';
import { resolve } from 'path';

export async function previewCommand(pluginName: string): Promise<void> {
  const spinner = ora(`Generating preview for ${pluginName}...`).start();

  try {
    const pluginPath = resolve(process.cwd(), 'plugins', pluginName);
    const pluginJsonPath = resolve(pluginPath, 'plugin.json');

    if (!await pathExists(pluginJsonPath)) {
      spinner.fail(`Plugin ${pluginName} not found`);
      return;
    }

    const config = await readJson(pluginJsonPath);
    spinner.info(`Preview generation for ${config.displayName || pluginName} requires Vite + Playwright`);
    console.log(`  ${chalk.gray('Run manually:')}`);
    console.log(`  ${chalk.cyan(`cd ${pluginPath} && pnpm add -D vite playwright && npx vite build --outDir screenshots`)}`);
    console.log();
    spinner.stop();
  } catch (error: any) {
    spinner.fail('Preview generation failed');
    throw error;
  }
}
