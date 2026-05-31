import type { Section, PageSettings } from './types';

interface ExportOptions {
  title?: string;
  seoSettings?: Record<string, unknown>;
  pageSettings?: PageSettings;
  inlineStyles?: boolean;
  prettify?: boolean;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function styleToString(styles: Record<string, string | number>): string {
  return Object.entries(styles)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(
      ([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${v}`
    )
    .join('; ');
}

function renderList(items: unknown[], ordered: boolean): string {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items
    .map((item) => {
      if (
        typeof item === 'object' &&
        item &&
        'text' in (item as Record<string, unknown>)
      ) {
        return `<li>${escapeHtml(String((item as Record<string, unknown>).text))}</li>`;
      }
      return `<li>${escapeHtml(String(item))}</li>`;
    })
    .join('\n')}</${tag}>`;
}

function renderTable(headers: unknown[], rows: unknown[][]): string {
  const headerHtml = headers
    ? `<thead><tr>${headers.map((h) => `<th>${escapeHtml(String(h))}</th>`).join('')}</tr></thead>`
    : '';
  const bodyHtml = rows
    ? `<tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join('')}</tr>`).join('')}</tbody>`
    : '';
  return `<table>${headerHtml}${bodyHtml}</table>`;
}

function renderBlock(block: {
  blockType: string;
  props: Record<string, unknown>;
  styles: Record<string, string | number>;
}): string {
  const { blockType, props, styles } = block;
  const styleAttr = styleToString(styles);
  const baseStyle = styleAttr ? ` style="${styleAttr}"` : '';
  const id = props.htmlId ? ` id="${escapeHtml(String(props.htmlId))}"` : '';
  const cls = props.cssClass
    ? ` class="${escapeHtml(String(props.cssClass))}"`
    : '';

  switch (blockType) {
    case 'heading': {
      const level = Math.min(6, Math.max(1, (props.level as number) ?? 2));
      const text = escapeHtml((props.text as string) ?? '');
      return `<h${level}${id}${cls}${baseStyle}>${text}</h${level}>`;
    }
    case 'paragraph': {
      const text = escapeHtml((props.text as string) ?? '');
      return `<p${id}${cls}${baseStyle}>${text}</p>`;
    }
    case 'text': {
      const text = escapeHtml((props.text as string) ?? '');
      return `<span${id}${cls}${baseStyle}>${text}</span>`;
    }
    case 'button': {
      const text = escapeHtml((props.text as string) ?? 'Button');
      const href = (props.href as string) ?? '#';
      return `<a href="${escapeHtml(href)}"${id}${cls}${baseStyle}>${text}</a>`;
    }
    case 'link': {
      const text = escapeHtml((props.text as string) ?? 'Link');
      const href = (props.href as string) ?? '#';
      return `<a href="${escapeHtml(href)}"${id}${cls}${baseStyle}>${text}</a>`;
    }
    case 'image': {
      const src = (props.src as string) ?? '';
      const alt = escapeHtml((props.alt as string) ?? '');
      const width = (props.width as string) ?? '';
      const loading = (props.loading as string) ?? 'lazy';
      return `<img src="${escapeHtml(src)}" alt="${alt}" loading="${loading}"${width ? ` width="${width}"` : ''}${id}${cls}${baseStyle} />`;
    }
    case 'video': {
      const src = (props.src as string) ?? '';
      return `<video src="${escapeHtml(src)}"${id}${cls}${baseStyle} controls></video>`;
    }
    case 'divider':
      return `<hr${id}${cls}${baseStyle} />`;
    case 'spacer': {
      const height = (props.height as number) ?? 32;
      return `<div${id}${cls} style="height:${height}px${styleAttr ? '; ' + styleAttr : ''}"></div>`;
    }
    case 'icon': {
      const name = (props.name as string) ?? 'star';
      return `<span${id}${cls}${baseStyle} data-icon="${escapeHtml(name)}"></span>`;
    }
    case 'quote': {
      const text = escapeHtml((props.text as string) ?? '');
      const cite = props.citation
        ? `<cite>— ${escapeHtml(String(props.citation))}</cite>`
        : '';
      return `<blockquote${id}${cls}${baseStyle}><p>${text}</p>${cite}</blockquote>`;
    }
    case 'code': {
      const text = (props.text as string) ?? '';
      const lang = (props.language as string) ?? '';
      return `<pre${id}${cls}${baseStyle}><code${lang ? ` class="language-${escapeHtml(lang)}"` : ''}>${escapeHtml(text)}</code></pre>`;
    }
    case 'list':
      return renderList(
        (props.items as unknown[]) ?? [],
        (props.ordered as boolean) ?? false
      );
    case 'table':
      return renderTable(
        (props.headers as unknown[]) ?? [],
        (props.rows as unknown[][]) ?? []
      );
    case 'accordion': {
      const items =
        (props.items as Array<{ title: string; content: string }>) ?? [];
      return `<div${id}${cls}${baseStyle}>${items
        .map(
          (item) =>
            `<details><summary>${escapeHtml(item.title)}</summary><p>${escapeHtml(item.content)}</p></details>`
        )
        .join('\n')}</div>`;
    }
    case 'tabs': {
      const tabs =
        (props.tabs as Array<{ label: string; content: string }>) ?? [];
      return `<div${id}${cls}${baseStyle} class="tabs">${tabs
        .map(
          (t, i) =>
            `<div class="tab"><button class="tab-btn" data-index="${i}">${escapeHtml(t.label)}</button><div class="tab-panel">${escapeHtml(t.content)}</div></div>`
        )
        .join('\n')}</div>`;
    }
    case 'carousel': {
      const slides =
        (props.slides as Array<{ image?: string; caption?: string }>) ?? [];
      return `<div${id}${cls}${baseStyle} class="carousel">${slides
        .map(
          (s) =>
            `<div class="carousel-slide">${s.image ? `<img src="${escapeHtml(s.image)}" alt="" />` : ''}${s.caption ? `<p>${escapeHtml(s.caption)}</p>` : ''}</div>`
        )
        .join('\n')}</div>`;
    }
    case 'card': {
      const title = escapeHtml((props.title as string) ?? '');
      const description = escapeHtml((props.description as string) ?? '');
      const imageUrl = (props.imageUrl as string) ?? '';
      return `<div${id}${cls}${baseStyle} class="card">${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="" />` : ''}<div class="card-body"><h3>${title}</h3><p>${description}</p></div></div>`;
    }
    case 'testimonial': {
      const quote = escapeHtml((props.quote as string) ?? '');
      const author = escapeHtml((props.author as string) ?? '');
      const role = escapeHtml((props.role as string) ?? '');
      return `<figure${id}${cls}${baseStyle} class="testimonial"><blockquote>${quote}</blockquote><figcaption>${author}${role ? `, ${role}` : ''}</figcaption></figure>`;
    }
    case 'pricing': {
      const plan = escapeHtml((props.plan as string) ?? 'Plan');
      const price = escapeHtml((props.price as string) ?? '$0');
      const features = (props.features as string[]) ?? [];
      return `<div${id}${cls}${baseStyle} class="pricing-card"><h3>${plan}</h3><p class="price">${price}</p><ul>${features.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul></div>`;
    }
    case 'faq': {
      const items =
        (props.items as Array<{ question: string; answer: string }>) ?? [];
      return `<div${id}${cls}${baseStyle}>${items
        .map(
          (item) =>
            `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`
        )
        .join('\n')}</div>`;
    }
    case 'menu': {
      const items =
        (props.items as Array<{ label: string; url: string }>) ?? [];
      return `<nav${id}${cls}${baseStyle}><ul>${items
        .map(
          (item) =>
            `<li><a href="${escapeHtml(item.url)}">${escapeHtml(item.label)}</a></li>`
        )
        .join('\n')}</ul></nav>`;
    }
    case 'breadcrumb': {
      const items =
        (props.items as Array<{ label: string; url: string }>) ?? [];
      return `<nav${id}${cls}${baseStyle} aria-label="Breadcrumb"><ol>${items
        .map(
          (item, i) =>
            `<li>${i < items.length - 1 ? `<a href="${escapeHtml(item.url)}">${escapeHtml(item.label)}</a>` : escapeHtml(item.label)}</li>`
        )
        .join(' / ')}</ol></nav>`;
    }
    case 'back-to-top': {
      return `<a href="#top"${id}${cls}${baseStyle} class="back-to-top">↑ Back to top</a>`;
    }
    case 'gallery': {
      const images =
        (props.images as Array<{ src: string; alt?: string }>) ?? [];
      return `<div${id}${cls}${baseStyle} class="gallery">${images
        .map(
          (img) =>
            `<img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt ?? '')}" loading="lazy" />`
        )
        .join('\n')}</div>`;
    }
    case 'avatar': {
      const src = (props.src as string) ?? '';
      const size = (props.size as number) ?? 48;
      return src
        ? `<img src="${escapeHtml(src)}" alt=""${id}${cls} style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover${styleAttr ? '; ' + styleAttr : ''}" />`
        : `<div${id}${cls}${baseStyle} style="width:${size}px;height:${size}px;border-radius:50%;background:#e2e8f0"></div>`;
    }
    case 'map': {
      const src = (props.src as string) ?? '';
      const height = (props.height as number) ?? 300;
      return `<iframe src="${escapeHtml(src)}"${id}${cls} style="width:100%;height:${height}px;border:0${styleAttr ? '; ' + styleAttr : ''}" loading="lazy"></iframe>`;
    }
    case 'form': {
      const fields =
        (props.fields as Array<{
          type: string;
          label: string;
          placeholder?: string;
          required?: boolean;
          options?: string[];
        }>) ?? [];
      const submitText = escapeHtml((props.submitText as string) ?? 'Submit');
      return `<form${id}${cls}${baseStyle}>${fields
        .map((f) => {
          const fieldId = `field-${f.label?.toLowerCase().replace(/\s+/g, '-') ?? Math.random().toString(36).slice(2)}`;
          const requiredAttr = f.required ? ' required' : '';
          if (f.type === 'select' && f.options) {
            return `<div class="form-field"><label for="${fieldId}">${escapeHtml(f.label)}</label><select id="${fieldId}" name="${fieldId}"${requiredAttr}>${f.options.map((o) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('')}</select></div>`;
          }
          if (f.type === 'textarea') {
            return `<div class="form-field"><label for="${fieldId}">${escapeHtml(f.label)}</label><textarea id="${fieldId}" name="${fieldId}"${requiredAttr} placeholder="${escapeHtml(f.placeholder ?? '')}"></textarea></div>`;
          }
          return `<div class="form-field"><label for="${fieldId}">${escapeHtml(f.label)}</label><input type="${f.type === 'email' ? 'email' : 'text'}" id="${fieldId}" name="${fieldId}"${requiredAttr} placeholder="${escapeHtml(f.placeholder ?? '')}" /></div>`;
        })
        .join('\n')}<button type="submit">${submitText}</button></form>`;
    }
    default: {
      if (
        (blockType === 'container' ||
          blockType === 'section' ||
          blockType === 'row' ||
          blockType === 'column' ||
          blockType === 'grid' ||
          blockType === 'stack') &&
        props.children
      ) {
        return `<div${id}${cls}${baseStyle}>${(props.children as string) ?? ''}</div>`;
      }
      const text = escapeHtml((props.text as string) ?? '');
      return text
        ? `<div${id}${cls}${baseStyle}>${text}</div>`
        : `<div${id}${cls}${baseStyle}></div>`;
    }
  }
}

function renderColumn(column: {
  span: number;
  settings: Record<string, unknown>;
  blocks: Array<{
    blockType: string;
    props: Record<string, unknown>;
    styles: Record<string, string | number>;
  }>;
}): string {
  const blocksHtml = column.blocks.map(renderBlock).join('\n');
  const colStyle = column.settings
    ? styleToString(column.settings as Record<string, string | number>)
    : '';
  const colStyleAttr = colStyle ? ` style="${colStyle}"` : '';
  return `<div class="col col-span-${column.span}"${colStyleAttr}>${blocksHtml}</div>`;
}

function renderSection(section: Section): string {
  const columnsHtml = section.columns.map(renderColumn).join('\n');
  const sectionStyle = section.settings
    ? styleToString(section.settings as Record<string, string | number>)
    : '';
  const sectionStyleAttr = sectionStyle ? ` style="${sectionStyle}"` : '';
  return `<section class="builder-section${section.sectionType ? ` section-type-${section.sectionType}` : ''}"${sectionStyleAttr}>${columnsHtml}</section>`;
}

function collectAnimations(sections: Section[]): string {
  const animTypes = new Set<string>();
  for (const s of sections) {
    for (const c of s.columns) {
      for (const b of c.blocks) {
        const anim = b.animation?.type;
        if (anim && anim !== 'none') animTypes.add(anim);
      }
    }
  }
  if (animTypes.size === 0) return '';

  const keyframes: Record<string, string> = {
    fadeIn: `@keyframes fadeIn{from{opacity:0}to{opacity:1}}`,
    slideUp: `@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`,
    slideDown: `@keyframes slideDown{from{opacity:0;transform:translateY(-30px)}to{opacity:1;transform:translateY(0)}}`,
    slideLeft: `@keyframes slideLeft{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}`,
    slideRight: `@keyframes slideRight{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:translateX(0)}}`,
    scaleIn: `@keyframes scaleIn{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}`,
    zoomIn: `@keyframes zoomIn{from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:scale(1)}}`,
    flip: `@keyframes flip{from{opacity:0;transform:perspective(400px) rotateX(90deg)}to{opacity:1;transform:perspective(400px) rotateX(0)}}`,
  };

  return Array.from(animTypes)
    .map((t) => keyframes[t] ?? '')
    .filter(Boolean)
    .join('\n');
}

function collectResponsiveCss(sections: Section[]): string {
  const rules: string[] = [];
  for (const s of sections) {
    for (const [vp, val] of Object.entries(s.responsive)) {
      const override = val as Record<string, unknown>;
      const hidden = override.hidden;
      if (vp === 'tablet') {
        rules.push(
          `@media(max-width:810px){[data-section-id="${s.id}"].section-type-${s.sectionType}${hidden ? '{display:none}' : ''}}`
        );
      } else if (vp === 'phone') {
        rules.push(
          `@media(max-width:390px){[data-section-id="${s.id}"].section-type-${s.sectionType}${hidden ? '{display:none}' : ''}}`
        );
      }
    }
    for (const c of s.columns) {
      for (const b of c.blocks) {
        for (const [vp, val] of Object.entries(b.responsive)) {
          const override = val as Record<string, unknown>;
          if (vp === 'tablet' && override.hidden) {
            rules.push(
              `@media(max-width:810px){[data-block-id="${b.id}"]{display:none}}`
            );
          } else if (vp === 'phone' && override.hidden) {
            rules.push(
              `@media(max-width:390px){[data-block-id="${b.id}"]{display:none}}`
            );
          }
        }
      }
    }
  }
  return rules.join('\n');
}

export function exportToHtml(
  sections: Section[],
  options: ExportOptions = {}
): string {
  const {
    title = 'Exported Page',
    seoSettings = {},
    pageSettings,
    prettify = true,
  } = options;
  const sectionsHtml = sections.map(renderSection).join('\n\n');
  const animCss = collectAnimations(sections);
  const responsiveCss = collectResponsiveCss(sections);
  const indent = prettify ? '  ' : '';
  const nl = prettify ? '\n' : '';

  const metaDescription = seoSettings.description
    ? `<meta name="description" content="${escapeHtml(String(seoSettings.description))}" />`
    : '';
  const metaKeywords = seoSettings.keywords
    ? `<meta name="keywords" content="${escapeHtml(String(seoSettings.keywords))}" />`
    : '';
  const ogTitle = seoSettings.ogTitle
    ? `<meta property="og:title" content="${escapeHtml(String(seoSettings.ogTitle))}" />`
    : '';
  const ogDesc = seoSettings.ogDescription
    ? `<meta property="og:description" content="${escapeHtml(String(seoSettings.ogDescription))}" />`
    : '';
  const ogImage = seoSettings.ogImage
    ? `<meta property="og:image" content="${escapeHtml(String(seoSettings.ogImage))}" />`
    : '';
  const canonical = seoSettings.canonical
    ? `<link rel="canonical" href="${escapeHtml(String(seoSettings.canonical))}" />`
    : '';

  const extraCss = [
    animCss,
    responsiveCss,
    `
.builder-section{width:100%}.col{flex:1;min-width:0}.grid{display:grid}.flex{display:flex}
.col-span-1{grid-column:span 1/span 1}.col-span-2{grid-column:span 2/span 2}
.col-span-3{grid-column:span 3/span 3}.col-span-4{grid-column:span 4/span 4}
.col-span-6{grid-column:span 6/span 6}.col-span-8{grid-column:span 8/span 8}
.col-span-12{grid-column:span 12/span 12}
.carousel{overflow-x:auto;display:flex;scroll-snap-type:x mandatory}
.carousel-slide{scroll-snap-align:start;min-width:100%}
.tabs .tab-panel{display:none}.tabs .tab-btn[aria-selected=true]+.tab-panel{display:block}
.card{border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}
.card-body{padding:16px}.testimonial{padding:24px;background:#f8fafc;border-radius:8px}
.pricing-card{border:1px solid #e2e8f0;border-radius:8px;padding:24px;text-align:center}
.form-field{margin-bottom:12px}.form-field label{display:block;font-size:14px;margin-bottom:4px}
.form-field input,.form-field select,.form-field textarea{width:100%;padding:8px;border:1px solid #d1d5db;border-radius:4px}
.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}
.gallery img{width:100%;height:200px;object-fit:cover;border-radius:4px}
.back-to-top{position:fixed;bottom:24px;right:24px;padding:8px 16px;background:#0f172a;color:#fff;border-radius:8px;text-decoration:none}
  `,
  ]
    .filter(Boolean)
    .join('\n');

  const headHtml = pageSettings?.headHtml ?? '';

  return [
    '<!DOCTYPE html>',
    `<html lang="en">`,
    `<head>`,
    `<meta charset="UTF-8" />`,
    `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
    `<title>${escapeHtml(title)}</title>`,
    metaDescription,
    metaKeywords,
    ogTitle,
    ogDesc,
    ogImage,
    canonical,
    headHtml,
    `<style>${extraCss}</style>`,
    `</head>`,
    `<body>`,
    ...sectionsHtml.split('\n').map((l) => indent + l),
    `</body>`,
    `</html>`,
  ]
    .filter(Boolean)
    .join(nl);
}

export function exportJson(sections: Section[]): string {
  return JSON.stringify({ version: 1, sections }, null, 2);
}
