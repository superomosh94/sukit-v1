interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  highlighted: boolean;
  ctaText: string;
  ctaUrl: string;
  active: boolean;
  currency: string;
  createdAt: Date;
}
const plans: PricingPlan[] = [];
let nid = 1;
export class PricingController {
  async list(active?: boolean) {
    return active ? plans.filter((p) => p.active) : plans;
  }
  async create(data: any) {
    const p: PricingPlan = {
      id: String(nid++),
      name: data.name,
      description: data.description,
      monthlyPrice: data.monthlyPrice || 0,
      yearlyPrice: data.yearlyPrice || 0,
      features: data.features || [],
      highlighted: data.highlighted || false,
      ctaText: data.ctaText || 'Get Started',
      ctaUrl: data.ctaUrl || '#',
      active: data.active !== false,
      currency: data.currency || 'USD',
      createdAt: new Date(),
    };
    plans.push(p);
    return p;
  }
  async update(id: string, data: any) {
    const idx = plans.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error('Plan not found');
    Object.assign(plans[idx], data);
    return plans[idx];
  }
  async delete(id: string) {
    const idx = plans.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error('Plan not found');
    plans.splice(idx, 1);
    return { success: true };
  }
}
