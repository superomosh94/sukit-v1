import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
interface Props {
  posts: Array<{
    id: string;
    content: string;
    imageUrl?: string;
    authorName: string;
  }>;
}
export function SocialFeedCarousel({ posts }: Props) {
  const [i, setI] = useState(0);
  if (!posts.length) return null;
  const p = posts[i];
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
      <div className="p-6 text-center">
        <p className="text-lg mb-2">"{p.content}"</p>
        <p className="text-sm text-gray-500">- {p.authorName}</p>
      </div>
      {i > 0 && (
        <button
          onClick={() => setI(i - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 rounded-full"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      {i < posts.length - 1 && (
        <button
          onClick={() => setI(i + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 rounded-full"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
