'use client'

import { useState, useRef, useEffect } from 'react'
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatWidgetProps {
  settings?: {
    theme?: {
      primaryColor?: string
      position?: 'left' | 'right'
    }
    welcomeMessage?: string
    model?: string
  }
}

function renderMarkdown(text: string): string {
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
}

export default function ChatWidget({ settings }: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        settings?.welcomeMessage ||
        'Hi! I can help you build your site. What would you like to know?',
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const handleSend = async () => {
    if (!input.trim() || typing) return

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const response: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Here's what I found about "${userMsg.content}"...\n\nI can help you with:\n- Adding and editing sections\n- Customizing styles\n- Managing pages\n- Setting up SEO\n\nWhat would you like to try?`,
      }
      setMessages((prev) => [...prev, response])
      setTyping(false)
    }, 1500)
  }

  const position = settings?.theme?.position || 'right'
  const primaryColor = settings?.theme?.primaryColor || 'hsl(var(--primary))'

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'fixed bottom-6 z-50 flex size-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105',
            position === 'left' ? 'left-6' : 'right-6',
          )}
          style={{ backgroundColor: primaryColor }}
        >
          <MessageCircle className="size-6 text-white" />
        </button>
      )}

      {open && (
        <div
          className={cn(
            'fixed bottom-6 z-50 flex w-80 flex-col rounded-xl border bg-card shadow-2xl',
            position === 'left' ? 'left-6' : 'right-6',
          )}
          style={{ height: '500px' }}
        >
          <div
            className="flex items-center justify-between rounded-t-xl px-4 py-3 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-2">
              <Bot className="size-5" />
              <span className="text-sm font-medium">AI Assistant</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 hover:bg-white/20"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-2',
                  msg.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="size-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted',
                  )}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(msg.content),
                    }}
                    className="prose prose-sm dark:prose-invert max-w-none"
                  />
                </div>
                {msg.role === 'user' && (
                  <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="size-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div className="flex gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="size-3.5 text-primary" />
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-2">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || typing}
                className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
