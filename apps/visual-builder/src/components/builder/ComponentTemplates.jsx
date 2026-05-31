import React, { useState } from 'react';
import { Layout, Type, Image, FormInput, Navigation, Table2, ShoppingCart, Star, X, Download, Copy, Eye } from 'lucide-react';
import { cn } from '../../utils/cn';

const templateLibrary = {
    Container: [
        { name: 'Narrow Content', props: { maxWidth: 800, padding: 24 }, description: 'Centered content area, max 800px' },
        { name: 'Full Width', props: { maxWidth: 'full', padding: 16 }, description: 'Edge-to-edge container' },
        { name: 'Wide Layout', props: { maxWidth: 1400, padding: 32 }, description: 'Large centered container' },
    ],
    Heading: [
        { name: 'Page Title', props: { level: 'h1', text: 'Welcome to Our Site', fontSize: 48, color: '#111827', align: 'center' } },
        { name: 'Section Header', props: { level: 'h2', text: 'Our Services', fontSize: 32, color: '#374151', align: 'left' } },
        { name: 'Card Title', props: { level: 'h3', text: 'Feature Title', fontSize: 24, color: '#1F2937' } },
    ],
    Paragraph: [
        { name: 'Lead Text', props: { text: 'This is a lead paragraph that introduces the main content of the page. It has a larger font size for emphasis.', fontSize: 18, lineHeight: 1.8, color: '#4B5563' } },
        { name: 'Body Text', props: { text: 'Standard body paragraph for regular content. Good for articles, descriptions, and general text blocks across your site.', fontSize: 16, lineHeight: 1.6, color: '#6B7280' } },
        { name: 'Small Text', props: { text: 'Smaller text suitable for captions, footnotes, or secondary information.', fontSize: 14, lineHeight: 1.5, color: '#9CA3AF' } },
    ],
    Row: [
        { name: 'Two Columns', props: { gap: 6, justify: 'center', align: 'center' }, description: 'Two equal columns layout' },
        { name: 'Three Columns', props: { gap: 4, justify: 'between' }, description: 'Three columns with space between' },
        { name: 'Sidebar Layout', props: { gap: 8, justify: 'start', wrap: true }, description: 'Main content + sidebar' },
    ],
    Button: [
        { name: 'Primary CTA', props: { text: 'Get Started', variant: 'primary', size: 'lg' } },
        { name: 'Outline Button', props: { text: 'Learn More', variant: 'outline' } },
        { name: 'Small Button', props: { text: 'Submit', variant: 'primary', size: 'sm' } },
    ],
};

const categoryIcons = {
    Layout: Layout,
    Typography: Type,
    Media: Image,
    Form: FormInput,
    Navigation: Navigation,
    Data: Table2,
    'E-commerce': ShoppingCart,
};

export const ComponentTemplates = ({ componentType, onSelect, onClose }) => {
    const [selectedTab, setSelectedTab] = useState('all');
    const templates = templateLibrary[componentType] || [];
    const previewTemplate = templates[0];

    const categories = ['all', ...new Set(Object.keys(templateLibrary))];
    const filtered = selectedTab === 'all'
        ? templates
        : selectedTab === componentType ? templates : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-surface rounded-xl w-full max-w-2xl shadow-xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-text-primary">
                        {componentType} Templates
                    </h2>
                    <button onClick={onClose} className="p-1 rounded hover:bg-surface-light">
                        <X className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>

                <div className="flex gap-2 px-6 py-3 border-b border-border overflow-x-auto">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedTab(cat)}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors',
                                selectedTab === cat
                                    ? 'bg-primary-500/20 text-primary-500'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                            )}
                        >
                            {cat === 'all' ? 'All' : cat}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {filtered.length === 0 ? (
                        <div className="text-center py-12">
                            <Star className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                            <p className="text-text-primary mb-2">No templates available</p>
                            <p className="text-sm text-text-secondary">No pre-built templates for {componentType}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filtered.map((template, idx) => (
                                <div
                                    key={idx}
                                    className="bg-surface-light border border-border rounded-lg p-4 hover:border-primary-500 transition-colors group cursor-pointer"
                                    onClick={() => onSelect?.(template.props)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-medium text-text-primary">{template.name}</p>
                                            {template.description && (
                                                <p className="text-xs text-text-secondary mt-0.5">{template.description}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onSelect?.(template.props); }}
                                            className="p-1.5 rounded hover:bg-surface transition-opacity"
                                            title="Use Template"
                                        >
                                            <Copy className="w-3.5 h-3.5 text-primary-500" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {Object.entries(template.props).slice(0, 4).map(([key, val]) => (
                                            <span key={key} className="px-2 py-0.5 bg-surface rounded text-xs text-text-secondary">
                                                {key}: {String(val).slice(0, 20)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-3 px-6 py-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg text-text-primary hover:bg-surface-light transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

ComponentTemplates.displayName = 'ComponentTemplates';
export default ComponentTemplates;
