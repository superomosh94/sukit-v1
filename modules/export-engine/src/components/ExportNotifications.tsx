'use client';

import { useState } from 'react';
import { Bell, Mail, Globe, Save } from 'lucide-react';
import { cn } from '../utils/cn';

interface NotificationConfig {
  email: boolean;
  emailAddresses: string[];
  webhook: boolean;
  webhookUrl: string;
}

interface ExportNotificationsProps {
  onSave?: (config: NotificationConfig) => void;
  className?: string;
}

export function ExportNotifications({
  onSave,
  className,
}: ExportNotificationsProps) {
  const [config, setConfig] = useState<NotificationConfig>({
    email: false,
    emailAddresses: [],
    webhook: false,
    webhookUrl: '',
  });
  const [emailInput, setEmailInput] = useState('');

  const addEmail = () => {
    if (
      emailInput.trim() &&
      !config.emailAddresses.includes(emailInput.trim())
    ) {
      setConfig({
        ...config,
        emailAddresses: [...config.emailAddresses, emailInput.trim()],
      });
      setEmailInput('');
    }
  };

  const removeEmail = (email: string) => {
    setConfig({
      ...config,
      emailAddresses: config.emailAddresses.filter((e) => e !== email),
    });
  };

  return (
    <div className={cn('space-y-4 rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center gap-2">
        <Bell className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Export Notifications</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-muted-foreground" />
            <span className="text-xs font-medium">Email Notification</span>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={config.email}
              onChange={(e) =>
                setConfig({ ...config, email: e.target.checked })
              }
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
          </label>
        </div>

        {config.email && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="email@example.com"
                className="h-8 flex-1 rounded-md border bg-background px-3 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && addEmail()}
              />
              <button
                onClick={addEmail}
                className="rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground"
              >
                Add
              </button>
            </div>
            {config.emailAddresses.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {config.emailAddresses.map((email) => (
                  <span
                    key={email}
                    className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px]"
                  >
                    {email}
                    <button
                      onClick={() => removeEmail(email)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-muted-foreground" />
            <span className="text-xs font-medium">Webhook</span>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={config.webhook}
              onChange={(e) =>
                setConfig({ ...config, webhook: e.target.checked })
              }
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
          </label>
        </div>

        {config.webhook && (
          <input
            type="url"
            value={config.webhookUrl}
            onChange={(e) =>
              setConfig({ ...config, webhookUrl: e.target.value })
            }
            placeholder="https://hooks.example.com/export-complete"
            className="h-8 w-full rounded-md border bg-background px-3 text-xs"
          />
        )}
      </div>

      <button
        onClick={() => onSave?.(config)}
        className="flex w-full items-center justify-center gap-1 rounded-md bg-primary py-2 text-xs font-medium text-primary-foreground"
      >
        <Save className="size-3" />
        Save Notification Settings
      </button>
    </div>
  );
}
