'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Globe,
  Lock,
  Shield,
  Code,
  Save,
  RefreshCw,
  Download,
  Upload,
  HardDrive,
} from 'lucide-react';
import { useSiteManagerStore } from '../stores/siteManagerStore';
import { cn } from '../utils/cn';
import type { BackupEntry } from '../types';

export function SiteSettingsPanel() {
  const currentSiteId = useSiteManagerStore((s) => s.currentSiteId);
  const currentSite = useSiteManagerStore((s) => s.currentSite);
  const updateSite = useSiteManagerStore((s) => s.updateSite);
  const createBackup = useSiteManagerStore((s) => s.createBackup);
  const loadBackups = useSiteManagerStore((s) => s.loadBackups);
  const restoreBackup = useSiteManagerStore((s) => s.restoreBackup);
  const downloadBackup = useSiteManagerStore((s) => s.downloadBackup);
  const [tab, setTab] = useState<'general' | 'domain' | 'code' | 'backups'>(
    'general'
  );
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [saved, setSaved] = useState(false);
  const [creating, setCreating] = useState(false);

  const settings = currentSite?.settings;
  const codeInjection = settings?.codeInjection;
  const domain = settings?.domain;

  useEffect(() => {
    if (currentSiteId) {
      loadBackups(currentSiteId).then(setBackups);
    }
  }, [currentSiteId, loadBackups]);

  if (!currentSite || !currentSiteId) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-xs text-muted-foreground">
          Select a site to configure
        </p>
      </div>
    );
  }

  const handleSave = (field: string, value: unknown) => {
    updateSite(currentSiteId, { [field]: value } as any);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSettingsSave = (path: string, value: unknown) => {
    const parts = path.split('.');
    const updated = JSON.parse(JSON.stringify(currentSite));
    let obj = updated;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj.settings[parts[i]]) obj.settings[parts[i]] = {};
      obj = obj.settings[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    updateSite(currentSiteId, updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    await createBackup(currentSiteId);
    const updated = await loadBackups(currentSiteId);
    setBackups(updated);
    setCreating(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Settings className="size-4 text-muted-foreground" />
          Site Settings
        </h3>
        {saved && <span className="text-[10px] text-green-500">Saved</span>}
      </div>

      <div className="flex gap-1 border-b px-4 py-2 overflow-x-auto">
        {(['general', 'domain', 'code', 'backups'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-colors',
              tab === t
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'general' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Site Name</label>
              <input
                value={currentSite.name}
                onChange={(e) => handleSave('name', e.target.value)}
                className="h-8 w-full rounded-md border px-3 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Description
              </label>
              <textarea
                value={currentSite.description ?? ''}
                onChange={(e) => handleSave('description', e.target.value)}
                className="h-16 w-full rounded-md border bg-background p-2 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Language</label>
              <select
                value={currentSite.language}
                onChange={(e) => handleSave('language', e.target.value)}
                className="h-8 w-full rounded-md border px-3 text-xs"
              >
                {['en', 'es', 'fr', 'de', 'ja', 'zh', 'pt', 'ru', 'ar'].map(
                  (l) => (
                    <option key={l} value={l}>
                      {new Intl.DisplayNames(['en'], { type: 'language' }).of(
                        l
                      ) ?? l}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Timezone</label>
              <select
                value={currentSite.timezone}
                onChange={(e) => handleSave('timezone', e.target.value)}
                className="h-8 w-full rounded-md border px-3 text-xs"
              >
                {Intl.supportedValuesOf?.('timeZone')?.map?.((tz: string) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                )) ?? <option value="UTC">UTC</option>}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Privacy</label>
              <select
                value={currentSite.privacy}
                onChange={(e) => handleSave('privacy', e.target.value)}
                className="h-8 w-full rounded-md border px-3 text-xs"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="password">Password Protected</option>
              </select>
            </div>
            {currentSite.privacy === 'password' && (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  Access Password
                </label>
                <input
                  type="password"
                  value={currentSite.password ?? ''}
                  onChange={(e) => handleSave('password', e.target.value)}
                  className="h-8 w-full rounded-md border px-3 text-xs"
                  placeholder="Enter site password"
                />
              </div>
            )}
          </div>
        )}

        {tab === 'domain' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Custom Domain
              </label>
              <div className="flex gap-2">
                <input
                  value={domain?.custom ?? ''}
                  onChange={(e) =>
                    handleSettingsSave('domain.custom', e.target.value)
                  }
                  className="h-8 flex-1 rounded-md border px-3 text-xs font-mono"
                  placeholder="example.com"
                />
                <span
                  className={cn(
                    'flex items-center gap-1 rounded px-2 text-[10px] font-medium',
                    domain?.verified
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-amber-500/10 text-amber-600'
                  )}
                >
                  <Shield className="size-3" />
                  {domain?.verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
            {domain?.sslEnabled && (
              <div className="rounded-md bg-green-500/10 px-3 py-2 text-xs text-green-600 flex items-center gap-2">
                <Lock className="size-3.5" />
                SSL certificate active (Let's Encrypt)
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Domain Aliases
              </label>
              <div className="space-y-1">
                {(domain?.aliases ?? []).map((alias, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <input
                      value={alias}
                      onChange={(e) => {
                        const newAliases = [...(domain?.aliases ?? [])];
                        newAliases[i] = e.target.value;
                        handleSettingsSave('domain.aliases', newAliases);
                      }}
                      className="h-7 flex-1 rounded-md border px-2 text-xs font-mono"
                    />
                    <button
                      onClick={() => {
                        const newAliases =
                          domain?.aliases.filter((_, j) => j !== i) ?? [];
                        handleSettingsSave('domain.aliases', newAliases);
                      }}
                      className="rounded p-1 text-destructive hover:bg-destructive/10"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newAliases = [...(domain?.aliases ?? []), ''];
                    handleSettingsSave('domain.aliases', newAliases);
                  }}
                  className="text-[10px] text-primary hover:underline"
                >
                  + Add alias
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'code' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Head HTML (before &lt;/head&gt;)
              </label>
              <textarea
                value={codeInjection?.head ?? ''}
                onChange={(e) =>
                  handleSettingsSave('codeInjection.head', e.target.value)
                }
                className="h-24 w-full rounded-md border bg-background p-2 text-xs font-mono"
                placeholder="<meta name='google-site-verification' ... />"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Body HTML (before &lt;/body&gt;)
              </label>
              <textarea
                value={codeInjection?.body ?? ''}
                onChange={(e) =>
                  handleSettingsSave('codeInjection.body', e.target.value)
                }
                className="h-24 w-full rounded-md border bg-background p-2 text-xs font-mono"
                placeholder="<!-- Google Analytics --><script>...</script>"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Custom CSS
              </label>
              <textarea
                value={codeInjection?.css ?? ''}
                onChange={(e) =>
                  handleSettingsSave('codeInjection.css', e.target.value)
                }
                className="h-24 w-full rounded-md border bg-background p-2 text-xs font-mono"
                placeholder=".my-class { color: red; }"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  Google Tag Manager ID
                </label>
                <input
                  value={codeInjection?.gtmId ?? ''}
                  onChange={(e) =>
                    handleSettingsSave('codeInjection.gtmId', e.target.value)
                  }
                  className="h-8 w-full rounded-md border px-3 text-xs font-mono"
                  placeholder="GTM-XXXXXXX"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  Google Analytics ID
                </label>
                <input
                  value={codeInjection?.gaId ?? ''}
                  onChange={(e) =>
                    handleSettingsSave('codeInjection.gaId', e.target.value)
                  }
                  className="h-8 w-full rounded-md border px-3 text-xs font-mono"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </div>
          </div>
        )}

        {tab === 'backups' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                <HardDrive className="inline size-3.5 mr-1" />
                {backups.length} backup{backups.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={handleCreateBackup}
                disabled={creating}
                className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
              >
                {creating ? (
                  <RefreshCw className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                {creating ? 'Creating...' : 'Create Backup'}
              </button>
            </div>

            {backups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <HardDrive className="size-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">No backups yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between rounded-md border bg-card p-3"
                  >
                    <div>
                      <p className="text-xs font-medium">
                        {backup.type === 'automatic'
                          ? '🤖 Automatic'
                          : '📝 Manual'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(backup.createdAt).toLocaleString()} &middot;{' '}
                        {Math.round(backup.size / 1024)}KB
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => downloadBackup(currentSiteId, backup.id)}
                        className="rounded p-1.5 text-muted-foreground hover:text-foreground"
                        title="Download"
                      >
                        <Download className="size-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              'Restore this backup? Current data will be replaced.'
                            )
                          ) {
                            restoreBackup(currentSiteId, backup.id);
                          }
                        }}
                        className="rounded p-1.5 text-muted-foreground hover:text-amber-500"
                        title="Restore"
                      >
                        <RefreshCw className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
