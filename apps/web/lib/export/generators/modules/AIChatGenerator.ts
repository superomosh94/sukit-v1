import type {
  ModuleGenerator,
  ModuleGeneratorContext,
} from './ModuleGenerator';

export class AIChatGenerator implements ModuleGenerator {
  readonly moduleId = 'chat';
  readonly moduleName = 'AI Chat';
  constructor(private ctx: ModuleGeneratorContext) {}

  generateBackendRoutes(): string {
    return `export const chatRouter = Router();

chatRouter.post('/message', async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;
    const aiResponse = "I'm an AI assistant. I can help answer questions about this site.";
    const conv = conversationId
      ? await prisma.chatConversation.update({
          where: { id: conversationId },
          data: { messages: { push: [{ role: 'user', content: message }, { role: 'assistant', content: aiResponse }] } },
        })
      : await prisma.chatConversation.create({
          data: { sessionId: req.headers['x-session-id'] as string || 'anonymous', messages: [{ role: 'user', content: message }, { role: 'assistant', content: aiResponse }] },
        });
    res.json({ reply: aiResponse, conversationId: conv.id });
  } catch (err) { next(err); }
});

chatRouter.get('/conversations', async (req, res, next) => {
  try {
    const conversations = await prisma.chatConversation.findMany({
      where: { sessionId: req.query.sessionId as string },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
    res.json(conversations);
  } catch (err) { next(err); }
});`;
  }

  generatePrismaModels(): string {
    return `model ChatConversation {
  id        String   @id @default(cuid())
  sessionId String
  messages  Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;
  }

  generateFrontendComponents(): Array<{ path: string; content: string }> {
    return [
      {
        path: 'ChatWidget.tsx',
        content: `import React, { useState, useRef, useEffect } from 'react';
import api from '../../lib/api';

interface Message { role: 'user' | 'assistant'; content: string; }

export const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post<{ reply: string; conversationId: string }>('/chat/message', { message: input, conversationId: convId });
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
      setConvId(res.conversationId);
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]); }
    setLoading(false);
  };

  if (!open) return <button onClick={() => setOpen(true)} className="fixed bottom-4 right-4 w-12 h-12 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 flex items-center justify-center text-xl">💬</button>;

  return <div className="fixed bottom-4 right-4 w-80 h-96 bg-white border rounded-lg shadow-xl flex flex-col">
    <div className="flex items-center justify-between p-3 border-b">
      <span className="font-semibold">Chat</span>
      <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
    </div>
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {messages.map((msg, i) => (
        <div key={i} className={\`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
          <div className={\`max-w-[80%] p-2 rounded-lg text-sm \${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}\`}>{msg.content}</div>
        </div>
      ))}
      {loading && <div className="text-gray-400 text-sm animate-pulse">Thinking...</div>}
      <div ref={endRef} />
    </div>
    <div className="p-3 border-t flex gap-2">
      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message..." className="flex-1 p-2 border rounded-md text-sm" />
      <button onClick={send} disabled={loading} className="px-3 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800 disabled:opacity-50">Send</button>
    </div>
  </div>;
};`,
      },
    ];
  }
}
