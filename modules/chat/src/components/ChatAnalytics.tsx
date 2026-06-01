'use client';

import { useEffect } from 'react';
import {
  MessageSquare,
  Smile,
  Clock,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { cn } from '../utils/cn';

interface ChatAnalyticsProps {
  className?: string;
}

export function ChatAnalytics({ className }: ChatAnalyticsProps) {
  const analytics = useChatStore((s) => s.analytics);
  const setAnalytics = useChatStore((s) => s.setAnalytics);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/chat/analytics');
        const data = await res.json();
        setAnalytics(data);
      } catch {}
    };
    fetchAnalytics();
  }, []);

  if (!analytics) {
    return (
      <div className={cn('rounded-lg border bg-card p-6', className)}>
        <p className="text-sm text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Conversations',
      value: analytics.conversationCount,
      icon: MessageSquare,
      color: 'text-blue-500',
    },
    {
      label: 'Satisfaction Rate',
      value: `${(analytics.satisfactionRate * 100).toFixed(0)}%`,
      icon: Smile,
      color: 'text-green-500',
    },
    {
      label: 'Avg Response Time',
      value: `${analytics.avgResponseTime}s`,
      icon: Clock,
      color: 'text-amber-500',
    },
    {
      label: 'Total Messages',
      value: analytics.totalMessages,
      icon: TrendingUp,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center gap-2">
        <BarChart3 className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Chat Analytics</h2>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
              <stat.icon className={cn('size-4', stat.color)} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium mb-3">Top Questions</h3>
        {analytics.topQuestions.length === 0 ? (
          <p className="text-xs text-muted-foreground">No data yet</p>
        ) : (
          <div className="space-y-2">
            {analytics.topQuestions.map((q, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {i + 1}
                </span>
                <span className="flex-1 truncate">{q.question}</span>
                <span className="text-xs text-muted-foreground">
                  {q.count} times
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
