import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { ModelConfig, ChatMessage, ProviderClient } from './types';

const RETRY_DELAYS = [1000, 2000, 4000];
const PROVIDER_MODEL_MAP: Record<string, string> = {
  'gpt-4-turbo': 'openai',
  'gpt-4': 'openai',
  'gpt-3.5-turbo': 'openai',
  'gpt-4o': 'openai',
  'claude-3-opus': 'anthropic',
  'claude-3-sonnet': 'anthropic',
  'claude-3-haiku': 'anthropic',
};

function resolveProvider(model: string, configProvider?: string): string {
  if (configProvider && configProvider !== 'custom') return configProvider;
  return PROVIDER_MODEL_MAP[model] || 'openai';
}

function getOpenAIClient(config: ModelConfig): OpenAI {
  const baseURL = config.baseUrl || (config.provider === 'ollama' ? process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1' : undefined);
  const apiKey = config.apiKey || process.env.OPENAI_API_KEY || (config.provider === 'ollama' ? 'ollama' : undefined);
  return new OpenAI({ baseURL, apiKey });
}

function getAnthropicClient(config: ModelConfig): Anthropic {
  return new Anthropic({
    apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY || '',
  });
}

function getAzureClient(config: ModelConfig): OpenAI {
  return new OpenAI({
    apiKey: config.apiKey || process.env.AZURE_OPENAI_API_KEY || '',
    baseURL: config.baseUrl || process.env.AZURE_OPENAI_ENDPOINT || '',
    defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
    defaultHeaders: { 'api-key': config.apiKey || process.env.AZURE_OPENAI_API_KEY || '' },
  });
}

function getClient(config: ModelConfig): ProviderClient {
  const provider = config.provider === 'custom' ? resolveProvider(config.model, config.provider) : config.provider;
  switch (provider) {
    case 'anthropic':
      return getAnthropicClient(config) as unknown as ProviderClient;
    case 'azure':
      return getAzureClient(config) as unknown as ProviderClient;
    case 'ollama':
    case 'openai':
    default:
      return getOpenAIClient(config) as unknown as ProviderClient;
  }
}

function buildMessages(messages: ChatMessage[], newMessage: string): { role: string; content: string }[] {
  const history = messages.map((m) => ({
    role: m.role === 'tool' ? 'user' as const : m.role,
    content: m.content,
  }));
  history.push({ role: 'user' as const, content: newMessage });
  return history;
}

async function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function handleMessage(
  messages: ChatMessage[],
  message: string,
  config: ModelConfig,
): Promise<{ content: string; usage?: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  const client = getClient(config);
  const msgs = buildMessages(messages, message);

  let lastError: Error | null = null;
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

      const result = response as any;
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
    } catch (err) {
      lastError = err as Error;
      if (attempt < RETRY_DELAYS.length) {
        await delay(RETRY_DELAYS[attempt]);
      }
    }
  }
  throw lastError || new Error('Failed to get response');
}

export async function handleMessageStream(
  messages: ChatMessage[],
  message: string,
  config: ModelConfig,
  onChunk: (chunk: string) => void,
): Promise<{ content: string; usage?: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  const client = getClient(config);
  const msgs = buildMessages(messages, message);

  let lastError: Error | null = null;
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
      let usageData: { promptTokens: number; completionTokens: number; totalTokens: number } | undefined;

      for await (const chunk of stream as unknown as AsyncIterable<any>) {
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
    } catch (err) {
      lastError = err as Error;
      if (attempt < RETRY_DELAYS.length) {
        await delay(RETRY_DELAYS[attempt]);
      }
    }
  }
  throw lastError || new Error('Failed to stream response');
}

export async function* handleMessageSSE(
  messages: ChatMessage[],
  message: string,
  config: ModelConfig,
): AsyncGenerator<string> {
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

  for await (const chunk of stream as unknown as AsyncIterable<any>) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      yield content;
    }
  }
}

export async function handleUpload(file: File): Promise<{ id: string; filename: string; content: string }> {
  const text = await file.text();
  return {
    id: crypto.randomUUID(),
    filename: file.name,
    content: text,
  };
}
