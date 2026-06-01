'use client';

import { useState } from 'react';
import {
  Target,
  Globe,
  Smartphone,
  MapPin,
  MousePointer,
  Shield,
} from 'lucide-react';
import { cn } from '../utils/cn';

interface TargetingRule {
  type: 'url' | 'device' | 'location' | 'referrer' | 'user-agent' | 'logged-in';
  operator: 'equals' | 'contains' | 'matches' | 'not-equals';
  value: string;
}

interface TargetingEditorProps {
  value?: TargetingRule[];
  onChange?: (rules: TargetingRule[]) => void;
  className?: string;
}

const RULE_ICONS: Record<string, any> = {
  url: Globe,
  device: Smartphone,
  location: MapPin,
  referrer: MousePointer,
  'user-agent': Globe,
  'logged-in': Shield,
};

export function TargetingEditor({
  value = [],
  onChange,
  className,
}: TargetingEditorProps) {
  const [rules, setRules] = useState<TargetingRule[]>(value);

  const updateRules = (newRules: TargetingRule[]) => {
    setRules(newRules);
    onChange?.(newRules);
  };

  const addRule = () => {
    updateRules([...rules, { type: 'url', operator: 'contains', value: '' }]);
  };

  const removeRule = (index: number) => {
    updateRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, data: Partial<TargetingRule>) => {
    updateRules(rules.map((r, i) => (i === index ? { ...r, ...data } : r)));
  };

  return (
    <div className={cn('space-y-4 rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Targeting Rules</h3>
        </div>
        <button
          onClick={addRule}
          className="text-xs text-primary hover:underline"
        >
          + Add Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No targeting rules - popup shows on all pages
        </p>
      ) : (
        <div className="space-y-2">
          {rules.map((rule, i) => {
            const Icon = RULE_ICONS[rule.type] ?? Target;
            return (
              <div
                key={i}
                className="flex items-center gap-2 rounded-md border bg-background p-2 text-xs"
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <select
                  value={rule.type}
                  onChange={(e) =>
                    updateRule(i, { type: e.target.value as any })
                  }
                  className="h-7 rounded border bg-background px-1 text-xs"
                >
                  <option value="url">URL</option>
                  <option value="device">Device</option>
                  <option value="location">Location</option>
                  <option value="referrer">Referrer</option>
                  <option value="user-agent">User Agent</option>
                  <option value="logged-in">Logged In</option>
                </select>
                <select
                  value={rule.operator}
                  onChange={(e) =>
                    updateRule(i, { operator: e.target.value as any })
                  }
                  className="h-7 rounded border bg-background px-1 text-xs"
                >
                  <option value="equals">Equals</option>
                  <option value="contains">Contains</option>
                  <option value="matches">Matches</option>
                  <option value="not-equals">Not equals</option>
                </select>
                {rule.type === 'device' ? (
                  <select
                    value={rule.value}
                    onChange={(e) => updateRule(i, { value: e.target.value })}
                    className="h-7 flex-1 rounded border bg-background px-1 text-xs"
                  >
                    <option value="">Select device...</option>
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                    <option value="desktop">Desktop</option>
                  </select>
                ) : rule.type === 'logged-in' ? (
                  <select
                    value={rule.value}
                    onChange={(e) => updateRule(i, { value: e.target.value })}
                    className="h-7 flex-1 rounded border bg-background px-1 text-xs"
                  >
                    <option value="true">Logged In</option>
                    <option value="false">Not Logged In</option>
                  </select>
                ) : rule.type === 'location' ? (
                  <select
                    value={rule.value}
                    onChange={(e) => updateRule(i, { value: e.target.value })}
                    className="h-7 flex-1 rounded border bg-background px-1 text-xs"
                  >
                    <option value="">Select country...</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                    <option value="BR">Brazil</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={rule.value}
                    onChange={(e) => updateRule(i, { value: e.target.value })}
                    placeholder={
                      rule.type === 'url'
                        ? '/blog/*'
                        : rule.type === 'referrer'
                          ? 'google.com'
                          : '.*'
                    }
                    className="h-7 flex-1 rounded border bg-background px-2 font-mono text-xs"
                  />
                )}
                <button
                  onClick={() => removeRule(i)}
                  className="rounded p-1 text-muted-foreground hover:text-destructive"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
