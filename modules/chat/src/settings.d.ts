interface ChatSettingsProps {
    initialValues?: {
        apiKey?: string;
        model?: string;
        welcomeMessage?: string;
        theme?: 'light' | 'dark';
    };
    onSave?: (values: any) => void;
}
export declare function ChatSettings({ initialValues, onSave }: ChatSettingsProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=settings.d.ts.map