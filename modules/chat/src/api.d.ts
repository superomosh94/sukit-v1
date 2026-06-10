import { ModelConfig, ChatMessage } from './types';
export declare function handleMessage(messages: ChatMessage[], message: string, config: ModelConfig): Promise<{
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}>;
export declare function handleMessageStream(messages: ChatMessage[], message: string, config: ModelConfig, onChunk: (chunk: string) => void): Promise<{
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}>;
export declare function handleMessageSSE(messages: ChatMessage[], message: string, config: ModelConfig): AsyncGenerator<string>;
export declare function handleUpload(file: File): Promise<{
    id: string;
    filename: string;
    content: string;
}>;
//# sourceMappingURL=api.d.ts.map