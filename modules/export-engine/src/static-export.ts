import { buildSite } from './sukit-builder';
import type { BuildResult } from './sukit-builder';

export async function generateStaticExport(
  siteId: string,
  outputDir?: string
): Promise<BuildResult> {
  return buildSite(siteId, outputDir || '/tmp/sukit-export', {
    minify: true,
    cleanBeforeBuild: true,
  });
}

export { buildSite, type BuildResult };
