import React from 'react';
import { useSettingsStore } from '../../stores/settingsStore';

const SEO = () => {
    const { settings, updateSettings } = useSettingsStore();
    const seo = settings.seo || {};

    const update = (key, value) => updateSettings('seo', { [key]: value });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-text-primary">SEO</h2>
                <p className="text-sm text-text-secondary mt-1">Meta tags, Open Graph</p>
            </div>

            <div className="space-y-4 bg-surface border border-border rounded-xl p-5">
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Meta Title</label>
                    <input
                        type="text"
                        value={seo.metaTitle || ''}
                        onChange={(e) => update('metaTitle', e.target.value)}
                        placeholder="My App - Best SuKit Project"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="mt-1 text-xs text-text-secondary">{(seo.metaTitle || '').length}/60 characters</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Meta Description</label>
                    <textarea
                        value={seo.metaDescription || ''}
                        onChange={(e) => update('metaDescription', e.target.value)}
                        placeholder="A brief description of your site for search engines"
                        rows={3}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <p className="mt-1 text-xs text-text-secondary">{(seo.metaDescription || '').length}/160 characters</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">OG Image URL</label>
                    <input
                        type="url"
                        value={seo.ogImage || ''}
                        onChange={(e) => update('ogImage', e.target.value)}
                        placeholder="https://example.com/og-image.png"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-primary">Canonical URLs</p>
                        <p className="text-xs text-text-secondary">Add canonical link tags to pages</p>
                    </div>
                    <button
                        onClick={() => update('canonicalUrls', !seo.canonicalUrls)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${seo.canonicalUrls ? 'bg-primary-500' : 'bg-surface-light'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-full transition-transform ${seo.canonicalUrls ? 'translate-x-5' : ''}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-primary">Sitemap Auto-Generation</p>
                        <p className="text-xs text-text-secondary">Automatically generate sitemap.xml</p>
                    </div>
                    <button
                        onClick={() => update('autoSitemap', !seo.autoSitemap)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${seo.autoSitemap ? 'bg-primary-500' : 'bg-surface-light'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-full transition-transform ${seo.autoSitemap ? 'translate-x-5' : ''}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-primary">Robots Meta Tag</p>
                        <p className="text-xs text-text-secondary">Allow or block search engine indexing</p>
                    </div>
                    <select
                        value={seo.robots || 'index,follow'}
                        onChange={(e) => update('robots', e.target.value)}
                        className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="index,follow">Index, Follow</option>
                        <option value="noindex,follow">No Index, Follow</option>
                        <option value="index,nofollow">Index, No Follow</option>
                        <option value="noindex,nofollow">No Index, No Follow</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default SEO;
