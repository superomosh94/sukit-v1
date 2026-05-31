import { existsSync, mkdirSync, writeFileSync, rmSync, readdirSync } from 'fs';
import { resolve } from 'path';
import ora from 'ora';

export async function moduleAddCommand(name: string): Promise<void> {
  const moduleDir = resolve(process.cwd(), 'packages/modules', name);
  const spinner = ora(`Creating module ${name}...`).start();

  if (existsSync(moduleDir)) {
    spinner.fail(`Module ${name} already exists`);
    throw new Error(`Module ${name} already exists at ${moduleDir}`);
  }

  mkdirSync(moduleDir, { recursive: true });
  mkdirSync(resolve(moduleDir, 'src'));

  writeFileSync(resolve(moduleDir, 'module.json'), JSON.stringify({
    id: `@sukit/module-${name}`,
    name,
    version: '1.0.0',
    description: `SUKIT module: ${name}`,
    main: 'src/index.ts',
  }, null, 2));

  writeFileSync(resolve(moduleDir, 'src', 'index.ts'), `import { SukitModule } from '@sukit/modules-core';

const ${name}Module: SukitModule = {
  id: '@sukit/module-${name}',
  name: '${name.charAt(0).toUpperCase() + name.slice(1)}',
  version: '1.0.0',
  enabled: true,
};

export default ${name}Module;
`);

  writeFileSync(resolve(moduleDir, 'package.json'), JSON.stringify({
    name: `@sukit/module-${name}`,
    version: '1.0.0',
    private: true,
    main: 'src/index.ts',
    dependencies: {
      react: '^19.0.0',
      '@sukit/shared': 'workspace:*',
      '@sukit/modules-core': 'workspace:*',
    },
  }, null, 2));

  spinner.succeed(`Module ${name} created at ${moduleDir}`);
}

export async function moduleRemoveCommand(name: string): Promise<void> {
  const moduleDir = resolve(process.cwd(), 'packages/modules', name);
  const spinner = ora(`Removing module ${name}...`).start();

  if (!existsSync(moduleDir)) {
    spinner.fail(`Module ${name} not found`);
    throw new Error(`Module ${name} not found`);
  }

  rmSync(moduleDir, { recursive: true, force: true });
  spinner.succeed(`Module ${name} removed`);
}

export async function moduleListCommand(): Promise<void> {
  const modulesDir = resolve(process.cwd(), 'packages/modules');
  if (!existsSync(modulesDir)) {
    console.log('No modules directory found.');
    return;
  }

  const entries = readdirSync(modulesDir, { withFileTypes: true });
  const modules = entries.filter(e => e.isDirectory());

  if (modules.length === 0) {
    console.log('No modules installed.');
    return;
  }

  console.log('\nInstalled modules:');
  for (const mod of modules) {
    const moduleJsonPath = resolve(modulesDir, mod.name, 'module.json');
    if (existsSync(moduleJsonPath)) {
      const manifest = JSON.parse(await import('fs').then(f => f.readFileSync(moduleJsonPath, 'utf-8')));
      console.log(`  - ${manifest.name || mod.name} (${manifest.version || '?'})`);
    } else {
      console.log(`  - ${mod.name} (no module.json)`);
    }
  }
  console.log();
}
