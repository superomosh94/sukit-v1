interface FaqItem {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  slug: string;
  order: number;
  status: string;
  helpful: number;
  notHelpful: number;
}
interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
}
const faqs: FaqItem[] = [];
const cats: FaqCategory[] = [];
let nid = 1;
export class FaqController {
  async listCategories() {
    return cats;
  }
  async createCategory(data: any) {
    const c: FaqCategory = {
      id: String(nid++),
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
      order: data.order || 0,
    };
    cats.push(c);
    return c;
  }
  async listFaqs(categoryId?: string) {
    return categoryId ? faqs.filter((f) => f.categoryId === categoryId) : faqs;
  }
  async createFaq(data: any) {
    const f: FaqItem = {
      id: String(nid++),
      categoryId: data.categoryId,
      question: data.question,
      answer: data.answer,
      slug:
        data.slug ||
        data.question.toLowerCase().replace(/\s+/g, '-').slice(0, 50),
      order: data.order || 0,
      status: data.status || 'PUBLISHED',
      helpful: 0,
      notHelpful: 0,
    };
    faqs.push(f);
    return f;
  }
  async vote(id: string, type: 'helpful' | 'notHelpful') {
    const f = faqs.find((x) => x.id === id);
    if (!f) throw new Error('FAQ not found');
    if (type === 'helpful') f.helpful++;
    else f.notHelpful++;
    return f;
  }
  async search(query: string) {
    const q = query.toLowerCase();
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    );
  }
  async getAnalytics() {
    return {
      total: faqs.length,
      published: faqs.filter((f) => f.status === 'PUBLISHED').length,
      categories: cats.length,
      mostHelpful: [...faqs].sort((a, b) => b.helpful - a.helpful).slice(0, 5),
    };
  }
}
