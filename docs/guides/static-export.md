# Static Export Guide

SUKIT can export any site as a complete static site (HTML/CSS/JS) for deployment to any static hosting provider.

## Triggering Export from Dashboard

1. Navigate to your site's settings
2. Click "Export Site"
3. Wait for the export to complete
4. Download the ZIP file or deploy directly

## CLI Export Command

```bash
pnpm export --site <site-id> --output ./my-site
```

Options:

| Flag | Description |
|------|-------------|
| `--site` | Site ID to export |
| `--output` | Output directory |
| `--minify` | Minify HTML/CSS/JS |
| `--format` | Output format (`zip` or `directory`) |

## Export Pipeline

The export process follows these steps:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Get     │ -> │  Render  │ -> │  Copy    │ -> │ Generate │ -> │  Create  │
│  Data    │    │  HTML    │    │  Assets  │    │  Sitemap │    │  ZIP     │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

1. **Get Data** — Fetch page content, settings, and media from database
2. **Render HTML** — Render each page using the static renderer (no JavaScript)
3. **Copy Assets** — Copy media files, fonts, and other assets
4. **Generate Sitemap** — Create `sitemap.xml` and `robots.txt`
5. **Create ZIP** — Package everything into a downloadable ZIP

## Deploying to Hosting Providers

### Netlify

```bash
# Using the Netlify CLI
netlify deploy --dir ./exports/my-site --prod
```

Or drag-and-drop the ZIP file into Netlify's dashboard.

### Vercel

```bash
# Using the Vercel CLI
vercel --cwd ./exports/my-site --prod
```

### GitHub Pages

```bash
git checkout gh-pages
cp -r ./exports/my-site/* .
git add .
git commit -m "Deploy site"
git push origin gh-pages
```

### Any Static Host

Extract the ZIP and upload the contents to any web server or CDN (Nginx, Apache, S3, Cloudflare Pages, etc.).
