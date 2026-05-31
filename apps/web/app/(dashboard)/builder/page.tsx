import Link from 'next/link';

interface Site {
  id: string;
  name: string;
  domain?: string;
  createdAt?: string;
}

async function getSites(): Promise<Site[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/sites`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.sites ?? []);
  } catch {
    return [];
  }
}

export default async function BuilderIndexPage() {
  const sites = await getSites();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Builder</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Select a site and page to start building
          </p>
        </div>
        <Link
          href="/sites"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Manage Sites
        </Link>
      </div>

      {sites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-16 text-center">
          <p className="text-muted-foreground mb-4">No sites found</p>
          <Link
            href="/sites"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Create Your First Site
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}

async function SiteCard({ site }: { site: Site }) {
  let pages: { id: string; title: string; slug: string }[] = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/sites/${site.id}/pages`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      pages = Array.isArray(data) ? data : (data.pages ?? []);
    }
  } catch {}

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold">{site.name}</h2>
          {site.domain && (
            <p className="text-xs text-muted-foreground">{site.domain}</p>
          )}
        </div>
        <Link
          href={`/sites/${site.id}/settings`}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Settings
        </Link>
      </div>
      <div className="divide-y">
        {pages.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No pages yet. Create a page in site settings.
            </p>
            <Link
              href={`/sites/${site.id}/settings`}
              className="mt-2 inline-block text-xs text-primary hover:underline"
            >
              Go to Site Settings
            </Link>
          </div>
        ) : (
          pages.map((page) => (
            <div
              key={page.id}
              className="flex items-center justify-between px-6 py-3"
            >
              <div>
                <p className="text-sm font-medium">{page.title}</p>
                <p className="text-xs text-muted-foreground">/{page.slug}</p>
              </div>
              <Link
                href={`/builder/${site.id}/${page.id}`}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Build
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
