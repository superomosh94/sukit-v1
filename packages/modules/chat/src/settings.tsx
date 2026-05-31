import React, { useState } from 'react';

interface ChatSettingsProps {
  initialValues?: {
    apiKey?: string;
    model?: string;
    welcomeMessage?: string;
    theme?: 'light' | 'dark';
  };
  onSave?: (values: any) => void;
}

export function ChatSettings({ initialValues, onSave }: ChatSettingsProps) {
  const [apiKey, setApiKey] = useState(initialValues?.apiKey || '');
  const [model, setModel] = useState(initialValues?.model || 'gpt-4-turbo');
  const [welcomeMessage, setWelcomeMessage] = useState(
    initialValues?.welcomeMessage || 'Hello! How can I help you today?'
  );
  const [theme, setTheme] = useState(initialValues?.theme || 'light');

  function handleSave() {
    onSave?.({ apiKey, model, welcomeMessage, theme });
  }

  const containerStyle: React.CSSProperties = {
    padding: '24px',
    maxWidth: '480px',
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: '16px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '4px',
    fontWeight: 500,
    fontSize: '14px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #D1D5DB',
    fontSize: '14px',
    boxSizing: 'border-box',
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>Chat Module Settings</h2>

      <div style={fieldStyle}>
        <label style={labelStyle}>API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Model</label>
        <select value={model} onChange={(e) => setModel(e.target.value)} style={inputStyle}>
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="claude-3-opus">Claude 3 Opus</option>
          <option value="claude-3-sonnet">Claude 3 Sonnet</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Welcome Message</label>
        <textarea
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Theme</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark')} style={inputStyle}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <button
        onClick={handleSave}
        style={{
          padding: '10px 24px',
          backgroundColor: '#3B82F6',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '14px',
        }}
      >
        Save Settings
      </button>
    </div>
  );
}
