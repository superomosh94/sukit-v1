import { prisma } from "@/lib/db/prisma";
import { PageRenderer } from "@/lib/builder/renderer";
import type { Page } from "@/lib/builder/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteId: string; pageId: string }> },
) {
  const { siteId, pageId } = await params;

  const pageData = await prisma.page.findFirst({
    where: {
      id: pageId,
      siteId,
      publishedAt: { not: null },
    },
    include: {
      sections: {
        orderBy: { sortOrder: "asc" },
        include: {
          columns: {
            orderBy: { sortOrder: "asc" },
            include: {
              blocks: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!pageData) {
    return new Response("Page not found", { status: 404 });
  }

  const page = pageData as unknown as Page;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${page.metadata?.title || "Preview"}</title>
  <meta name="description" content="${page.metadata?.description || ""}" />
  <script src="https://cdn.tailwindcss.com"></script>
  ${page.pageSettings?.headHtml ?? ""}
</head>
<body>
  <div id="root">
    ${renderPreviewSections(page)}
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

function renderPreviewSections(page: Page): string {
  return page.sections
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((section) => {
      const bg = (section.settings?.backgroundColor as string) || "transparent";
      const pt = (section.settings?.paddingTop as number) ?? 40;
      const pb = (section.settings?.paddingBottom as number) ?? 40;

      return `<section style="background-color:${bg};padding:${pt}px 16px ${pb}px">
        <div style="max-width:1200px;margin:0 auto">
          <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:16px">
            ${section.columns
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map(
                (col) => `<div style="grid-column:span ${col.span}">
                  ${col.blocks
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((block) => renderPreviewBlock(block))
                    .join("")}
                </div>`,
              )
              .join("")}
          </div>
        </div>
      </section>`;
    })
    .join("");
}

function renderPreviewBlock(block: {
  blockType: string;
  props: Record<string, unknown>;
}): string {
  switch (block.blockType) {
    case "text":
      return `<p style="margin:0 0 0.75rem;line-height:1.6">${String(block.props.content ?? "")}</p>`;
    case "image":
      return `<img src="${String(block.props.src ?? "")}" alt="${String(block.props.alt ?? "")}" style="max-width:100%;height:auto" />`;
    case "button":
      return `<a href="${String(block.props.href ?? "#")}" style="display:inline-flex;padding:0.75rem 1.5rem;background-color:#0f172a;color:#fff;border-radius:6px;text-decoration:none;font-weight:500">${String(block.props.text ?? "Button")}</a>`;
    case "spacer":
      return `<div style="height:${String(block.props.height ?? "40")}px"></div>`;
    case "divider":
      return `<hr style="border:none;border-top:1px solid #e2e8f0;margin:1rem 0" />`;
    default:
      return `<div style="padding:1rem;border:1px dashed #cbd5e1;border-radius:4px;color:#94a3b8;font-size:0.875rem;text-align:center">${block.blockType}</div>`;
  }
}
