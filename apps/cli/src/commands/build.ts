import { execSync } from 'child_process';
import ora from 'ora';
import { SukitProject } from '@sukit/modules-core';

export async function buildCommand(): Promise<void> {
  const cwd = process.cwd();
  const project = new SukitProject(cwd);

  if (!(await project.exists())) {
    const spinner = ora('Initializing .sukit metadata...').start();
    const projectName = cwd.split('/').pop() || 'sukit-project';
    await project.init(projectName);
    spinner.succeed('.sukit directory initialized');
  }

  const meta = await project.getMetadata();
  const config = await project.getConfig();

  const spinner = ora('Building SUKIT Next.js application...').start();
  const start = Date.now();

  try {
    execSync('next build', { cwd: 'apps/web', stdio: 'pipe' });
    spinner.succeed('Next.js build complete');
  } catch (err) {
    spinner.fail('Next.js build failed');
    throw err;
  }

  const duration = Date.now() - start;

  await project.recordBuild({
    builtAt: new Date().toISOString(),
    siteCount: 0,
    pageCount: 0,
    assetCount: 0,
    outputSize: 0,
    duration,
  });

  await project.updateMetadata({
    lastBuiltAt: new Date().toISOString(),
    nodeVersion: process.version,
  });

  console.log(`\n  Build completed in ${(duration / 1000).toFixed(1)}s`);
  console.log(`  Metadata: ${project.dir}\n`);
}
