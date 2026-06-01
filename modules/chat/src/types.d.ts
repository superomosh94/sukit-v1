export interface ChatMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  parentId?: string;
  createdAt: number;
}
export interface Chat {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  shareId?: string;
  archived: boolean;
  pinned: boolean;
  meta: Record<string, unknown>;
  folderId?: string;
  createdAt: number;
  updatedAt: number;
}
export interface ModelConfig {
  provider: 'openai' | 'ollama' | 'anthropic' | 'azure' | 'custom';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  stream: boolean;
}
export interface RAGDocument {
  id: string;
  filename: string;
  content: string;
  chunks: {
    text: string;
    embedding?: number[];
    index: number;
  }[];
  metadata: Record<string, unknown>;
}
export interface ProviderClient {
  chat: {
    completions: {
      create: (params: {
        model: string;
        messages: {
          role: string;
          content: string;
        }[];
        temperature?: number;
        max_tokens?: number;
        top_p?: number;
        stream?: boolean;
      }) =>
        | Promise<{
            choices: {
              message: {
                content: string | null;
              };
              finish_reason: string;
            }[];
            usage?: {
              prompt_tokens: number;
              completion_tokens: number;
              total_tokens: number;
            };
          }>
        | AsyncIterable<{
            choices: {
              delta: {
                content?: string;
              };
              finish_reason: string | null;
            }[];
          }>;
    };
  };
}
export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  streaming: boolean;
  streamContent: string;
  error: string | null;
}
//# sourceMappingURL=types.d.ts.map
