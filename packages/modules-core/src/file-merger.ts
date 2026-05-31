import { readFile, writeFile, readJson, writeJson, pathExists } from 'fs-extra';
import { join } from 'path';

export class FileMerger {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  async mergePackageJson(targetPath: string, newDeps: { dependencies?: Record<string, string>; devDependencies?: Record<string, string>; scripts?: Record<string, string> }): Promise<any> {
    const packageJsonPath = join(targetPath, 'package.json');
    if (!await pathExists(packageJsonPath)) throw new Error(`package.json not found at ${packageJsonPath}`);

    const packageJson = await readJson(packageJsonPath);

    if (newDeps.dependencies) {
      packageJson.dependencies = { ...packageJson.dependencies, ...newDeps.dependencies };
    }
    if (newDeps.devDependencies) {
      packageJson.devDependencies = { ...packageJson.devDependencies, ...newDeps.devDependencies };
    }
    if (newDeps.scripts) {
      packageJson.scripts = { ...packageJson.scripts, ...newDeps.scripts };
    }

    await writeJson(packageJsonPath, packageJson, { spaces: 2 });
    return packageJson;
  }

  async mergeEnvFile(envPath: string, newVars: Record<string, string>): Promise<string[]> {
    let existingContent = '';
    if (await pathExists(envPath)) {
      existingContent = await readFile(envPath, 'utf-8');
    }

    const existingLines = existingContent.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    const existingKeys = new Set(existingLines.map(l => l.split('=')[0]));

    const newLines: string[] = [];
    for (const [key, value] of Object.entries(newVars)) {
      if (!existingKeys.has(key)) {
        newLines.push(`${key}=${value}`);
      }
    }

    if (newLines.length > 0) {
      await writeFile(envPath, existingContent + '\n' + newLines.join('\n'));
    }

    return newLines;
  }

  deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
    const output = { ...target };
    for (const [key, value] of Object.entries(source)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        output[key] = this.deepMerge(output[key] || {}, value);
      } else {
        output[key] = value;
      }
    }
    return output;
  }

  async addLineAfterMarker(filePath: string, marker: string, lineToAdd: string): Promise<boolean> {
    if (!await pathExists(filePath)) return false;

    let content = await readFile(filePath, 'utf-8');
    if (content.includes(lineToAdd)) return false;

    const markerIndex = content.indexOf(marker);
    if (markerIndex === -1) return false;

    const insertPosition = markerIndex + marker.length;
    content = content.slice(0, insertPosition) + '\n' + lineToAdd + content.slice(insertPosition);

    await writeFile(filePath, content);
    return true;
  }

  async appendToGitignore(gitignorePath: string, lines: string[]): Promise<void> {
    if (!await pathExists(gitignorePath)) {
      await writeFile(gitignorePath, lines.join('\n'));
      return;
    }

    let content = await readFile(gitignorePath, 'utf-8');
    const linesToAdd = lines.filter(l => !content.includes(l));

    if (linesToAdd.length > 0) {
      await writeFile(gitignorePath, content + '\n' + linesToAdd.join('\n') + '\n');
    }
  }
}
