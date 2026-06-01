import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));

import { resolve, join } from 'node:path';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import chalk from 'chalk';
import ora from 'ora';

interface ExportOptions {
  output: string;
  github?: string;
}

export async function exportCommand(siteId: string, options: ExportOptions) {
  const root = resolve(__dirname, '..', '..', '..', '..');
  const webDir = resolve(root, 'apps', 'web');

  console.log(chalk.cyan('\n  ╔══════════════════════════════════════╗'));
  console.log(chalk.cyan('  ║     SUKIT Export Engine             ║'));
  console.log(chalk.cyan('  ╚══════════════════════════════════════╝\n'));

  console.log(chalk.blue(`  Site ID:  ${siteId}`));
  console.log(chalk.blue(`  Output:   ${options.output}`));
  if (options.github) console.log(chalk.blue(`  GitHub:   ${options.github}`));
  console.log('');

  if (!existsSync(webDir)) {
    console.error(chalk.red(`  Error: Web app not found at ${webDir}`));
    console.error(
      chalk.red('  Run this command from the SUKIT root directory.\n')
    );
    process.exit(1);
  }

  const spinner = ora('  Generating full-stack application...').start();

  try {
    const outputDir = resolve(process.cwd(), options.output);
    mkdirSync(outputDir, { recursive: true });

    const result = execSync(
      `npx tsx -e "
        const { prisma } = require('${root}/apps/web/lib/db/prisma');
        async function main() {
          const { exportFullStack } = await import('${root}/apps/web/lib/export/export-adapter');
          const tree = await exportFullStack('${siteId}');
          for (const file of tree.getAll()) {
            const fs = require('fs');
            const path = require('path');
            const filePath = path.join('${outputDir}', file.path);
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, file.content);
          }
          console.log(JSON.stringify({ fileCount: tree.size, totalBytes: tree.totalBytes() }));
        }
        main().catch(e => { console.error(e); process.exit(1); });
      "`,
      { cwd: webDir, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    );

    spinner.succeed(chalk.green('  Export complete'));
    const info = JSON.parse(result.trim().split('\n').pop() || '{}');
    console.log(chalk.gray(`\n  Files generated: ${info.fileCount || '?'}`));
    console.log(chalk.gray(`  Output:          ${outputDir}`));

    if (options.github) {
      const gitSpinner = ora('  Pushing to GitHub...').start();
      try {
        execSync(
          `
          cd "${outputDir}"
          git init && git add . && git commit -m "Initial SUKIT export"
          git remote add origin ${options.github}
          git push -u origin main
        `,
          { stdio: 'pipe' }
        );
        gitSpinner.succeed(chalk.green(`  Pushed to ${options.github}`));
      } catch {
        gitSpinner.fail(chalk.red('  GitHub push failed'));
        console.log(chalk.yellow('  Push manually:\n'));
        console.log(chalk.gray(`    cd ${outputDir}`));
        console.log(
          chalk.gray(
            '    git init && git add . && git commit -m "Initial commit"'
          )
        );
        console.log(chalk.gray(`    git remote add origin ${options.github}`));
        console.log(chalk.gray('    git push -u origin main\n'));
      }
    } else {
      console.log(chalk.gray(`\n  Next steps:`));
      console.log(chalk.gray(`    cd ${options.output}`));
      console.log(chalk.gray('    docker compose up -d\n'));
    }
  } catch (err) {
    spinner.fail(chalk.red('  Export failed'));
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(`\n  ${message}\n`));
    process.exit(1);
  }
}
