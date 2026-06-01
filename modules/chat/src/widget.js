import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { handleMessageStream, handleUpload } from './api';
const DEFAULT_MODELS = [
    { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
    { label: 'GPT-4o', value: 'gpt-4o' },
    { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
    { label: 'Claude 3 Opus', value: 'claude-3-opus' },
    { label: 'Claude 3 Sonnet', value: 'claude-3-sonnet' },
];
export function ChatWidget({ apiKey, model = 'gpt-4-turbo', welcomeMessage = 'Hello! How can I help you today?', theme = 'light', position = 'bottom-right', availableModels = DEFAULT_MODELS, }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            chatId: 'widget',
            role: 'assistant',
            content: welcomeMessage,
            createdAt: Date.now(),
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [streamContent, setStreamContent] = useState('');
    const [selectedModel, setSelectedModel] = useState(model);
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamContent]);
    const handleSend = useCallback(async () => {
        if (!input.trim() || loading)
            return;
        const userMsg = {
            id: crypto.randomUUID(),
            chatId: 'widget',
            role: 'user',
            content: input,
            createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        setStreamContent('');
        const assistantId = crypto.randomUUID();
        const assistantMsg = {
            id: assistantId,
            chatId: 'widget',
            role: 'assistant',
            content: '',
            model: selectedModel,
            createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        const config = {
            provider: selectedModel.startsWith('claude') ? 'anthropic' : 'openai',
            model: selectedModel,
            temperature: 0.7,
            maxTokens: 2048,
            topP: 1,
            stream: true,
            apiKey,
        };
        try {
            const displayMessages = messages.filter((m) => m.id !== 'welcome');
            const { content, usage } = await handleMessageStream(displayMessages, userMsg.content, config, (chunk) => {
                setStreamContent((prev) => prev + chunk);
            });
            const finalMsg = {
                id: assistantId,
                chatId: 'widget',
                role: 'assistant',
                content,
                model: selectedModel,
                usage,
                createdAt: Date.now(),
            };
            setMessages((prev) => {
                const updated = [...prev];
                const idx = updated.findIndex((m) => m.id === assistantId);
                if (idx >= 0)
                    updated[idx] = finalMsg;
                return updated;
            });
            setStreamContent('');
        }
        catch {
            const errorMsg = {
                id: assistantId,
                chatId: 'widget',
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                createdAt: Date.now(),
            };
            setMessages((prev) => {
                const updated = [...prev];
                const idx = updated.findIndex((m) => m.id === assistantId);
                if (idx >= 0)
                    updated[idx] = errorMsg;
                return updated;
            });
            setStreamContent('');
        }
        finally {
            setLoading(false);
        }
    }, [input, loading, messages, selectedModel, apiKey]);
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const result = await handleUpload(file);
        const fileMsg = {
            id: crypto.randomUUID(),
            chatId: 'widget',
            role: 'user',
            content: `[Uploaded file: ${result.filename}]\n\n${result.content.slice(0, 2000)}`,
            createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, fileMsg]);
        if (fileInputRef.current)
            fileInputRef.current.value = '';
    };
    const clearConversation = () => {
        setMessages([
            {
                id: 'welcome',
                chatId: 'widget',
                role: 'assistant',
                content: welcomeMessage,
                createdAt: Date.now(),
            },
        ]);
        setStreamContent('');
    };
    const positionStyle = position === 'bottom-left'
        ? { bottom: '20px', left: '20px' }
        : { bottom: '20px', right: '20px' };
    const bgColor = theme === 'dark' ? '#1F2937' : '#FFFFFF';
    const textColor = theme === 'dark' ? '#F9FAFB' : '#111827';
    const borderColor = theme === 'dark' ? '#374151' : '#E5E7EB';
    const inputBg = theme === 'dark' ? '#374151' : '#FFFFFF';
    const inputBorder = theme === 'dark' ? '#4B5563' : '#D1D5DB';
    const bubbleUser = '#3B82F6';
    const bubbleAssistant = theme === 'dark' ? '#374151' : '#F3F4F6';
    const bubbleAssistantText = theme === 'dark' ? '#F9FAFB' : '#111827';
    return (_jsxs("div", { style: { position: 'fixed', zIndex: 9999, ...positionStyle }, children: [isOpen && (_jsxs("div", { style: {
                    width: '380px',
                    height: '520px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: bgColor,
                    color: textColor,
                    marginBottom: '10px',
                }, children: [_jsxs("div", { style: {
                            padding: '12px 16px',
                            backgroundColor: '#3B82F6',
                            color: '#FFFFFF',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }, children: [_jsx("span", { style: { fontWeight: 600 }, children: "Chat Assistant" }), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("select", { value: selectedModel, onChange: (e) => setSelectedModel(e.target.value), style: {
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            fontSize: '12px',
                                            background: 'rgba(255,255,255,0.2)',
                                            color: '#FFFFFF',
                                            cursor: 'pointer',
                                        }, children: availableModels.map((m) => (_jsx("option", { value: m.value, style: { color: '#111827' }, children: m.label }, m.value))) }), _jsx("button", { onClick: () => setShowHistory(!showHistory), style: { background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '16px' }, title: "Conversation history", children: "\u2630" }), _jsx("button", { onClick: () => setIsOpen(false), style: { background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '18px' }, children: "\u00D7" })] })] }), _jsxs("div", { style: {
                            flex: 1,
                            overflowY: 'auto',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                        }, children: [messages.map((msg) => (_jsxs("div", { style: {
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    backgroundColor: msg.role === 'user' ? bubbleUser : bubbleAssistant,
                                    color: msg.role === 'user' ? '#FFFFFF' : bubbleAssistantText,
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    maxWidth: '85%',
                                    fontSize: '14px',
                                    lineHeight: '1.4',
                                    wordBreak: 'break-word',
                                    whiteSpace: 'pre-wrap',
                                }, children: [msg.content || (msg.id === messages[messages.length - 1]?.id && loading ? '' : msg.content), msg.model && msg.role === 'assistant' && msg.content && (_jsx("div", { style: { fontSize: '10px', opacity: 0.5, marginTop: '4px' }, children: msg.model }))] }, msg.id))), loading && streamContent && (_jsxs("div", { style: {
                                    alignSelf: 'flex-start',
                                    backgroundColor: bubbleAssistant,
                                    color: bubbleAssistantText,
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    maxWidth: '85%',
                                    fontSize: '14px',
                                    lineHeight: '1.4',
                                    wordBreak: 'break-word',
                                    whiteSpace: 'pre-wrap',
                                }, children: [streamContent, _jsx("span", { style: { animation: 'pulse 1s infinite' }, children: "\u258A" })] })), loading && !streamContent && (_jsx("div", { style: { alignSelf: 'flex-start', color: '#9CA3AF', fontSize: '14px', padding: '8px' }, children: _jsx("span", { style: { animation: 'pulse 1.5s infinite' }, children: "Thinking" }) })), _jsx("div", { ref: messagesEndRef })] }), _jsxs("div", { style: {
                            padding: '12px',
                            borderTop: `1px solid ${borderColor}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                        }, children: [_jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { onClick: () => fileInputRef.current?.click(), disabled: loading, style: {
                                            padding: '8px',
                                            borderRadius: '8px',
                                            border: `1px solid ${inputBorder}`,
                                            backgroundColor: inputBg,
                                            color: textColor,
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            fontSize: '16px',
                                            lineHeight: '1',
                                        }, title: "Upload file", children: "\uD83D\uDCCE" }), _jsx("input", { ref: fileInputRef, type: "file", onChange: handleFileUpload, style: { display: 'none' }, accept: ".txt,.md,.json,.csv,.js,.ts,.jsx,.tsx,.py,.html,.css" }), _jsx("input", { value: input, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }, placeholder: "Type a message...", disabled: loading, style: {
                                            flex: 1,
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: `1px solid ${inputBorder}`,
                                            backgroundColor: inputBg,
                                            color: textColor,
                                            outline: 'none',
                                            fontSize: '14px',
                                        } }), _jsx("button", { onClick: handleSend, disabled: loading || !input.trim(), style: {
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            backgroundColor: loading ? '#93C5FD' : '#3B82F6',
                                            color: '#FFFFFF',
                                            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                        }, children: "Send" })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9CA3AF' }, children: [_jsxs("span", { children: [messages.length - 1, " message", (messages.length - 1) !== 1 ? 's' : ''] }), messages.length > 1 && (_jsx("button", { onClick: clearConversation, style: { background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }, children: "Clear" }))] })] })] })), _jsx("button", { onClick: () => setIsOpen(!isOpen), style: {
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#3B82F6',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                }, children: isOpen ? '×' : '💬' }), _jsx("style", { children: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      ` })] }));
}
//# sourceMappingURL=widget.js.map