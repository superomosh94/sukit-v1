import { prisma } from '@/lib/db/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteId: string; pageId: string }> }
) {
  const { siteId, pageId } = await params;

  const page = await prisma.page.findFirst({
    where: {
      id: pageId,
      siteId,
      publishedAt: { not: null },
    },
    include: {
      sections: {
        orderBy: { sortOrder: 'asc' },
        include: {
          columns: {
            orderBy: { sortOrder: 'asc' },
            include: {
              blocks: {
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      },
    },
  });

  if (!page) {
    return new Response('Page not found', { status: 404 });
  }

  const headHtml = (page as any).pageSettings?.headHtml ?? '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  ${headHtml}
</head>
<body>
  <div id="root">
    ${renderPreviewSections(page)}
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

function renderPreviewSections(page: any): string {
  return (page.sections ?? [])
    .map((section: any) => {
      const bg = section.settings?.backgroundColor || 'transparent';
      const pt = section.settings?.paddingTop ?? 40;
      const pb = section.settings?.paddingBottom ?? 40;

      return `<section style="background-color:${bg};padding:${pt}px 16px ${pb}px">
        <div style="max-width:1200px;margin:0 auto">
          <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:16px">
            ${(section.columns ?? [])
              .map(
                (col: any) => `<div style="grid-column:span ${col.span}">
                  ${(col.blocks ?? [])
                    .map((block: any) => renderPreviewBlock(block))
                    .join('')}
                </div>`
              )
              .join('')}
          </div>
        </div>
      </section>`;
    })
    .join('');
}

function renderPreviewBlock(block: {
  blockType: string;
  props: Record<string, unknown>;
}): string {
  switch (block.blockType) {
    case 'text':
      return `<p style="margin:0 0 0.75rem;line-height:1.6">${String(block.props.content ?? '')}</p>`;
    case 'image':
      return `<img src="${String(block.props.src ?? '')}" alt="${String(block.props.alt ?? '')}" style="max-width:100%;height:auto" />`;
    case 'button':
      return `<a href="${String(block.props.href ?? '#')}" style="display:inline-flex;padding:0.75rem 1.5rem;background-color:#0f172a;color:#fff;border-radius:6px;text-decoration:none;font-weight:500">${String(block.props.text ?? 'Button')}</a>`;
    case 'spacer':
      return `<div style="height:${String(block.props.height ?? '40')}px"></div>`;
    case 'divider':
      return `<hr style="border:none;border-top:1px solid #e2e8f0;margin:1rem 0" />`;
    default:
      return `<div style="padding:1rem;border:1px dashed #cbd5e1;border-radius:4px;color:#94a3b8;font-size:0.875rem;text-align:center">${block.blockType}</div>`;
  }
}
