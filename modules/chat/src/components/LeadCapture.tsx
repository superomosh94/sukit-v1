'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { cn } from '../utils/cn';

interface LeadCaptureProps {
  className?: string;
}

const CRM_OPTIONS = [
  'hubspot',
  'salesforce',
  'zoho',
  'pipedrive',
  'custom-webhook',
];

export function LeadCapture({ className }: LeadCaptureProps) {
  const leadCapture = useChatStore((s) => s.leadCapture);
  const setLeadCapture = useChatStore((s) => s.setLeadCapture);

  const addField = () => {
    setLeadCapture({
      formFields: [
        ...leadCapture.formFields,
        { name: '', label: '', required: false, type: 'text' },
      ],
    });
  };

  const removeField = (index: number) => {
    setLeadCapture({
      formFields: leadCapture.formFields.filter((_, i) => i !== index),
    });
  };

  const updateField = (
    index: number,
    data: Partial<(typeof leadCapture.formFields)[0]>
  ) => {
    setLeadCapture({
      formFields: leadCapture.formFields.map((f, i) =>
        i === index ? { ...f, ...data } : f
      ),
    });
  };

  return (
    <div className={cn('space-y-4 rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Lead Capture</h3>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={leadCapture.enabled}
            onChange={(e) => setLeadCapture({ enabled: e.target.checked })}
            className="peer sr-only"
          />
          <div className="h-5 w-9 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
        </label>
      </div>

      {leadCapture.enabled && (
        <>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Form Fields
            </label>
            <div className="space-y-2">
              {leadCapture.formFields.map((field, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-md bg-muted p-2 text-xs"
                >
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(i, { name: e.target.value })}
                    placeholder="Field name"
                    className="h-7 w-28 rounded border bg-background px-2 text-xs"
                  />
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(i, { label: e.target.value })}
                    placeholder="Label"
                    className="h-7 flex-1 rounded border bg-background px-2 text-xs"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(i, { type: e.target.value })}
                    className="h-7 rounded border bg-background px-2 text-xs"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="textarea">Textarea</option>
                  </select>
                  <label className="flex items-center gap-1 text-[10px]">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) =>
                        updateField(i, { required: e.target.checked })
                      }
                    />
                    Required
                  </label>
                  <button
                    onClick={() => removeField(i)}
                    className="rounded p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addField}
              className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus className="size-3" /> Add Field
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              CRM Integration
            </label>
            <select
              value={leadCapture.crmIntegration}
              onChange={(e) =>
                setLeadCapture({ crmIntegration: e.target.value })
              }
              className="mt-1 h-8 w-full rounded-md border bg-background px-2 text-xs"
            >
              <option value="">None</option>
              {CRM_OPTIONS.map((crm) => (
                <option key={crm} value={crm}>
                  {crm.charAt(0).toUpperCase() + crm.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Webhook URL
            </label>
            <input
              type="url"
              value={leadCapture.webhookUrl}
              onChange={(e) => setLeadCapture({ webhookUrl: e.target.value })}
              placeholder="https://hooks.example.com/lead"
              className="mt-1 h-8 w-full rounded-md border bg-background px-3 text-xs"
            />
          </div>
        </>
      )}
    </div>
  );
}
