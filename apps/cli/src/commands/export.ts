import ora from 'ora';
import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { SukitProject } from '@sukit/modules-core';

export async function exportCommand(siteId: string, options: { output?: string }): Promise<void> {
  const apiUrl = process.env.SUKIT_API_URL || 'http://localhost:3000';
  const spinner = ora(`Building static site ${siteId}...`).start();

  try {
    const res = await axios.post(`${apiUrl}/api/export/${siteId}`, {}, { timeout: 300000 });
    const { files, pageCount, totalSize } = res.data;

    if (!files || files.length === 0) {
      spinner.fail('No files generated');
      return;
    }

    const outputDir = options.output ? path.resolve(process.cwd(), options.output) : path.resolve(process.cwd(), 'dist');
    await fs.ensureDir(outputDir);

    const downloadRes = await axios.get(`${apiUrl}/api/export/${siteId}/download`, {
      responseType: 'arraybuffer',
      timeout: 300000,
    });
    const zipPath = path.join(outputDir, `${siteId}-export.zip`);
    await fs.writeFile(zipPath, Buffer.from(downloadRes.data));

    for (const file of files) {
      const filePath = path.join(outputDir, file.path);
      await fs.ensureDir(path.dirname(filePath));
    }

    const project = new SukitProject(process.cwd());
    if (!(await project.exists())) {
      const projectName = process.cwd().split('/').pop() || 'sukit-project';
      await project.init(projectName);
    }

    await project.recordBuild({
      builtAt: new Date().toISOString(),
      siteCount: 1,
      pageCount: pageCount || 0,
      assetCount: 0,
      outputSize: totalSize || 0,
      duration: 0,
    });

    spinner.succeed(`Static site exported to ${outputDir}/${siteId}-export.zip`);
    console.log(`  Pages:  ${pageCount || 0}`);
    console.log(`  Size:   ${totalSize ? formatSize(totalSize) : 'unknown'}`);
    console.log(`  .sukit: ${project.dir}\n`);
  } catch (err: any) {
    spinner.fail('Export failed');
    throw new Error(err?.message || 'Export failed');
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
