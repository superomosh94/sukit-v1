import { ensureDir, writeJson, writeFile } from 'fs-extra';
import { join } from 'path';

export interface SDKConfig {
  displayName: string;
  description: string;
  category: string;
  author?: string;
}

export class ModuleSDK {
  private modulesPath: string;

  constructor(modulesPath: string) {
    this.modulesPath = modulesPath;
  }

  async createModule(moduleName: string, config: SDKConfig): Promise<{ modulePath: string; files: string[] }> {
    const modulePath = join(this.modulesPath, moduleName);

    const files: string[] = [];

    await ensureDir(join(modulePath, 'frontend', 'src'));
    await ensureDir(join(modulePath, 'backend', 'src'));

    const moduleJson = {
      id: moduleName,
      name: config.displayName,
      version: '1.0.0',
      description: config.description,
      category: config.category,
      author: config.author || 'SuKit User',
      license: 'MIT',
      icon: 'Package',
      requirements: [],
      conflicts: [],
      settings: {},
      main: 'src/index.ts',
    };

    await writeJson(join(modulePath, 'module.json'), moduleJson, { spaces: 2 });
    files.push('module.json');

    const readme = `# ${config.displayName}\n\n${config.description}\n\n## Installation\n\n\`\`\`bash\npnpm sukit install ${moduleName}\n\`\`\`\n\n## License\n\nMIT`;
    await writeFile(join(modulePath, 'README.md'), readme);
    files.push('README.md');

    await writeJson(join(modulePath, 'dependencies.json'), { frontend: {}, backend: {} }, { spaces: 2 });
    await writeJson(join(modulePath, 'env-vars.json'), [], { spaces: 2 });
    await writeJson(join(modulePath, 'routes.json'), [], { spaces: 2 });
    files.push('dependencies.json', 'env-vars.json', 'routes.json');

    const packageJson = {
      name: `@sukit/module-${moduleName}`,
      version: '1.0.0',
      private: true,
      main: 'src/index.ts',
      scripts: { build: 'tsc', dev: 'tsc --watch' },
      dependencies: {
        react: '^19.0.0',
        '@sukit/shared': 'workspace:*',
        '@sukit/modules-core': 'workspace:*',
      },
    };

    await writeJson(join(modulePath, 'package.json'), packageJson, { spaces: 2 });
    files.push('package.json');

    const indexTs = `import { SukitModule } from '@sukit/modules-core';

const ${moduleName.replace(/-/g, '_')}Module: SukitModule = {
  id: '${moduleName}',
  name: '${config.displayName}',
  version: '1.0.0',
  description: '${config.description}',
  enabled: true,
};

export default ${moduleName.replace(/-/g, '_')}Module;
`;

    await writeFile(join(modulePath, 'frontend', 'src', 'index.ts'), indexTs);
    files.push('frontend/src/index.ts');

    return { modulePath, files };
  }
}
