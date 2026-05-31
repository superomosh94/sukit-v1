import type { ModuleManifest } from "./registry";

const MARKETPLACE_API = process.env.NEXT_PUBLIC_MARKETPLACE_URL ?? "https://api.sukit.dev/marketplace";

export interface MarketplaceModule {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  icon: string;
  downloads: number;
  rating: number;
  price: number;
  tags: string[];
  screenshots: string[];
  updatedAt: string;
}

export async function searchModules(
  query: string = "",
  options: { category?: string; page?: number; limit?: number } = {},
): Promise<{ modules: MarketplaceModule[]; total: number }> {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (options.category) params.set("category", options.category);
  if (options.page) params.set("page", options.page.toString());
  if (options.limit) params.set("limit", options.limit.toString());

  const res = await fetch(`${MARKETPLACE_API}/modules?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch marketplace modules");
  return res.json();
}

export async function getModuleDetails(
  moduleId: string,
): Promise<MarketplaceModule> {
  const res = await fetch(`${MARKETPLACE_API}/modules/${moduleId}`);
  if (!res.ok) throw new Error("Module not found");
  return res.json();
}

export async function installModule(
  moduleId: string,
  siteId: string,
): Promise<ModuleManifest> {
  const res = await fetch(`/api/modules/install`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moduleId, siteId }),
  });
  if (!res.ok) throw new Error("Failed to install module");
  return res.json();
}

export async function uninstallModule(
  moduleId: string,
  siteId: string,
): Promise<void> {
  const res = await fetch(`/api/modules/uninstall`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moduleId, siteId }),
  });
  if (!res.ok) throw new Error("Failed to uninstall module");
}

export async function checkForUpdates(): Promise<
  Array<{ moduleId: string; currentVersion: string; latestVersion: string }>
> {
  const res = await fetch(`${MARKETPLACE_API}/modules/updates`);
  if (!res.ok) throw new Error("Failed to check updates");
  return res.json();
}
