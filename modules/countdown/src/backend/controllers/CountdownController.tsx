interface CountdownItem {
  id: string;
  name: string;
  targetDate: Date;
  evergreen: boolean;
  evergreenDuration?: number;
  layout: string;
  completedAction: string;
  completedValue?: string;
  active: boolean;
  views: number;
  conversions: number;
  createdAt: Date;
}
const items: CountdownItem[] = [];
let nid = 1;
export class CountdownController {
  async list() {
    return items;
  }
  async create(data: any) {
    const c: CountdownItem = {
      id: String(nid++),
      name: data.name,
      targetDate: new Date(data.targetDate),
      evergreen: data.evergreen || false,
      evergreenDuration: data.evergreenDuration,
      layout: data.layout || 'default',
      completedAction: data.completedAction || 'none',
      completedValue: data.completedValue,
      active: data.active !== false,
      views: 0,
      conversions: 0,
      createdAt: new Date(),
    };
    items.push(c);
    return c;
  }
  async update(id: string, data: any) {
    const idx = items.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error('Countdown not found');
    Object.assign(items[idx], data);
    return items[idx];
  }
  async delete(id: string) {
    const idx = items.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error('Countdown not found');
    items.splice(idx, 1);
    return { success: true };
  }
  async trackView(id: string) {
    const c = items.find((x) => x.id === id);
    if (!c) throw new Error('Countdown not found');
    c.views++;
    return c;
  }
  async trackConversion(id: string) {
    const c = items.find((x) => x.id === id);
    if (!c) throw new Error('Countdown not found');
    c.conversions++;
    return c;
  }
  async getAnalytics() {
    const totalViews = items.reduce((s, c) => s + c.views, 0);
    const totalConversions = items.reduce((s, c) => s + c.conversions, 0);
    return {
      total: items.length,
      active: items.filter((c) => c.active).length,
      totalViews,
      totalConversions,
    };
  }
}
