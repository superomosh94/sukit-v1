interface SocialPost {
  id: string;
  platform: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  authorName: string;
  authorAvatar?: string;
  postUrl: string;
  likes: number;
  shares: number;
  postedAt: Date;
  moderated: boolean;
}
const posts: SocialPost[] = [];
let nid = 1;
export class SocialFeedController {
  async list(platform?: string) {
    return platform ? posts.filter((p) => p.platform === platform) : posts;
  }
  async create(data: any) {
    const p: SocialPost = {
      id: String(nid++),
      platform: data.platform || 'custom',
      content: data.content,
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      authorName: data.authorName || 'User',
      authorAvatar: data.authorAvatar,
      postUrl: data.postUrl || '',
      likes: data.likes || 0,
      shares: data.shares || 0,
      postedAt: new Date(data.postedAt || Date.now()),
      moderated: false,
    };
    posts.push(p);
    return p;
  }
  async delete(id: string) {
    const idx = posts.findIndex((x) => x.id === id);
    if (idx === -1) throw new Error('Post not found');
    posts.splice(idx, 1);
    return { success: true };
  }
  async toggleModeration(id: string) {
    const p = posts.find((x) => x.id === id);
    if (!p) throw new Error('Post not found');
    p.moderated = !p.moderated;
    return p;
  }
}
