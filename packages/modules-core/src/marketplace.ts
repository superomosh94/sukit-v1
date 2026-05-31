export interface MarketplaceModule {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  downloads: number;
  rating: number;
  icon?: string;
  screenshots: string[];
  createdAt: string;
}

export class MarketplaceClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.MODULE_MARKETPLACE_URL || 'https://marketplace.sukit.dev';
  }

  async browse(params?: { category?: string; search?: string; page?: number }): Promise<MarketplaceModule[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', String(params.page));

    const response = await fetch(`${this.baseUrl}/api/modules?${searchParams.toString()}`);
    if (!response.ok) throw new Error(`Marketplace error: ${response.statusText}`);
    const data = await response.json();
    return data as MarketplaceModule[];
  }

  async getModule(id: string): Promise<MarketplaceModule> {
    const response = await fetch(`${this.baseUrl}/api/modules/${id}`);
    if (!response.ok) throw new Error(`Module not found: ${id}`);
    const data = await response.json();
    return data as MarketplaceModule;
  }

  async getDownloadUrl(id: string, version?: string): Promise<string> {
    const v = version ? `?version=${version}` : '';
    const response = await fetch(`${this.baseUrl}/api/modules/${id}/download${v}`);
    if (!response.ok) throw new Error(`Download URL error: ${response.statusText}`);
    const data = await response.json() as { url: string };
    return data.url;
  }
}

export const marketplaceClient = new MarketplaceClient();
