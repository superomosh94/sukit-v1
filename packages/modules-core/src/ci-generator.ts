import { writeFile, ensureDir } from 'fs-extra';
import { join } from 'path';

export interface CIGeneratorOptions {
  stages: string[];
  nodeVersion?: string;
}

export class CIGenerator {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  async generateGithubActions(options: CIGeneratorOptions): Promise<{ path: string }> {
    const workflow: Record<string, any> = {
      name: 'CI/CD Pipeline',
      on: {
        push: { branches: ['main', 'develop'] },
        pull_request: { branches: ['main'] },
      },
      jobs: {
        build: {
          'runs-on': 'ubuntu-latest',
          strategy: { matrix: { node: [options.nodeVersion || '20.x'] } },
          steps: [
            { uses: 'actions/checkout@v4' },
            { name: 'Setup pnpm', uses: 'pnpm/action-setup@v4', with: { version: 'latest' } },
            { name: 'Setup Node.js', uses: 'actions/setup-node@v4', with: { 'node-version': '${{ matrix.node }}', cache: 'pnpm' } },
            { name: 'Install dependencies', run: 'pnpm install' },
          ],
        },
      },
    };

    if (options.stages.includes('lint')) {
      workflow.jobs.build.steps.push({ name: 'Run linter', run: 'pnpm lint' });
    }
    if (options.stages.includes('test')) {
      workflow.jobs.build.steps.push({ name: 'Run tests', run: 'pnpm test' });
    }
    if (options.stages.includes('build')) {
      workflow.jobs.build.steps.push({ name: 'Build', run: 'pnpm build' });
    }

    const outputPath = join(this.projectPath, '.github', 'workflows', 'ci.yml');
    await ensureDir(join(this.projectPath, '.github', 'workflows'));

    const yaml = await this.stringifyYaml(workflow);
    await writeFile(outputPath, yaml);
    return { path: outputPath };
  }

  async generateGitlabCI(options: CIGeneratorOptions): Promise<{ path: string }> {
    const pipeline: Record<string, any> = {
      stages: options.stages || ['install', 'lint', 'test', 'build'],
      cache: { key: '$CI_COMMIT_REF_SLUG', paths: ['node_modules/'] },
      variables: { NODE_VERSION: options.nodeVersion || '20' },
      install: { stage: 'install', script: ['pnpm install'], artifacts: { paths: ['node_modules/'] } },
    };

    if (options.stages.includes('lint')) {
      pipeline.lint = { stage: 'lint', script: ['pnpm lint'], dependencies: ['install'] };
    }
    if (options.stages.includes('test')) {
      pipeline.test = { stage: 'test', script: ['pnpm test'], dependencies: ['install'] };
    }
    if (options.stages.includes('build')) {
      pipeline.build = { stage: 'build', script: ['pnpm build'], dependencies: ['install'], artifacts: { paths: ['apps/web/.next/'] } };
    }

    const outputPath = join(this.projectPath, '.gitlab-ci.yml');
    const yaml = await this.stringifyYaml(pipeline);
    await writeFile(outputPath, yaml);
    return { path: outputPath };
  }

  async generateCircleCI(options: CIGeneratorOptions): Promise<{ path: string }> {
    const config: Record<string, any> = {
      version: 2.1,
      jobs: {
        build: {
          docker: [{ image: `cimg/node:${options.nodeVersion || '20'}` }],
          steps: [
            'checkout',
            { run: 'pnpm install' },
          ],
        },
      },
      workflows: {
        version: 2,
        build_and_test: { jobs: ['build'] },
      },
    };

    if (options.stages.includes('lint')) {
      config.jobs.build.steps.push({ run: 'pnpm lint' });
    }
    if (options.stages.includes('test')) {
      config.jobs.build.steps.push({ run: 'pnpm test' });
    }
    if (options.stages.includes('build')) {
      config.jobs.build.steps.push({ run: 'pnpm build' });
    }

    const outputPath = join(this.projectPath, '.circleci', 'config.yml');
    await ensureDir(join(this.projectPath, '.circleci'));
    const yaml = await this.stringifyYaml(config);
    await writeFile(outputPath, yaml);
    return { path: outputPath };
  }

  private async stringifyYaml(obj: Record<string, any>): Promise<string> {
    const yaml = await import('yaml');
    return yaml.stringify(obj);
  }
}
