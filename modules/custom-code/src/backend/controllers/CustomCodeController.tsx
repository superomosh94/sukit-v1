interface CodeSnippet {
  id: string;
  name: string;
  type: string;
  content: string;
  location: 'header' | 'footer';
  active: boolean;
  pageTarget: string;
  createdAt: Date;
}
const snippets: CodeSnippet[] = [];
let nid = 1;
export class CustomCodeController {
  async list() {
    return snippets;
  }
  async create(data: any) {
    const s: CodeSnippet = {
      id: String(nid++),
      name: data.name,
      type: data.type || 'js',
      content: data.content,
      location: data.location || 'header',
      active: data.active !== false,
      pageTarget: data.pageTarget || '*',
      createdAt: new Date(),
    };
    snippets.push(s);
    return s;
  }
  async update(id: string, data: any) {
    const idx = snippets.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error('Snippet not found');
    Object.assign(snippets[idx], data);
    return snippets[idx];
  }
  async delete(id: string) {
    const idx = snippets.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error('Snippet not found');
    snippets.splice(idx, 1);
    return { success: true };
  }
  async toggle(id: string) {
    const idx = snippets.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error('Snippet not found');
    snippets[idx].active = !snippets[idx].active;
    return snippets[idx];
  }
  async getActiveCode() {
    const active = snippets.filter((s) => s.active);
    return {
      header: active
        .filter((s) => s.location === 'header')
        .map((s) => ({ type: s.type, content: s.content })),
      footer: active
        .filter((s) => s.location === 'footer')
        .map((s) => ({ type: s.type, content: s.content })),
    };
  }
}
