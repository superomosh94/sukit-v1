interface TestimonialItem {
  id: string;
  name: string;
  title?: string;
  company?: string;
  avatar?: string;
  companyLogo?: string;
  content: string;
  rating: number;
  featured: boolean;
  status: string;
  createdAt: Date;
}
const items: TestimonialItem[] = [];
let nid = 1;
export class TestimonialController {
  async list(featured?: boolean) {
    return featured ? items.filter((t) => t.featured) : items;
  }
  async create(data: any) {
    const t: TestimonialItem = {
      id: String(nid++),
      name: data.name,
      title: data.title,
      company: data.company,
      avatar: data.avatar,
      companyLogo: data.companyLogo,
      content: data.content,
      rating: data.rating || 5,
      featured: data.featured || false,
      status: data.status || 'APPROVED',
      createdAt: new Date(),
    };
    items.push(t);
    return t;
  }
  async delete(id: string) {
    const idx = items.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error('Testimonial not found');
    items.splice(idx, 1);
    return { success: true };
  }
  async toggleFeatured(id: string) {
    const t = items.find((x) => x.id === id);
    if (!t) throw new Error('Testimonial not found');
    t.featured = !t.featured;
    return t;
  }
}
