'use client';

import { useState } from 'react';
import { Plus, Trash2, Plug, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  useFormBuilderStore,
  type FormIntegration,
} from '../stores/formBuilderStore';
import { cn } from '../utils/cn';

const INTEGRATIONS = [
  { type: 'stripe', label: 'Stripe', description: 'Payment processing' },
  { type: 'paypal', label: 'PayPal', description: 'PayPal payments' },
  { type: 'mailchimp', label: 'Mailchimp', description: 'Email marketing' },
  { type: 'sendgrid', label: 'SendGrid', description: 'Transactional emails' },
  { type: 'slack', label: 'Slack', description: 'Slack notifications' },
  { type: 'discord', label: 'Discord', description: 'Discord webhooks' },
  { type: 'webhook', label: 'Webhook', description: 'Custom HTTP webhook' },
  {
    type: 'google-sheets',
    label: 'Google Sheets',
    description: 'Spreadsheet export',
  },
  { type: 'hubspot', label: 'HubSpot', description: 'CRM integration' },
  { type: 'zapier', label: 'Zapier', description: 'Zapier automation' },
];

interface FormIntegrationsProps {
  className?: string;
}

export function FormIntegrations({ className }: FormIntegrationsProps) {
  const integrations = useFormBuilderStore((s) => s.integrations);
  const addIntegration = useFormBuilderStore((s) => s.addIntegration);
  const removeIntegration = useFormBuilderStore((s) => s.removeIntegration);
  const updateIntegration = useFormBuilderStore((s) => s.updateIntegration);

  const availableIntegrations = INTEGRATIONS.filter(
    (i) => !integrations.find((existing) => existing.type === i.type)
  );

  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Plug className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Integrations</h3>
        </div>
        {availableIntegrations.length > 0 && (
          <select
            onChange={(e) =>
              e.target.value &&
              (addIntegration(e.target.value), (e.target.value = ''))
            }
            className="h-7 rounded border bg-background px-2 text-xs"
            value=""
          >
            <option value="" disabled>
              Add integration...
            </option>
            {availableIntegrations.map((i) => (
              <option key={i.type} value={i.type}>
                {i.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {integrations.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No integrations configured
        </p>
      ) : (
        <div className="space-y-2">
          {integrations.map((integration) => {
            const info = INTEGRATIONS.find((i) => i.type === integration.type);
            return (
              <div
                key={integration.id}
                className="rounded-md border bg-background p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{info?.label}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {info?.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateIntegration(integration.id, {
                          enabled: !integration.enabled,
                        })
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {integration.enabled ? (
                        <ToggleRight className="size-4 text-primary" />
                      ) : (
                        <ToggleLeft className="size-4" />
                      )}
                    </button>
                    <button
                      onClick={() => removeIntegration(integration.id)}
                      className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
                <IntegrationConfig integration={integration} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IntegrationConfig({ integration }: { integration: FormIntegration }) {
  const updateIntegration = useFormBuilderStore((s) => s.updateIntegration);

  switch (integration.type) {
    case 'stripe':
    case 'paypal':
      return (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="API Key / Secret"
            value={integration.config.apiKey ?? ''}
            onChange={(e) =>
              updateIntegration(integration.id, {
                config: { ...integration.config, apiKey: e.target.value },
              })
            }
            className="h-7 w-full rounded border bg-background px-2 text-xs"
          />
        </div>
      );
    case 'webhook':
      return (
        <input
          type="url"
          placeholder="https://hooks.example.com/submit"
          value={integration.config.url ?? ''}
          onChange={(e) =>
            updateIntegration(integration.id, {
              config: { ...integration.config, url: e.target.value },
            })
          }
          className="h-7 w-full rounded border bg-background px-2 text-xs"
        />
      );
    case 'slack':
    case 'discord':
      return (
        <input
          type="url"
          placeholder="Webhook URL"
          value={integration.config.webhookUrl ?? ''}
          onChange={(e) =>
            updateIntegration(integration.id, {
              config: { ...integration.config, webhookUrl: e.target.value },
            })
          }
          className="h-7 w-full rounded border bg-background px-2 text-xs"
        />
      );
    case 'mailchimp':
    case 'sendgrid':
      return (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="API Key"
            value={integration.config.apiKey ?? ''}
            onChange={(e) =>
              updateIntegration(integration.id, {
                config: { ...integration.config, apiKey: e.target.value },
              })
            }
            className="h-7 w-full rounded border bg-background px-2 text-xs"
          />
          {integration.type === 'mailchimp' && (
            <input
              type="text"
              placeholder="Audience ID"
              value={integration.config.audienceId ?? ''}
              onChange={(e) =>
                updateIntegration(integration.id, {
                  config: { ...integration.config, audienceId: e.target.value },
                })
              }
              className="h-7 w-full rounded border bg-background px-2 text-xs"
            />
          )}
        </div>
      );
    case 'google-sheets':
      return (
        <input
          type="text"
          placeholder="Spreadsheet ID"
          value={integration.config.spreadsheetId ?? ''}
          onChange={(e) =>
            updateIntegration(integration.id, {
              config: { ...integration.config, spreadsheetId: e.target.value },
            })
          }
          className="h-7 w-full rounded border bg-background px-2 text-xs"
        />
      );
    case 'hubspot':
      return (
        <input
          type="text"
          placeholder="HubSpot API Key"
          value={integration.config.apiKey ?? ''}
          onChange={(e) =>
            updateIntegration(integration.id, {
              config: { ...integration.config, apiKey: e.target.value },
            })
          }
          className="h-7 w-full rounded border bg-background px-2 text-xs"
        />
      );
    case 'zapier':
      return (
        <input
          type="url"
          placeholder="Zapier Webhook URL"
          value={integration.config.webhookUrl ?? ''}
          onChange={(e) =>
            updateIntegration(integration.id, {
              config: { ...integration.config, webhookUrl: e.target.value },
            })
          }
          className="h-7 w-full rounded border bg-background px-2 text-xs"
        />
      );
    default:
      return null;
  }
}
