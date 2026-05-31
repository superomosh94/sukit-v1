import React, { useState } from 'react';
import { Search, FileText, Image, Twitter, Facebook, Save, Globe, Code, FileCode, BookOpen } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

const jsonldPresets = [
    { label: 'Article', value: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: "", author: "", datePublished: "", image: "" }, null, 2) },
    { label: 'Product', value: JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: "", description: "", image: "", brand: "", offers: { "@type": "Offer", price: "", priceCurrency: "USD" } }, null, 2) },
    { label: 'Organization', value: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: "", url: "", logo: "", contactPoint: { "@type": "ContactPoint", telephone: "", contactType: "customer service" } }, null, 2) },
    { label: 'LocalBusiness', value: JSON.stringify({ "@context": "https://schema.org", "@type": "LocalBusiness", name: "", address: { "@type": "PostalAddress", streetAddress: "", addressLocality: "", addressRegion: "", postalCode: "" }, telephone: "", openingHours: "" }, null, 2) },
    { label: 'FAQ', value: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "", acceptedAnswer: { "@type": "Answer", text: "" } }] }, null, 2) },
];

const defaultRobotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://example.com/sitemap.xml`;

const SeoSettings = () => {
    const { settings, updateSettings } = useSettingsStore();
    const [localSettings, setLocalSettings] = useState(settings.seo || {
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        twitterTitle: '',
        twitterDescription: '',
        twitterImage: '',
        enableSitemap: true,
        enableRobots: true,
        robotsTxt: defaultRobotsTxt,
        jsonld: '',
        canonicalUrl: '',
        enableCanonical: false,
    });

    const handleChange = (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        updateSettings('seo', localSettings);
        alert('SEO settings saved!');
    };

    const applyJsonldPreset = (preset) => {
        handleChange('jsonld', preset);
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-text-primary">SEO Settings</h3>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-text-secondary mb-1">Meta Title</label>
                    <input
                        type="text"
                        value={localSettings.metaTitle}
                        onChange={(e) => handleChange('metaTitle', e.target.value)}
                        placeholder="My Site - Best Website Builder"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-text-secondary mt-1">Recommended length: 50-60 characters</p>
                </div>

                <div>
                    <label className="block text-sm text-text-secondary mb-1">Meta Description</label>
                    <textarea
                        value={localSettings.metaDescription}
                        onChange={(e) => handleChange('metaDescription', e.target.value)}
                        rows={3}
                        placeholder="This is my amazing website built with SuKit..."
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-text-secondary mt-1">Recommended length: 150-160 characters</p>
                </div>

                <div>
                    <label className="block text-sm text-text-secondary mb-1">Meta Keywords</label>
                    <input
                        type="text"
                        value={localSettings.metaKeywords}
                        onChange={(e) => handleChange('metaKeywords', e.target.value)}
                        placeholder="website, builder, seo, tools"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-text-secondary mt-1">Comma-separated keywords</p>
                </div>

                {/* Canonical URL */}
                <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-4 h-4 text-primary-500" />
                        <h4 className="font-medium text-text-primary">Canonical URL</h4>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-text-secondary">Enable Canonical URLs</label>
                            <button
                                onClick={() => handleChange('enableCanonical', !localSettings.enableCanonical)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                    localSettings.enableCanonical ? 'bg-primary-500' : 'bg-surface-light'
                                }`}
                            >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${
                                    localSettings.enableCanonical ? 'translate-x-4.5' : 'translate-x-0.5'
                                }`} />
                            </button>
                        </div>
                        {localSettings.enableCanonical && (
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Default Canonical URL</label>
                                <input
                                    type="text"
                                    value={localSettings.canonicalUrl}
                                    onChange={(e) => handleChange('canonicalUrl', e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Open Graph */}
                <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-4">
                        <Facebook className="w-4 h-4 text-primary-500" />
                        <h4 className="font-medium text-text-primary">Open Graph (Facebook)</h4>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">OG Title</label>
                            <input type="text" value={localSettings.ogTitle} onChange={(e) => handleChange('ogTitle', e.target.value)} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary" />
                        </div>
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">OG Description</label>
                            <textarea value={localSettings.ogDescription} onChange={(e) => handleChange('ogDescription', e.target.value)} rows={2} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary" />
                        </div>
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">OG Image URL</label>
                            <input type="text" value={localSettings.ogImage} onChange={(e) => handleChange('ogImage', e.target.value)} placeholder="https://example.com/og-image.jpg" className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary" />
                        </div>
                    </div>
                </div>

                {/* Twitter Card */}
                <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-4">
                        <Twitter className="w-4 h-4 text-primary-500" />
                        <h4 className="font-medium text-text-primary">Twitter Card</h4>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">Twitter Title</label>
                            <input type="text" value={localSettings.twitterTitle} onChange={(e) => handleChange('twitterTitle', e.target.value)} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary" />
                        </div>
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">Twitter Description</label>
                            <textarea value={localSettings.twitterDescription} onChange={(e) => handleChange('twitterDescription', e.target.value)} rows={2} className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary" />
                        </div>
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">Twitter Image URL</label>
                            <input type="text" value={localSettings.twitterImage} onChange={(e) => handleChange('twitterImage', e.target.value)} placeholder="https://example.com/twitter-image.jpg" className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary" />
                        </div>
                    </div>
                </div>

                {/* Structured Data (JSON-LD) */}
                <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-4">
                        <FileCode className="w-4 h-4 text-primary-500" />
                        <h4 className="font-medium text-text-primary">Structured Data (JSON-LD)</h4>
                    </div>
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {jsonldPresets.map((preset) => (
                                <button
                                    key={preset.label}
                                    onClick={() => applyJsonldPreset(preset.value)}
                                    className="px-2 py-1 bg-primary-500/10 text-primary-500 rounded text-xs hover:bg-primary-500/20 transition-colors"
                                >
                                    {preset.label}
                                </button>
                            ))}
                            <button
                                onClick={() => handleChange('jsonld', '')}
                                className="px-2 py-1 bg-surface-light text-text-secondary rounded text-xs hover:bg-surface transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                        <textarea
                            value={localSettings.jsonld}
                            onChange={(e) => handleChange('jsonld', e.target.value)}
                            rows={8}
                            placeholder='{ "@context": "https://schema.org", "@type": "Organization", ... }'
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="text-xs text-text-secondary">Paste your JSON-LD structured data. Use presets above for common schemas.</p>
                    </div>
                </div>

                {/* Robots.txt */}
                <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-4 h-4 text-primary-500" />
                        <h4 className="font-medium text-text-primary">Robots.txt</h4>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-text-secondary">Custom robots.txt</label>
                            <button
                                onClick={() => handleChange('enableRobots', !localSettings.enableRobots)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                    localSettings.enableRobots ? 'bg-primary-500' : 'bg-surface-light'
                                }`}
                            >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${
                                    localSettings.enableRobots ? 'translate-x-4.5' : 'translate-x-0.5'
                                }`} />
                            </button>
                        </div>
                        {localSettings.enableRobots && (
                            <>
                                <textarea
                                    value={localSettings.robotsTxt}
                                    onChange={(e) => handleChange('robotsTxt', e.target.value)}
                                    rows={6}
                                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleChange('robotsTxt', defaultRobotsTxt)}
                                        className="px-2 py-1 text-xs bg-surface-light text-text-secondary rounded hover:bg-surface transition-colors"
                                    >
                                        Reset to Default
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Advanced SEO */}
                <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-4 h-4 text-primary-500" />
                        <h4 className="font-medium text-text-primary">Advanced SEO</h4>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-text-secondary">Generate Sitemap</label>
                            <button
                                onClick={() => handleChange('enableSitemap', !localSettings.enableSitemap)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                    localSettings.enableSitemap ? 'bg-primary-500' : 'bg-surface-light'
                                }`}
                            >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${
                                    localSettings.enableSitemap ? 'translate-x-4.5' : 'translate-x-0.5'
                                }`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
                <Save className="w-4 h-4" />
                Save SEO Settings
            </button>
        </div>
    );
};

export default SeoSettings;
