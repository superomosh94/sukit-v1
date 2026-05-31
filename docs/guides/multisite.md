# Multisite Management Guide

SUKIT supports running multiple websites from a single installation. Each site is fully isolated with its own domain, pages, media, and settings.

## Creating Sites

From the dashboard, click "New Site" and enter:

- **Name** — Display name in the admin
- **Domain** — Custom domain or subdomain (e.g., `mysite.example.com`)

Each site gets a unique ID and isolated storage.

## Custom Domains

1. In site settings, add your custom domain
2. Point your domain's DNS A/AAAA record to your SUKIT server IP
3. Add a CNAME record for `www` if needed
4. SUKIT automatically provisions SSL via Let's Encrypt

```
Type: A
Name: @
Value: <your-server-ip>
TTL: 3600

Type: CNAME
Name: www
Value: <your-domain>
TTL: 3600
```

## Site Isolation

Each site is fully isolated:

- **Database** — Data is scoped by `siteId` on every query
- **Media** — Uploaded files stored in `/storage/sites/<siteId>/`
- **Domains** — Each site has its own domain binding
- **Users** — Site-level permissions control who can edit
- **Templates** — Blocks and sections defined per-site or shared globally

## Cross-Site Sharing

Blocks and templates can be shared between sites:

- **Global Blocks** — Blocks registered at the system level appear in all sites
- **Site Templates** — Sections can be saved as templates and used across sites
- **Module Sharing** — Installed modules are available to all sites

To share a block across sites, register it in the global block registry:

```typescript
blockRegistry.registerBlockType({
  type: 'custom-hero',
  component: HeroBlock,
  scope: 'global', // 'global' or 'site'
});
```
