import { cn } from '../utils/cn';
interface Props {
  posts: Array<{
    id: string;
    platform: string;
    content: string;
    imageUrl?: string;
    authorName: string;
    likes: number;
  }>;
  columns?: 3 | 4;
}
export function SocialFeedGrid({ posts, columns = 3 }: Props) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 3 ? 'grid-cols-3' : 'grid-cols-4'
      )}
    >
      {posts.map((p) => (
        <div
          key={p.id}
          className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden"
        >
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                {p.authorName[0]}
              </div>
              <span className="text-sm font-medium">{p.authorName}</span>
            </div>
            <p className="text-sm">{p.content?.slice(0, 100)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
