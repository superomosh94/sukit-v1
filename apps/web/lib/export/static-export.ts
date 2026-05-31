import { buildSite } from "./sukit-builder";

export async function generateStaticExport(siteId: string, outputDir?: string) {
  return buildSite(siteId, outputDir || '/tmp/sukit-export', { minify: true, cleanBeforeBuild: true });
}
