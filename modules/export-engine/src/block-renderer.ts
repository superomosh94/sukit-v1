export function renderBlock(block: {
  blockType: string;
  props: Record<string, unknown>;
  styles?: Record<string, unknown>;
  id?: string;
}): string {
  const renderer = blockRenderers[block.blockType] ?? renderUnknownBlock;
  return renderer(block);
}

const blockRenderers: Record<
  string,
  (b: {
    props: Record<string, unknown>;
    styles?: Record<string, unknown>;
    id?: string;
  }) => string
> = {
  textBlock: (b) => {
    const tag = (b.props.tag as string) || 'p';
    const content = (b.props.content as string) || '';
    const style = inlineStyle(b.styles, {
      margin: '0 0 0.75rem',
      lineHeight: '1.6',
    });
    return `<${tag} style="${style}">${content}</${tag}>`;
  },

  headingBlock: (b) => {
    const level = (b.props.level as number) || 2;
    const content = (b.props.content as string) || '';
    const sizes: Record<number, string> = {
      1: '2.5rem',
      2: '2rem',
      3: '1.5rem',
      4: '1.25rem',
      5: '1rem',
      6: '0.875rem',
    };
    const style = inlineStyle(b.styles, {
      margin: '0 0 0.5rem',
      fontWeight: '700',
      fontSize: sizes[level] ?? '2rem',
      lineHeight: '1.2',
    });
    return `<h${level} style="${style}">${content}</h${level}>`;
  },

  imageBlock: (b) => {
    const src = (b.props.src as string) || '';
    const alt = (b.props.alt as string) || '';
    const width = b.props.width as string;
    const height = b.props.height as string;
    const lazy = b.props.lazy !== false;
    const cls = `${b.props.className || ''}`;
    const style = inlineStyle(b.styles, { maxWidth: '100%', height: 'auto' });
    const dims = `${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''}`;
    return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}"${dims} loading="${lazy ? 'lazy' : 'eager'}" class="${cls}" style="${style}" />`;
  },

  buttonBlock: (b) => {
    const text = (b.props.text as string) || 'Button';
    const href = (b.props.href as string) || (b.props.url as string) || '#';
    const target = (b.props.target as string) || '';
    const variant = (b.props.variant as string) || 'primary';
    const size = (b.props.size as string) || 'md';
    const fullWidth = !!b.props.fullWidth;

    const sizes: Record<string, string> = {
      sm: '0.5rem 1rem',
      md: '0.75rem 1.5rem',
      lg: '1rem 2rem',
    };
    const variants: Record<string, string> = {
      primary: '#0f172a;color:#fff',
      secondary: '#e2e8f0;color:#0f172a',
      outline: 'transparent;color:#0f172a;border:1px solid #0f172a',
      ghost: 'transparent;color:#0f172a',
      link: 'transparent;color:#0f172a;text-decoration:underline;padding:0',
    };
    const baseStyle = `display:inline-flex;align-items:center;justify-content:center;padding:${sizes[size] ?? sizes.md};border-radius:6px;font-weight:500;text-decoration:none;${fullWidth ? 'width:100%' : ''}`;
    const variantStyle = variants[variant] || variants.primary;
    const style = inlineStyle(b.styles, {});
    const targetAttr = target ? ` target="${escapeAttr(target)}"` : '';
    return `<a href="${escapeAttr(href)}"${targetAttr} style="${baseStyle};background-color:${variantStyle}">${text}</a>`;
  },

  spacerBlock: (b) => {
    const height = (b.props.height as number) ?? 40;
    return `<div style="height:${height}px" aria-hidden="true"></div>`;
  },

  dividerBlock: (b) => {
    const color = (b.props.color as string) || '#e2e8f0';
    const thickness = (b.props.thickness as number) ?? 1;
    return `<hr style="border:none;border-top:${thickness}px solid ${color};margin:1rem 0" />`;
  },

  iconBlock: (b) => {
    const name = (b.props.name as string) || 'circle';
    const size = (b.props.size as number) ?? 24;
    const color = (b.props.color as string) || '#0f172a';
    return renderLucideIcon(name, size, color);
  },

  videoBlock: (b) => {
    const src = (b.props.src as string) || '';
    const poster = (b.props.poster as string) || '';
    const controls = b.props.controls !== false;
    const autoplay = !!b.props.autoplay;
    const loop = !!b.props.loop;
    const muted = !!b.props.muted;
    return `<video${controls ? ' controls' : ''}${autoplay ? ' autoplay' : ''}${loop ? ' loop' : ''}${muted ? ' muted' : ''}${poster ? ` poster="${escapeAttr(poster)}"` : ''} style="max-width:100%;height:auto"><source src="${escapeAttr(src)}" />Your browser does not support the video tag.</video>`;
  },

  mapBlock: (b) => {
    const address = (b.props.address as string) || '';
    const zoom = (b.props.zoom as number) ?? 14;
    const encoded = encodeURIComponent(address);
    return `<iframe title="Map" src="https://maps.google.com/maps?q=${encoded}&z=${zoom}&output=embed" style="width:100%;height:300px;border:0;border-radius:8px" allowfullscreen loading="lazy"></iframe>`;
  },

  formBlock: (b) => {
    const formId = b.id || 'form';
    const fields =
      (b.props.fields as Array<{
        type: string;
        label: string;
        name: string;
        required?: boolean;
        placeholder?: string;
      }>) || [];
    const submitText = (b.props.submitText as string) || 'Submit';
    const style = inlineStyle(b.styles, { padding: '1rem' });
    const fieldsHtml = fields
      .map((f) => {
        const required = f.required ? ' required' : '';
        const placeholder = f.placeholder
          ? ` placeholder="${escapeAttr(f.placeholder)}"`
          : '';
        const label = f.label
          ? `<label style="display:block;margin-bottom:0.25rem;font-weight:500">${f.label}</label>`
          : '';
        if (f.type === 'textarea') {
          return `<div style="margin-bottom:0.75rem">${label}<textarea name="${escapeAttr(f.name)}"${required}${placeholder} style="width:100%;padding:0.5rem;border:1px solid #d1d5db;border-radius:4px;min-height:80px"></textarea></div>`;
        }
        if (f.type === 'select') {
          const options = ((f as any).options as string[]) || [];
          return `<div style="margin-bottom:0.75rem">${label}<select name="${escapeAttr(f.name)}"${required} style="width:100%;padding:0.5rem;border:1px solid #d1d5db;border-radius:4px">${options.map((o) => `<option value="${escapeAttr(o)}">${o}</option>`).join('')}</select></div>`;
        }
        if (f.type === 'checkbox') {
          return `<div style="margin-bottom:0.75rem"><label><input type="checkbox" name="${escapeAttr(f.name)}"${required} /> ${f.label}</label></div>`;
        }
        return `<div style="margin-bottom:0.75rem">${label}<input type="${f.type === 'email' ? 'email' : 'text'}" name="${escapeAttr(f.name)}"${required}${placeholder} style="width:100%;padding:0.5rem;border:1px solid #d1d5db;border-radius:4px" /></div>`;
      })
      .join('');
    return `<form id="${escapeAttr(formId)}" style="${style}">${fieldsHtml}<button type="submit" style="padding:0.75rem 1.5rem;background-color:#0f172a;color:#fff;border:none;border-radius:6px;font-weight:500;cursor:pointer">${submitText}</button></form>`;
  },

  containerBlock: (b) => {
    const children = (b.props.children as string) || '';
    const maxWidth = (b.props.maxWidth as string) || '1200px';
    const style = inlineStyle(b.styles, {
      margin: '0 auto',
      maxWidth,
      width: '100%',
    });
    return `<div style="${style}">${children}</div>`;
  },

  gridBlock: (b) => {
    const cols = (b.props.columns as number) ?? 2;
    const gap = (b.props.gap as string) || '16px';
    const children = (b.props.children as string) || '';
    const style = inlineStyle(b.styles, {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap,
    });
    return `<div style="${style}">${children}</div>`;
  },

  accordionBlock: (b) => {
    const items =
      (b.props.items as Array<{ title: string; content: string }>) || [];
    const style = inlineStyle(b.styles, { borderTop: '1px solid #e2e8f0' });
    return `<div style="${style}">${items
      .map(
        (item, i) => `
      <details${i === 0 ? ' open' : ''} style="border-bottom:1px solid #e2e8f0">
        <summary style="padding:0.75rem 0;font-weight:600;cursor:pointer">${item.title}</summary>
        <div style="padding:0 0 0.75rem;color:#64748b">${item.content}</div>
      </details>`
      )
      .join('')}</div>`;
  },

  tabsBlock: (b) => {
    const tabs =
      (b.props.tabs as Array<{ label: string; content: string }>) || [];
    const style = inlineStyle(b.styles, {});
    return `<div style="${style}" data-tabs="${escapeAttr(b.id || 'tabs')}">
      <div style="display:flex;gap:0;border-bottom:2px solid #e2e8f0">
        ${tabs.map((t, i) => `<button style="padding:0.5rem 1rem;font-weight:500;border:none;background:transparent;cursor:pointer;${i === 0 ? 'border-bottom:2px solid #0f172a;margin-bottom:-2px;color:#0f172a' : 'color:#94a3b8'}" data-tab="${i}">${t.label}</button>`).join('')}
      </div>
      ${tabs.map((t, i) => `<div data-tab-content="${i}" style="${i === 0 ? '' : 'display:none'};padding:1rem 0">${t.content}</div>`).join('')}
    </div>`;
  },

  carouselBlock: (b) => {
    const slides = (b.props.slides as string[]) || [];
    const autoplay = !!b.props.autoplay;
    const interval = (b.props.interval as number) ?? 5000;
    const style = inlineStyle(b.styles, {
      position: 'relative',
      overflow: 'hidden',
    });
    return `<div style="${style}"${autoplay ? ` data-autoplay="${interval}"` : ''}>
      <div style="display:flex;transition:transform 0.3s;gap:0">
        ${slides.map((s) => `<div style="min-width:100%;padding:2rem;box-sizing:border-box">${s}</div>`).join('')}
      </div>
    </div>`;
  },

  testimonialBlock: (b) => {
    const quote = (b.props.quote as string) || '';
    const author = (b.props.author as string) || '';
    const role = (b.props.role as string) || '';
    const avatar = (b.props.avatar as string) || '';
    const style = inlineStyle(b.styles, {
      padding: '1.5rem',
      borderRadius: '8px',
      backgroundColor: '#f8fafc',
    });
    return `<div style="${style}">
      <blockquote style="margin:0 0 1rem;font-style:italic;color:#334155">"${quote}"</blockquote>
      <div style="display:flex;align-items:center;gap:0.75rem">
        ${avatar ? `<img src="${escapeAttr(avatar)}" alt="" style="width:40px;height:40px;border-radius:50%;object-fit:cover" />` : ''}
        <div><div style="font-weight:600">${author}</div>${role ? `<div style="font-size:0.875rem;color:#64748b">${role}</div>` : ''}</div>
      </div>
    </div>`;
  },

  pricingBlock: (b) => {
    const name = (b.props.name as string) || 'Plan';
    const price = (b.props.price as string) || '$0';
    const period = (b.props.period as string) || '/mo';
    const features = (b.props.features as string[]) || [];
    const featured = !!b.props.featured;
    const cta = (b.props.cta as string) || 'Get Started';
    const style = inlineStyle(b.styles, {
      padding: '1.5rem',
      borderRadius: '8px',
      border: featured ? '2px solid #0f172a' : '1px solid #e2e8f0',
      backgroundColor: featured ? '#f8fafc' : '#fff',
      textAlign: 'center' as const,
    });
    return `<div style="${style}">
      <div style="font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;margin-bottom:0.5rem">${name}</div>
      <div style="font-size:2.5rem;font-weight:800;margin-bottom:0.25rem">${price}<span style="font-size:0.875rem;font-weight:400;color:#64748b">${period}</span></div>
      <ul style="list-style:none;padding:0;margin:1rem 0;text-align:left">${features.map((f) => `<li style="padding:0.25rem 0">&check; ${f}</li>`).join('')}</ul>
      <a href="#" style="display:block;padding:0.75rem;background-color:#0f172a;color:#fff;border-radius:6px;text-decoration:none;font-weight:500">${cta}</a>
    </div>`;
  },

  faqBlock: (b) => {
    const items =
      (b.props.items as Array<{ question: string; answer: string }>) || [];
    const style = inlineStyle(b.styles, { borderTop: '1px solid #e2e8f0' });
    return `<div style="${style}">${items
      .map(
        (item) => `
      <details style="border-bottom:1px solid #e2e8f0;padding:0.75rem 0">
        <summary style="font-weight:600;cursor:pointer;margin-bottom:0.25rem">${item.question}</summary>
        <div style="color:#64748b">${item.answer}</div>
      </details>`
      )
      .join('')}</div>`;
  },

  listBlock: (b) => {
    const items = (b.props.items as string[]) || [];
    const ordered = !!b.props.ordered;
    const tag = ordered ? 'ol' : 'ul';
    const style = inlineStyle(b.styles, {
      paddingLeft: '1.5rem',
      margin: '0.5rem 0',
    });
    return `<${tag} style="${style}">${items.map((item) => `<li style="margin-bottom:0.25rem">${item}</li>`).join('')}</${tag}>`;
  },

  codeBlock: (b) => {
    const code = (b.props.code as string) || '';
    const language = (b.props.language as string) || '';
    const style = inlineStyle(b.styles, {});
    return `<pre style="background:#1e293b;color:#e2e8f0;padding:1rem;border-radius:6px;overflow-x:auto;font-size:0.875rem"><code${language ? ` class="language-${escapeAttr(language)}"` : ''}>${escapeHtml(code)}</code></pre>`;
  },

  customHtmlBlock: (b) => {
    const html = (b.props.html as string) || '';
    return html;
  },
};

function renderUnknownBlock(b: {
  props: Record<string, unknown>;
  blockType: string;
  id?: string;
}): string {
  return `<div data-block-id="${b.id || ''}" data-block-type="${b.blockType}" style="padding:1rem;border:1px dashed #cbd5e1;border-radius:4px;color:#94a3b8;font-size:0.875rem;text-align:center">${b.blockType}</div>`;
}

function renderLucideIcon(name: string, size: number, color: string): string {
  const svgSize = 24;
  const scale = size / svgSize;
  const paths: Record<string, string> = {
    circle: '<circle cx="12" cy="12" r="10"/>',
    heart:
      '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    arrowRight:
      '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    phone:
      '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    globe:
      '<circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  };
  const d = paths[name] || paths.circle;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle">${d}</svg>`;
}

function inlineStyle(
  styles?: Record<string, unknown>,
  defaults?: Record<string, string>
): string {
  const s = { ...defaults, ...styles };
  return Object.entries(s)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${camelToKebab(k)}:${v}`)
    .join(';');
}

function camelToKebab(s: string): string {
  return s.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
