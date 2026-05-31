type ShortcodeHandler = (
  attrs: Record<string, string>,
  content?: string
) => string;
const registry = new Map<string, ShortcodeHandler>();

export function registerShortcode(tag: string, handler: ShortcodeHandler) {
  registry.set(tag, handler);
}

export function parseShortcodes(input: string): string {
  return input.replace(
    /\[(\w+)([^\]]*)\]([\s\S]*?)\[\/\1\]|\[(\w+)([^\]]*)\]/g,
    (match, tag1, attrs1, content, tag2, attrs2) => {
      const tag = tag1 || tag2;
      const attrStr = (attrs1 || attrs2 || '').trim();
      const inner = content || '';
      if (!tag) return match;

      const attrs: Record<string, string> = {};
      const attrRegex =
        /(\w+)\s*=\s*"([^"]*)"|(\w+)\s*=\s*'([^']*)'|(\w+)\s*=\s*(\S+)|(\w+)/g;
      let m;
      while ((m = attrRegex.exec(attrStr)) !== null) {
        const key = m[1] || m[3] || m[5] || m[7];
        const val = m[2] || m[4] || m[6] || 'true';
        if (key) attrs[key] = val;
      }

      const handler = registry.get(tag);
      if (handler) return handler(attrs, inner);
      return match;
    }
  );
}

export function renderShortcodes(input: string): string {
  return parseShortcodes(input);
}

// Built-in shortcodes
registerShortcode('year', () => new Date().getFullYear().toString());

registerShortcode('date', (attrs) => {
  const format = attrs.format || 'YYYY';
  const d = new Date();
  return format
    .replace('YYYY', d.getFullYear().toString())
    .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
    .replace('DD', String(d.getDate()).padStart(2, '0'));
});

registerShortcode('site_url', () => '/');

registerShortcode('gallery', (attrs, content) => {
  const ids = (attrs.ids || content || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const cols = parseInt(attrs.columns || '3');
  const size = attrs.size || '150px';
  if (ids.length === 0) return '';
  const items = ids
    .map(
      (id) =>
        `<img src="/api/media/${id}" alt="" style="width:${size};height:${size};object-fit:cover;border-radius:4px" />`
    )
    .join('');
  return `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px">${items}</div>`;
});

registerShortcode('button', (attrs, content) => {
  const href = attrs.href || '#';
  const text = content || attrs.text || 'Button';
  const style = attrs.style || 'primary';
  const variants: Record<string, string> = {
    primary: '#0f172a;color:#fff',
    secondary: '#e2e8f0;color:#0f172a',
    outline: 'transparent;color:#0f172a;border:1px solid #0f172a',
  };
  return `<a href="${escAttr(href)}" style="display:inline-flex;padding:0.5rem 1rem;border-radius:6px;font-weight:500;text-decoration:none;background-color:${variants[style] || variants.primary}">${escHtml(text)}</a>`;
});

registerShortcode('video', (attrs) => {
  const src = attrs.src || '';
  if (!src) return '';
  if (src.includes('youtube.com') || src.includes('youtu.be')) {
    const id = src.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1] || '';
    if (!id) return '';
    return `<iframe src="https://www.youtube.com/embed/${id}" style="width:100%;aspect-ratio:16/9;border:0;border-radius:8px" allowfullscreen loading="lazy"></iframe>`;
  }
  if (src.includes('vimeo.com')) {
    const id = src.match(/vimeo\.com\/(\d+)/)?.[1] || '';
    if (!id) return '';
    return `<iframe src="https://player.vimeo.com/video/${id}" style="width:100%;aspect-ratio:16/9;border:0;border-radius:8px" allowfullscreen loading="lazy"></iframe>`;
  }
  return `<video controls style="max-width:100%;border-radius:8px"><source src="${escAttr(src)}" /></video>`;
});

registerShortcode('audio', (attrs) => {
  const src = attrs.src || '';
  if (!src) return '';
  return `<audio controls style="width:100%"><source src="${escAttr(src)}" /></audio>`;
});

registerShortcode('embed', (attrs) => {
  const url = attrs.url || '';
  if (!url) return '';
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return `<blockquote class="twitter-tweet"><a href="${escAttr(url)}">${escHtml(url)}</a></blockquote>`;
  }
  return `<iframe src="${escAttr(url)}" style="width:100%;min-height:300px;border:0;border-radius:8px" loading="lazy"></iframe>`;
});

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
