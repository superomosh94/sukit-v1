import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function ChatSettings({ initialValues, onSave }) {
    const [apiKey, setApiKey] = useState(initialValues?.apiKey || '');
    const [model, setModel] = useState(initialValues?.model || 'gpt-4-turbo');
    const [welcomeMessage, setWelcomeMessage] = useState(initialValues?.welcomeMessage || 'Hello! How can I help you today?');
    const [theme, setTheme] = useState(initialValues?.theme || 'light');
    function handleSave() {
        onSave?.({ apiKey, model, welcomeMessage, theme });
    }
    const containerStyle = {
        padding: '24px',
        maxWidth: '480px',
    };
    const fieldStyle = {
        marginBottom: '16px',
    };
    const labelStyle = {
        display: 'block',
        marginBottom: '4px',
        fontWeight: 500,
        fontSize: '14px',
    };
    const inputStyle = {
        width: '100%',
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #D1D5DB',
        fontSize: '14px',
        boxSizing: 'border-box',
    };
    return (_jsxs("div", { style: containerStyle, children: [_jsx("h2", { style: { marginBottom: '20px', fontSize: '18px', fontWeight: 600 }, children: "Chat Module Settings" }), _jsxs("div", { style: fieldStyle, children: [_jsx("label", { style: labelStyle, children: "API Key" }), _jsx("input", { type: "password", value: apiKey, onChange: (e) => setApiKey(e.target.value), placeholder: "sk-...", style: inputStyle })] }), _jsxs("div", { style: fieldStyle, children: [_jsx("label", { style: labelStyle, children: "Model" }), _jsxs("select", { value: model, onChange: (e) => setModel(e.target.value), style: inputStyle, children: [_jsx("option", { value: "gpt-4-turbo", children: "GPT-4 Turbo" }), _jsx("option", { value: "gpt-4", children: "GPT-4" }), _jsx("option", { value: "gpt-3.5-turbo", children: "GPT-3.5 Turbo" }), _jsx("option", { value: "claude-3-opus", children: "Claude 3 Opus" }), _jsx("option", { value: "claude-3-sonnet", children: "Claude 3 Sonnet" })] })] }), _jsxs("div", { style: fieldStyle, children: [_jsx("label", { style: labelStyle, children: "Welcome Message" }), _jsx("textarea", { value: welcomeMessage, onChange: (e) => setWelcomeMessage(e.target.value), rows: 3, style: { ...inputStyle, resize: 'vertical' } })] }), _jsxs("div", { style: fieldStyle, children: [_jsx("label", { style: labelStyle, children: "Theme" }), _jsxs("select", { value: theme, onChange: (e) => setTheme(e.target.value), style: inputStyle, children: [_jsx("option", { value: "light", children: "Light" }), _jsx("option", { value: "dark", children: "Dark" })] })] }), _jsx("button", { onClick: handleSave, style: {
                    padding: '10px 24px',
                    backgroundColor: '#3B82F6',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                }, children: "Save Settings" })] }));
}
//# sourceMappingURL=settings.js.map