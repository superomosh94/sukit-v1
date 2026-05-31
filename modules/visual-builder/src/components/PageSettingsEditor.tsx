'use client';

import { useCallback } from 'react';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  SettingsSection,
  SettingsField,
} from '../property-panel/editors/shared';
import { useBuilderStore } from '../stores/builderStore';

export function PageSettingsEditor() {
  const pageTitle = useBuilderStore((s) => s.pageTitle);
  const pageSettings = useBuilderStore((s) => s.pageSettings);
  const setPageSettings = useBuilderStore((s) => s.setPageSettings);

  const seo = (pageSettings.seoSettings ?? {}) as Record<string, unknown>;

  const setSeo = useCallback(
    (key: string, value: string) => {
      setPageSettings({
        ...pageSettings,
        seoSettings: { ...seo, [key]: value },
      });
    },
    [pageSettings, seo, setPageSettings]
  );

  const setPageTitle = useCallback((title: string) => {
    useBuilderStore.setState({ pageTitle: title });
  }, []);

  return (
    <div className="space-y-2">
      <SettingsSection title="Page">
        <SettingsField label="Page Title">
          <Input
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            className="h-8 text-xs"
            placeholder="Enter page title..."
          />
        </SettingsField>
      </SettingsSection>

      <SettingsSection title="SEO Meta">
        <SettingsField label="Meta Description">
          <Textarea
            value={(seo.description as string) ?? ''}
            onChange={(e) => setSeo('description', e.target.value)}
            className="min-h-[60px] text-xs"
            placeholder="Brief page description for search results..."
          />
        </SettingsField>
        <SettingsField label="Meta Keywords">
          <Input
            value={(seo.keywords as string) ?? ''}
            onChange={(e) => setSeo('keywords', e.target.value)}
            className="h-8 text-xs"
            placeholder="keyword1, keyword2, keyword3"
          />
        </SettingsField>
        <SettingsField label="Canonical URL">
          <Input
            value={(seo.canonical as string) ?? ''}
            onChange={(e) => setSeo('canonical', e.target.value)}
            className="h-8 text-xs font-mono"
            placeholder="https://example.com/page"
          />
        </SettingsField>
      </SettingsSection>

      <SettingsSection title="Open Graph">
        <SettingsField label="OG Title">
          <Input
            value={(seo.ogTitle as string) ?? ''}
            onChange={(e) => setSeo('ogTitle', e.target.value)}
            className="h-8 text-xs"
            placeholder="Title for social sharing"
          />
        </SettingsField>
        <SettingsField label="OG Description">
          <Textarea
            value={(seo.ogDescription as string) ?? ''}
            onChange={(e) => setSeo('ogDescription', e.target.value)}
            className="min-h-[60px] text-xs"
            placeholder="Description for social sharing"
          />
        </SettingsField>
        <SettingsField label="OG Image">
          <Input
            value={(seo.ogImage as string) ?? ''}
            onChange={(e) => setSeo('ogImage', e.target.value)}
            className="h-8 text-xs font-mono"
            placeholder="https://example.com/og-image.jpg"
          />
        </SettingsField>
      </SettingsSection>

      <SettingsSection title="Custom Head HTML">
        <SettingsField label="Head HTML">
          <Textarea
            value={(pageSettings.headHtml as string) ?? ''}
            onChange={(e) =>
              setPageSettings({ ...pageSettings, headHtml: e.target.value })
            }
            className="min-h-[80px] text-xs font-mono"
            placeholder="<meta name='custom' content='...' />"
          />
        </SettingsField>
      </SettingsSection>
    </div>
  );
}
