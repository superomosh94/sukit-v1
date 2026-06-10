interface ChatWidgetProps {
    apiKey?: string;
    model?: string;
    welcomeMessage?: string;
    theme?: 'light' | 'dark';
    position?: 'bottom-right' | 'bottom-left';
    availableModels?: {
        label: string;
        value: string;
    }[];
}
export declare function ChatWidget({ apiKey, model, welcomeMessage, theme, position, availableModels, }: ChatWidgetProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=widget.d.ts.map