'use client';

import { useState } from 'react';
import { Mail, Plus, X } from 'lucide-react';
import { useFormBuilderStore } from '../stores/formBuilderStore';
import { cn } from '../utils/cn';

interface EmailNotificationEditorProps {
  className?: string;
}

export function EmailNotificationEditor({
  className,
}: EmailNotificationEditorProps) {
  const emailNotification = useFormBuilderStore((s) => s.emailNotification);
  const setEmailNotification = useFormBuilderStore(
    (s) => s.setEmailNotification
  );
  const [emailInput, setEmailInput] = useState('');

  const addEmail = () => {
    if (
      emailInput.trim() &&
      !emailNotification.to.includes(emailInput.trim())
    ) {
      setEmailNotification({
        to: [...emailNotification.to, emailInput.trim()],
      });
      setEmailInput('');
    }
  };

  const removeEmail = (email: string) => {
    setEmailNotification({
      to: emailNotification.to.filter((e) => e !== email),
    });
  };

  return (
    <div className={cn('space-y-4 rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center gap-2">
        <Mail className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Email Notifications</h3>
        <label className="relative ml-auto inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={emailNotification.enabled}
            onChange={(e) =>
              setEmailNotification({ enabled: e.target.checked })
            }
            className="peer sr-only"
          />
          <div className="h-5 w-9 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
        </label>
      </div>

      {emailNotification.enabled && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                From Name
              </label>
              <input
                type="text"
                value={emailNotification.fromName ?? ''}
                onChange={(e) =>
                  setEmailNotification({ fromName: e.target.value })
                }
                placeholder="Your Company"
                className="mt-1 h-8 w-full rounded-md border bg-background px-3 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                From Email
              </label>
              <input
                type="email"
                value={emailNotification.fromEmail ?? ''}
                onChange={(e) =>
                  setEmailNotification({ fromEmail: e.target.value })
                }
                placeholder="noreply@example.com"
                className="mt-1 h-8 w-full rounded-md border bg-background px-3 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Recipients
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@example.com"
                className="h-8 flex-1 rounded-md border bg-background px-3 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && addEmail()}
              />
              <button
                onClick={addEmail}
                className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground"
              >
                <Plus className="size-3" /> Add
              </button>
            </div>
            {emailNotification.to.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {emailNotification.to.map((email) => (
                  <span
                    key={email}
                    className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px]"
                  >
                    {email}
                    <button
                      onClick={() => removeEmail(email)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Subject
            </label>
            <input
              type="text"
              value={emailNotification.subject}
              onChange={(e) =>
                setEmailNotification({ subject: e.target.value })
              }
              placeholder="New form submission: {{form_name}}"
              className="mt-1 h-8 w-full rounded-md border bg-background px-3 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Email Template
            </label>
            <textarea
              value={emailNotification.template}
              onChange={(e) =>
                setEmailNotification({ template: e.target.value })
              }
              rows={6}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 font-mono text-xs"
              placeholder={`Hello,\n\nA new form submission has been received.\n\n{{field_values}}\n\nThank you.`}
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              Available variables: {'{{form_name}}'}, {'{{field_values}}'},{' '}
              {'{{submission_date}}'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
