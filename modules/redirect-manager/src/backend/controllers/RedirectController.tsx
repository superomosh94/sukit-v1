interface RedirectItem {
  id: string;
  source: string;
  target: string;
  type: number;
  pattern: 'exact' | 'wildcard' | 'regex';
  active: boolean;
  hits: number;
  createdAt: Date;
}
interface Four04Log {
  id: string;
  url: string;
  referer?: string;
  timestamp: Date;
}
const redirects: RedirectItem[] = [];
const logs404: Four04Log[] = [];
let nid = 1;
export class RedirectController {
  async list() {
    return redirects;
  }
  async create(data: any) {
    const r: RedirectItem = {
      id: String(nid++),
      source: data.source,
      target: data.target,
      type: data.type || 301,
      pattern: data.pattern || 'exact',
      active: data.active !== false,
      hits: 0,
      createdAt: new Date(),
    };
    redirects.push(r);
    return r;
  }
  async update(id: string, data: any) {
    const idx = redirects.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error('Redirect not found');
    Object.assign(redirects[idx], data);
    return redirects[idx];
  }
  async delete(id: string) {
    const idx = redirects.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error('Redirect not found');
    redirects.splice(idx, 1);
    return { success: true };
  }
  async test(source: string) {
    const r = redirects.find((x) => x.source === source);
    if (!r) return { found: false };
    return { found: true, redirect: r };
  }
  async log404(url: string, referer?: string) {
    const l: Four04Log = {
      id: String(nid++),
      url,
      referer,
      timestamp: new Date(),
    };
    logs404.push(l);
    return l;
  }
  async get404Logs() {
    return [...logs404]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 100);
  }
  async importBulk(items: any[]) {
    const created = items.map((i) => {
      const r: RedirectItem = {
        id: String(nid++),
        source: i.source,
        target: i.target,
        type: i.type || 301,
        pattern: i.pattern || 'exact',
        active: i.active !== false,
        hits: 0,
        createdAt: new Date(),
      };
      return r;
    });
    redirects.push(...created);
    return { count: created.length };
  }
}
