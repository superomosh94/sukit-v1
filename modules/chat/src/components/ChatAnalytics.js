'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { MessageSquare, Smile, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { cn } from '../utils/cn';
export function ChatAnalytics({ className }) {
    const analytics = useChatStore((s) => s.analytics);
    const setAnalytics = useChatStore((s) => s.setAnalytics);
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/chat/analytics');
                const data = await res.json();
                setAnalytics(data);
            }
            catch { }
        };
        fetchAnalytics();
    }, []);
    if (!analytics) {
        return (_jsx("div", { className: cn('rounded-lg border bg-card p-6', className), children: _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading analytics..." }) }));
    }
    const stats = [
        { label: 'Conversations', value: analytics.conversationCount, icon: MessageSquare, color: 'text-blue-500' },
        { label: 'Satisfaction Rate', value: `${(analytics.satisfactionRate * 100).toFixed(0)}%`, icon: Smile, color: 'text-green-500' },
        { label: 'Avg Response Time', value: `${analytics.avgResponseTime}s`, icon: Clock, color: 'text-amber-500' },
        { label: 'Total Messages', value: analytics.totalMessages, icon: TrendingUp, color: 'text-purple-500' },
    ];
    return (_jsxs("div", { className: cn('space-y-6', className), children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "size-5 text-muted-foreground" }), _jsx("h2", { className: "text-lg font-semibold", children: "Chat Analytics" })] }), _jsx("div", { className: "grid grid-cols-4 gap-4", children: stats.map((stat) => (_jsxs("div", { className: "rounded-lg border bg-card p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-xs text-muted-foreground", children: stat.label }), _jsx(stat.icon, { className: cn('size-4', stat.color) })] }), _jsx("p", { className: "text-2xl font-bold", children: stat.value })] }, stat.label))) }), _jsxs("div", { className: "rounded-lg border bg-card p-4", children: [_jsx("h3", { className: "text-sm font-medium mb-3", children: "Top Questions" }), analytics.topQuestions.length === 0 ? (_jsx("p", { className: "text-xs text-muted-foreground", children: "No data yet" })) : (_jsx("div", { className: "space-y-2", children: analytics.topQuestions.map((q, i) => (_jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsx("span", { className: "flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium", children: i + 1 }), _jsx("span", { className: "flex-1 truncate", children: q.question }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [q.count, " times"] })] }, i))) }))] })] }));
}
//# sourceMappingURL=ChatAnalytics.js.map