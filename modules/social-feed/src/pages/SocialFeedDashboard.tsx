import { useEffect, useState } from 'react';
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Trash2,
  Eye,
} from 'lucide-react';
import { socialFeedApi } from '../services/api';
import { cn } from '../utils/cn';
const pIcons: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
};
export function SocialFeedDashboard() {
  const [posts, setP] = useState<any[]>([]);
  const [filter, setF] = useState('');
  const [l, setL] = useState(true);
  useEffect(() => {
    load();
  }, []);
  const load = async () => {
    setL(true);
    setP(await socialFeedApi.list(filter || undefined));
    setL(false);
  };
  useEffect(() => {
    if (posts.length) load();
  }, [filter]);
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Social Feed</h1>
          <p className="text-gray-500 text-sm">
            Aggregate and display social media content
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {['', 'instagram', 'facebook', 'twitter', 'youtube', 'linkedin'].map(
          (p) => {
            const Icon = pIcons[p] || Eye;
            return (
              <button
                key={p}
                onClick={() => setF(p)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border',
                  !filter && !p
                    ? 'bg-blue-50 border-blue-500 text-blue-600'
                    : filter === p
                      ? 'bg-blue-50 border-blue-500 text-blue-600'
                      : 'hover:border-gray-300'
                )}
              >
                <Icon className="w-3 h-3" />
                {p || 'All'}
              </button>
            );
          }
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden"
          >
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs font-bold">{p.authorName?.[0]}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">{p.authorName}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    on {p.platform}
                  </span>
                </div>
              </div>
              <p className="text-sm mb-2">{p.content?.slice(0, 150)}</p>
              {p.imageUrl && (
                <div
                  className="h-40 bg-gray-100 rounded mb-2"
                  style={{
                    backgroundImage: `url(${p.imageUrl})`,
                    backgroundSize: 'cover',
                  }}
                />
              )}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>❤️{p.likes}</span>
                <span>⟳{p.shares}</span>
                <span>{new Date(p.postedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
