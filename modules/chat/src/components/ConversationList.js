'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Search, MessageSquare, CheckCircle, Clock, User } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { cn } from '../utils/cn';
export function ConversationList({ onSelect, className, }) {
    const conversations = useChatStore((s) => s.conversations);
    const setConversations = useChatStore((s) => s.setConversations);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const params = new URLSearchParams();
                if (filter !== 'all')
                    params.set('status', filter);
                if (search)
                    params.set('search', search);
                const res = await fetch(`/api/chat/conversations?${params}`);
                const data = await res.json();
                setConversations(data.conversations ?? []);
            }
            catch { }
            setLoading(false);
        };
        fetchConversations();
        const interval = setInterval(fetchConversations, 15000);
        return () => clearInterval(interval);
    }, [filter, search]);
    const filtered = conversations.filter((c) => !search ||
        c.userName.toLowerCase().includes(search.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(search.toLowerCase()));
    return (_jsxs("div", { className: cn('flex h-full flex-col', className), children: [_jsx("div", { className: "border-b px-3 py-2", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-2.5 top-2 size-3.5 text-muted-foreground" }), _jsx("input", { type: "text", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search conversations...", className: "h-8 w-full rounded-md border bg-background pl-8 pr-3 text-xs" })] }) }), _jsx("div", { className: "flex gap-1 border-b px-3 py-2", children: ['all', 'active', 'waiting', 'resolved'].map((s) => (_jsx("button", { onClick: () => setFilter(s), className: cn('rounded-md px-2.5 py-1 text-[10px] font-medium capitalize transition-colors', filter === s
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'), children: s }, s))) }), _jsx("div", { className: "flex-1 overflow-y-auto", children: loading ? (_jsx("div", { className: "p-4 text-center text-sm text-muted-foreground", children: "Loading..." })) : filtered.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center gap-2 py-8 text-muted-foreground", children: [_jsx(MessageSquare, { className: "size-8" }), _jsx("p", { className: "text-sm", children: "No conversations" })] })) : (_jsx("div", { className: "divide-y", children: filtered.map((conv) => (_jsxs("button", { onClick: () => onSelect?.(conv.id), className: "flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-accent transition-colors", children: [_jsx("div", { className: "flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary", children: conv.userName?.charAt(0)?.toUpperCase() ?? 'U' }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium truncate", children: conv.userName }), _jsx("span", { className: "shrink-0 text-[10px] text-muted-foreground", children: new Date(conv.updatedAt).toLocaleDateString() })] }), _jsx("p", { className: "mt-0.5 truncate text-xs text-muted-foreground", children: conv.lastMessage }), _jsxs("div", { className: "mt-1 flex items-center gap-2", children: [_jsxs("span", { className: cn('inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]', conv.status === 'active' &&
                                                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', conv.status === 'waiting' &&
                                                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', conv.status === 'resolved' &&
                                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'), children: [conv.status === 'active' && (_jsx(MessageSquare, { className: "size-2.5" })), conv.status === 'waiting' && (_jsx(Clock, { className: "size-2.5" })), conv.status === 'resolved' && (_jsx(CheckCircle, { className: "size-2.5" })), conv.status] }), _jsxs("span", { className: "text-[10px] text-muted-foreground", children: [conv.messageCount, " messages"] }), conv.assignedTo && (_jsxs("span", { className: "flex items-center gap-1 text-[10px] text-muted-foreground", children: [_jsx(User, { className: "size-2.5" }), conv.assignedTo] }))] })] })] }, conv.id))) })) })] }));
}
//# sourceMappingURL=ConversationList.js.map