interface StoredReview {
  id: string;
  productId: string;
  productName: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  pros: string;
  cons: string;
  images: string[];
  verified: boolean;
  status: string;
  helpful: number;
  notHelpful: number;
  createdAt: Date;
}
const store: StoredReview[] = [];
let nid = 1;
export class ReviewsController {
  async list(query?: { status?: string; productId?: string; sort?: string }) {
    let r = store;
    if (query?.status) r = r.filter((x) => x.status === query.status);
    if (query?.productId) r = r.filter((x) => x.productId === query.productId);
    if (query?.sort === 'newest')
      r = [...r].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (query?.sort === 'highest')
      r = [...r].sort((a, b) => b.rating - a.rating);
    if (query?.sort === 'lowest')
      r = [...r].sort((a, b) => a.rating - b.rating);
    return r;
  }
  async get(id: string) {
    const r = store.find((x) => x.id === id);
    if (!r) throw new Error('Review not found');
    return r;
  }
  async create(data: any) {
    const r: StoredReview = {
      id: String(nid++),
      productId: data.productId,
      productName: data.productName,
      userName: data.userName,
      rating: data.rating,
      title: data.title,
      content: data.content,
      pros: data.pros || '',
      cons: data.cons || '',
      images: data.images || [],
      verified: data.verified || false,
      status: 'PENDING',
      helpful: 0,
      notHelpful: 0,
      createdAt: new Date(),
    };
    store.push(r);
    return r;
  }
  async approve(id: string) {
    const r = store.find((x) => x.id === id);
    if (!r) throw new Error('Review not found');
    r.status = 'APPROVED';
    return r;
  }
  async reject(id: string) {
    const r = store.find((x) => x.id === id);
    if (!r) throw new Error('Review not found');
    r.status = 'REJECTED';
    return r;
  }
  async markSpam(id: string) {
    const r = store.find((x) => x.id === id);
    if (!r) throw new Error('Review not found');
    r.status = 'SPAM';
    return r;
  }
  async vote(id: string, type: 'helpful' | 'notHelpful') {
    const r = store.find((x) => x.id === id);
    if (!r) throw new Error('Review not found');
    if (type === 'helpful') r.helpful++;
    else r.notHelpful++;
    return r;
  }
  async getAggregate(productId: string) {
    const r = store.filter(
      (x) => x.productId === productId && x.status === 'APPROVED'
    );
    const avg = r.reduce((s, x) => s + x.rating, 0) / (r.length || 1);
    return {
      productId,
      averageRating: Math.round(avg * 10) / 10,
      totalReviews: r.length,
      distribution: {
        1: r.filter((x) => x.rating === 1).length,
        2: r.filter((x) => x.rating === 2).length,
        3: r.filter((x) => x.rating === 3).length,
        4: r.filter((x) => x.rating === 4).length,
        5: r.filter((x) => x.rating === 5).length,
      },
    };
  }
}
