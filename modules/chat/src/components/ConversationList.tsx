'use client';

import { useEffect, useState } from 'react';
import { Search, MessageSquare, CheckCircle, Clock, User } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { cn } from '../utils/cn';

interface ConversationListProps {
  onSelect?: (conversationId: string) => void;
  className?: string;
}

export function ConversationList({
  onSelect,
  className,
}: ConversationListProps) {
  const conversations = useChatStore((s) => s.conversations);
  const setConversations = useChatStore((s) => s.setConversations);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<
    'all' | 'active' | 'resolved' | 'waiting'
  >('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const params = new URLSearchParams();
        if (filter !== 'all') params.set('status', filter);
        if (search) params.set('search', search);
        const res = await fetch(`/api/chat/conversations?${params}`);
        const data = await res.json();
        setConversations(data.conversations ?? []);
      } catch {}
      setLoading(false);
    };
    fetchConversations();
    const interval = setInterval(fetchConversations, 15000);
    return () => clearInterval(interval);
  }, [filter, search]);

  const filtered = conversations.filter(
    (c) =>
      !search ||
      c.userName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="border-b px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="h-8 w-full rounded-md border bg-background pl-8 pr-3 text-xs"
          />
        </div>
      </div>

      <div className="flex gap-1 border-b px-3 py-2">
        {(['all', 'active', 'waiting', 'resolved'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'rounded-md px-2.5 py-1 text-[10px] font-medium capitalize transition-colors',
              filter === s
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <MessageSquare className="size-8" />
            <p className="text-sm">No conversations</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect?.(conv.id)}
                className="flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-accent transition-colors"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {conv.userName?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {conv.userName}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {conv.lastMessage}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]',
                        conv.status === 'active' &&
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                        conv.status === 'waiting' &&
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                        conv.status === 'resolved' &&
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      )}
                    >
                      {conv.status === 'active' && (
                        <MessageSquare className="size-2.5" />
                      )}
                      {conv.status === 'waiting' && (
                        <Clock className="size-2.5" />
                      )}
                      {conv.status === 'resolved' && (
                        <CheckCircle className="size-2.5" />
                      )}
                      {conv.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {conv.messageCount} messages
                    </span>
                    {conv.assignedTo && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <User className="size-2.5" />
                        {conv.assignedTo}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
