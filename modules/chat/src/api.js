import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
const RETRY_DELAYS = [1000, 2000, 4000];
const PROVIDER_MODEL_MAP = {
    'gpt-4-turbo': 'openai',
    'gpt-4': 'openai',
    'gpt-3.5-turbo': 'openai',
    'gpt-4o': 'openai',
    'claude-3-opus': 'anthropic',
    'claude-3-sonnet': 'anthropic',
    'claude-3-haiku': 'anthropic',
};
function resolveProvider(model, configProvider) {
    if (configProvider && configProvider !== 'custom')
        return configProvider;
    return PROVIDER_MODEL_MAP[model] || 'openai';
}
function getOpenAIClient(config) {
    const baseURL = config.baseUrl || (config.provider === 'ollama' ? process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1' : undefined);
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY || (config.provider === 'ollama' ? 'ollama' : undefined);
    return new OpenAI({ baseURL, apiKey });
}
function getAnthropicClient(config) {
    return new Anthropic({
        apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY || '',
    });
}
function getAzureClient(config) {
    return new OpenAI({
        apiKey: config.apiKey || process.env.AZURE_OPENAI_API_KEY || '',
        baseURL: config.baseUrl || process.env.AZURE_OPENAI_ENDPOINT || '',
        defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
        defaultHeaders: { 'api-key': config.apiKey || process.env.AZURE_OPENAI_API_KEY || '' },
    });
}
function getClient(config) {
    const provider = config.provider === 'custom' ? resolveProvider(config.model, config.provider) : config.provider;
    switch (provider) {
        case 'anthropic':
            return getAnthropicClient(config);
        case 'azure':
            return getAzureClient(config);
        case 'ollama':
        case 'openai':
        default:
            return getOpenAIClient(config);
    }
}
function buildMessages(messages, newMessage) {
    const history = messages.map((m) => ({
        role: m.role === 'tool' ? 'user' : m.role,
        content: m.content,
    }));
    history.push({ role: 'user', content: newMessage });
    return history;
}
async function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
export async function handleMessage(messages, message, config) {
    const client = getClient(config);
    const msgs = buildMessages(messages, message);
    let lastError = null;
    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
        try {
            const response = await client.chat.completions.create({
                model: config.model,
                messages: msgs,
                temperature: config.temperature ?? 0.7,
                max_tokens: config.maxTokens ?? 2048,
                top_p: config.topP ?? 1,
                stream: false,
            });
            const result = response;
            return {
                content: result.choices[0]?.message?.content || '',
                usage: result.usage
                    ? {
                        promptTokens: result.usage.prompt_tokens,
                        completionTokens: result.usage.completion_tokens,
                        totalTokens: result.usage.total_tokens,
                    }
                    : undefined,
            };
        }
        catch (err) {
            lastError = err;
            if (attempt < RETRY_DELAYS.length) {
                await delay(RETRY_DELAYS[attempt]);
            }
        }
    }
    throw lastError || new Error('Failed to get response');
}
export async function handleMessageStream(messages, message, config, onChunk) {
    const client = getClient(config);
    const msgs = buildMessages(messages, message);
    let lastError = null;
    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
        try {
            const stream = await client.chat.completions.create({
                model: config.model,
                messages: msgs,
                temperature: config.temperature ?? 0.7,
                max_tokens: config.maxTokens ?? 2048,
                top_p: config.topP ?? 1,
                stream: true,
            });
            let fullContent = '';
            let usageData;
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                fullContent += content;
                onChunk(content);
                if (chunk.usage) {
                    usageData = {
                        promptTokens: chunk.usage.prompt_tokens,
                        completionTokens: chunk.usage.completion_tokens,
                        totalTokens: chunk.usage.total_tokens,
                    };
                }
            }
            return { content: fullContent, usage: usageData };
        }
        catch (err) {
            lastError = err;
            if (attempt < RETRY_DELAYS.length) {
                await delay(RETRY_DELAYS[attempt]);
            }
        }
    }
    throw lastError || new Error('Failed to stream response');
}
export async function* handleMessageSSE(messages, message, config) {
    const client = getClient(config);
    const msgs = buildMessages(messages, message);
    const stream = await client.chat.completions.create({
        model: config.model,
        messages: msgs,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 2048,
        top_p: config.topP ?? 1,
        stream: true,
    });
    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
            yield content;
        }
    }
}
export async function handleUpload(file) {
    const text = await file.text();
    return {
        id: crypto.randomUUID(),
        filename: file.name,
        content: text,
    };
}
//# sourceMappingURL=api.js.map