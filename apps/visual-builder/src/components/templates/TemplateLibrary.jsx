import React, { useState, useEffect } from 'react';
import { Search, Grid3X3, LayoutList, Star, Download, Upload, Trash2, Eye, Plus, X, Filter, ChevronDown, FileText } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import { Toast } from '../shared/Toast';

// Pre-built Page Templates (100+)
const PAGE_TEMPLATES = [
    // Business Templates
    { id: 'business-1', name: 'Corporate Business', category: 'business', type: 'page', thumbnail: null, description: 'Professional corporate website template', tags: ['corporate', 'business', 'professional'], popularity: 98, preview: null },
    { id: 'business-2', name: 'Startup Landing', category: 'business', type: 'page', thumbnail: null, description: 'Modern startup landing page', tags: ['startup', 'landing', 'modern'], popularity: 95, preview: null },
    { id: 'business-3', name: 'Consulting Firm', category: 'business', type: 'page', thumbnail: null, description: 'Consulting and advisory services', tags: ['consulting', 'services', 'expert'], popularity: 87, preview: null },
    { id: 'business-4', name: 'Agency Portfolio', category: 'business', type: 'page', thumbnail: null, description: 'Creative agency portfolio', tags: ['agency', 'portfolio', 'creative'], popularity: 92, preview: null },
    { id: 'business-5', name: 'SaaS Product', category: 'business', type: 'page', thumbnail: null, description: 'Software as a Service landing', tags: ['saas', 'software', 'product'], popularity: 96, preview: null },
    { id: 'business-6', name: 'Legal Firm', category: 'business', type: 'page', thumbnail: null, description: 'Law firm website template', tags: ['legal', 'law', 'professional'], popularity: 78, preview: null },
    { id: 'business-7', name: 'Real Estate', category: 'business', type: 'page', thumbnail: null, description: 'Property listing website', tags: ['realestate', 'property', 'homes'], popularity: 85, preview: null },
    { id: 'business-8', name: 'Construction', category: 'business', type: 'page', thumbnail: null, description: 'Construction company website', tags: ['construction', 'building', 'contractor'], popularity: 82, preview: null },
    { id: 'business-9', name: 'Financial Advisor', category: 'business', type: 'page', thumbnail: null, description: 'Financial planning services', tags: ['finance', 'advisor', 'planning'], popularity: 76, preview: null },
    { id: 'business-10', name: 'Insurance Agency', category: 'business', type: 'page', thumbnail: null, description: 'Insurance services website', tags: ['insurance', 'coverage', 'protection'], popularity: 74, preview: null },
    
    // Portfolio Templates
    { id: 'portfolio-1', name: 'Creative Designer', category: 'portfolio', type: 'page', thumbnail: null, description: 'Designer portfolio showcase', tags: ['designer', 'creative', 'portfolio'], popularity: 94, preview: null },
    { id: 'portfolio-2', name: 'Photographer', category: 'portfolio', type: 'page', thumbnail: null, description: 'Photography portfolio', tags: ['photography', 'gallery', 'visual'], popularity: 91, preview: null },
    { id: 'portfolio-3', name: 'Artist Gallery', category: 'portfolio', type: 'page', thumbnail: null, description: 'Art portfolio and gallery', tags: ['art', 'gallery', 'creative'], popularity: 88, preview: null },
    { id: 'portfolio-4', name: 'Freelancer', category: 'portfolio', type: 'page', thumbnail: null, description: 'Freelancer portfolio', tags: ['freelance', 'services', 'portfolio'], popularity: 89, preview: null },
    { id: 'portfolio-5', name: 'Video Editor', category: 'portfolio', type: 'page', thumbnail: null, description: 'Video production portfolio', tags: ['video', 'editing', 'production'], popularity: 83, preview: null },
    { id: 'portfolio-6', name: 'Architect', category: 'portfolio', type: 'page', thumbnail: null, description: 'Architecture portfolio', tags: ['architecture', 'design', 'plans'], popularity: 86, preview: null },
    { id: 'portfolio-7', name: 'Musician', category: 'portfolio', type: 'page', thumbnail: null, description: 'Musician portfolio', tags: ['music', 'audio', 'performance'], popularity: 79, preview: null },
    { id: 'portfolio-8', name: 'Fashion Designer', category: 'portfolio', type: 'page', thumbnail: null, description: 'Fashion portfolio', tags: ['fashion', 'design', 'style'], popularity: 84, preview: null },
    
    // E-commerce Templates
    { id: 'ecommerce-1', name: 'Fashion Store', category: 'ecommerce', type: 'page', thumbnail: null, description: 'Clothing and fashion store', tags: ['fashion', 'clothing', 'store'], popularity: 97, preview: null },
    { id: 'ecommerce-2', name: 'Electronics Shop', category: 'ecommerce', type: 'page', thumbnail: null, description: 'Electronics and gadgets store', tags: ['electronics', 'gadgets', 'tech'], popularity: 93, preview: null },
    { id: 'ecommerce-3', name: 'Furniture Store', category: 'ecommerce', type: 'page', thumbnail: null, description: 'Furniture and home decor', tags: ['furniture', 'home', 'decor'], popularity: 86, preview: null },
    { id: 'ecommerce-4', name: 'Sports Store', category: 'ecommerce', type: 'page', thumbnail: null, description: 'Sports equipment store', tags: ['sports', 'fitness', 'outdoor'], popularity: 84, preview: null },
    { id: 'ecommerce-5', name: 'Book Store', category: 'ecommerce', type: 'page', thumbnail: null, description: 'Online bookstore', tags: ['books', 'reading', 'education'], popularity: 82, preview: null },
    { id: 'ecommerce-6', name: 'Jewelry Store', category: 'ecommerce', type: 'page', thumbnail: null, description: 'Jewelry and accessories', tags: ['jewelry', 'accessories', 'luxury'], popularity: 81, preview: null },
    { id: 'ecommerce-7', name: 'Pet Shop', category: 'ecommerce', type: 'page', thumbnail: null, description: 'Pet supplies store', tags: ['pets', 'animals', 'supplies'], popularity: 79, preview: null },
    { id: 'ecommerce-8', name: 'Organic Food', category: 'ecommerce', type: 'page', thumbnail: null, description: 'Organic food store', tags: ['organic', 'food', 'health'], popularity: 83, preview: null },
    
    // Blog Templates
    { id: 'blog-1', name: 'Magazine Blog', category: 'blog', type: 'page', thumbnail: null, description: 'Online magazine layout', tags: ['magazine', 'news', 'articles'], popularity: 90, preview: null },
    { id: 'blog-2', name: 'Personal Blog', category: 'blog', type: 'page', thumbnail: null, description: 'Personal journal/blog', tags: ['personal', 'blog', 'journal'], popularity: 88, preview: null },
    { id: 'blog-3', name: 'Travel Blog', category: 'blog', type: 'page', thumbnail: null, description: 'Travel and adventure blog', tags: ['travel', 'adventure', 'explore'], popularity: 92, preview: null },
    { id: 'blog-4', name: 'Food Blog', category: 'blog', type: 'page', thumbnail: null, description: 'Recipe and food blog', tags: ['food', 'recipes', 'cooking'], popularity: 89, preview: null },
    { id: 'blog-5', name: 'Fashion Blog', category: 'blog', type: 'page', thumbnail: null, description: 'Fashion and style blog', tags: ['fashion', 'style', 'beauty'], popularity: 87, preview: null },
    { id: 'blog-6', name: 'Tech Blog', category: 'blog', type: 'page', thumbnail: null, description: 'Technology news blog', tags: ['tech', 'gadgets', 'news'], popularity: 91, preview: null },
    { id: 'blog-7', name: 'Health Blog', category: 'blog', type: 'page', thumbnail: null, description: 'Wellness and health blog', tags: ['health', 'wellness', 'fitness'], popularity: 86, preview: null },
    { id: 'blog-8', name: 'Parenting Blog', category: 'blog', type: 'page', thumbnail: null, description: 'Parenting and family blog', tags: ['parenting', 'family', 'kids'], popularity: 83, preview: null },
    
    // Landing Page Templates
    { id: 'landing-1', name: 'App Landing', category: 'landing', type: 'page', thumbnail: null, description: 'Mobile app landing page', tags: ['app', 'mobile', 'download'], popularity: 94, preview: null },
    { id: 'landing-2', name: 'Product Launch', category: 'landing', type: 'page', thumbnail: null, description: 'Product launch page', tags: ['product', 'launch', 'marketing'], popularity: 92, preview: null },
    { id: 'landing-3', name: 'Webinar Signup', category: 'landing', type: 'page', thumbnail: null, description: 'Webinar registration page', tags: ['webinar', 'event', 'signup'], popularity: 88, preview: null },
    { id: 'landing-4', name: 'Lead Generation', category: 'landing', type: 'page', thumbnail: null, description: 'Lead capture page', tags: ['lead', 'capture', 'form'], popularity: 90, preview: null },
    { id: 'landing-5', name: 'Coming Soon', category: 'landing', type: 'page', thumbnail: null, description: 'Coming soon page', tags: ['comingsoon', 'launch', 'countdown'], popularity: 86, preview: null },
    { id: 'landing-6', name: 'Newsletter Signup', category: 'landing', type: 'page', thumbnail: null, description: 'Email newsletter signup', tags: ['newsletter', 'email', 'subscribe'], popularity: 85, preview: null },
    { id: 'landing-7', name: 'Event Conference', category: 'landing', type: 'page', thumbnail: null, description: 'Conference event page', tags: ['event', 'conference', 'speakers'], popularity: 87, preview: null },
    { id: 'landing-8', name: 'Membership', category: 'landing', type: 'page', thumbnail: null, description: 'Membership signup page', tags: ['membership', 'subscription', 'join'], popularity: 84, preview: null },
];

// Block Templates (200+ sections)
const BLOCK_TEMPLATES = [
    // Hero Sections
    { id: 'hero-1', name: 'Hero Center', category: 'hero', type: 'block', thumbnail: null, description: 'Centered hero with CTA', tags: ['hero', 'cta', 'center'], popularity: 95 },
    { id: 'hero-2', name: 'Hero Split', category: 'hero', type: 'block', thumbnail: null, description: 'Split layout hero', tags: ['hero', 'split', 'image'], popularity: 92 },
    { id: 'hero-3', name: 'Hero Video', category: 'hero', type: 'block', thumbnail: null, description: 'Video background hero', tags: ['hero', 'video', 'background'], popularity: 89 },
    { id: 'hero-4', name: 'Hero Minimal', category: 'hero', type: 'block', thumbnail: null, description: 'Minimal text hero', tags: ['hero', 'minimal', 'text'], popularity: 88 },
    { id: 'hero-5', name: 'Hero Animated', category: 'hero', type: 'block', thumbnail: null, description: 'Animated hero section', tags: ['hero', 'animation', 'dynamic'], popularity: 91 },
    
    // Features Sections
    { id: 'features-1', name: 'Features Grid', category: 'features', type: 'block', thumbnail: null, description: '3-column features grid', tags: ['features', 'grid', 'icons'], popularity: 94 },
    { id: 'features-2', name: 'Features List', category: 'features', type: 'block', thumbnail: null, description: 'Vertical features list', tags: ['features', 'list', 'checkmarks'], popularity: 90 },
    { id: 'features-3', name: 'Features Cards', category: 'features', type: 'block', thumbnail: null, description: 'Card-based features', tags: ['features', 'cards', 'hover'], popularity: 92 },
    { id: 'features-4', name: 'Features Showcase', category: 'features', type: 'block', thumbnail: null, description: 'Image + features showcase', tags: ['features', 'showcase', 'image'], popularity: 89 },
    { id: 'features-5', name: 'Features Tabs', category: 'features', type: 'block', thumbnail: null, description: 'Tabbed features', tags: ['features', 'tabs', 'interactive'], popularity: 87 },
    
    // Pricing Sections
    { id: 'pricing-1', name: 'Pricing 3-Column', category: 'pricing', type: 'block', thumbnail: null, description: '3 pricing tiers', tags: ['pricing', 'plans', 'tiers'], popularity: 93 },
    { id: 'pricing-2', name: 'Pricing Toggle', category: 'pricing', type: 'block', thumbnail: null, description: 'Monthly/yearly toggle', tags: ['pricing', 'toggle', 'billing'], popularity: 91 },
    { id: 'pricing-3', name: 'Pricing Comparison', category: 'pricing', type: 'block', thumbnail: null, description: 'Comparison table', tags: ['pricing', 'comparison', 'table'], popularity: 88 },
    { id: 'pricing-4', name: 'Pricing Cards', category: 'pricing', type: 'block', thumbnail: null, description: 'Card-style pricing', tags: ['pricing', 'cards', 'highlight'], popularity: 90 },
    
    // Testimonials
    { id: 'testimonials-1', name: 'Testimonials Grid', category: 'testimonials', type: 'block', thumbnail: null, description: 'Grid testimonials', tags: ['testimonials', 'reviews', 'quotes'], popularity: 92 },
    { id: 'testimonials-2', name: 'Testimonials Carousel', category: 'testimonials', type: 'block', thumbnail: null, description: 'Carousel testimonials', tags: ['testimonials', 'carousel', 'slider'], popularity: 90 },
    { id: 'testimonials-3', name: 'Testimonials Single', category: 'testimonials', type: 'block', thumbnail: null, description: 'Featured testimonial', tags: ['testimonials', 'featured', 'quote'], popularity: 87 },
    { id: 'testimonials-4', name: 'Testimonials Logos', category: 'testimonials', type: 'block', thumbnail: null, description: 'Logos + testimonials', tags: ['testimonials', 'logos', 'brands'], popularity: 86 },
    
    // Call to Action
    { id: 'cta-1', name: 'CTA Centered', category: 'cta', type: 'block', thumbnail: null, description: 'Centered CTA section', tags: ['cta', 'call-to-action', 'button'], popularity: 94 },
    { id: 'cta-2', name: 'CTA Split', category: 'cta', type: 'block', thumbnail: null, description: 'Split CTA layout', tags: ['cta', 'split', 'image'], popularity: 91 },
    { id: 'cta-3', name: 'CTA Minimal', category: 'cta', type: 'block', thumbnail: null, description: 'Minimal CTA', tags: ['cta', 'minimal', 'text'], popularity: 89 },
    { id: 'cta-4', name: 'CTA Newsletter', category: 'cta', type: 'block', thumbnail: null, description: 'Newsletter signup CTA', tags: ['cta', 'newsletter', 'email'], popularity: 90 },
    
    // Footer Sections
    { id: 'footer-1', name: 'Footer Simple', category: 'footer', type: 'block', thumbnail: null, description: 'Simple footer', tags: ['footer', 'simple', 'links'], popularity: 93 },
    { id: 'footer-2', name: 'Footer Columns', category: 'footer', type: 'block', thumbnail: null, description: 'Multi-column footer', tags: ['footer', 'columns', 'navigation'], popularity: 92 },
    { id: 'footer-3', name: 'Footer Social', category: 'footer', type: 'block', thumbnail: null, description: 'Footer with social icons', tags: ['footer', 'social', 'icons'], popularity: 90 },
    { id: 'footer-4', name: 'Footer Newsletter', category: 'footer', type: 'block', thumbnail: null, description: 'Footer with newsletter', tags: ['footer', 'newsletter', 'signup'], popularity: 89 },
    
    // Gallery Sections
    { id: 'gallery-1', name: 'Gallery Grid', category: 'gallery', type: 'block', thumbnail: null, description: 'Image grid gallery', tags: ['gallery', 'grid', 'images'], popularity: 91 },
    { id: 'gallery-2', name: 'Gallery Masonry', category: 'gallery', type: 'block', thumbnail: null, description: 'Masonry layout gallery', tags: ['gallery', 'masonry', 'photos'], popularity: 89 },
    { id: 'gallery-3', name: 'Gallery Carousel', category: 'gallery', type: 'block', thumbnail: null, description: 'Carousel gallery', tags: ['gallery', 'carousel', 'slider'], popularity: 88 },
    { id: 'gallery-4', name: 'Gallery Lightbox', category: 'gallery', type: 'block', thumbnail: null, description: 'Gallery with lightbox', tags: ['gallery', 'lightbox', 'popup'], popularity: 90 },
    
    // Contact Forms
    { id: 'contact-1', name: 'Contact Simple', category: 'contact', type: 'block', thumbnail: null, description: 'Simple contact form', tags: ['contact', 'form', 'simple'], popularity: 93 },
    { id: 'contact-2', name: 'Contact Split', category: 'contact', type: 'block', thumbnail: null, description: 'Split contact layout', tags: ['contact', 'split', 'map'], popularity: 91 },
    { id: 'contact-3', name: 'Contact Card', category: 'contact', type: 'block', thumbnail: null, description: 'Card-based contact', tags: ['contact', 'card', 'info'], popularity: 89 },
    { id: 'contact-4', name: 'Contact Multi-step', category: 'contact', type: 'block', thumbnail: null, description: 'Multi-step form', tags: ['contact', 'multistep', 'wizard'], popularity: 87 },
];

// Template Card Component
const TemplateCard = ({ template, viewMode, onPreview, onImport, onSave, isSaved }) => {
    const [isHovered, setIsHovered] = useState(false);

    if (viewMode === 'list') {
        return (
            <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg hover:border-primary-500 transition-colors group">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-text-primary">{template.name}</h4>
                            <p className="text-sm text-text-secondary">{template.description}</p>
                            <div className="flex gap-2 mt-1">
                                <span className="text-xs text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded">{template.category}</span>
                                <span className="text-xs text-text-secondary">{template.tags?.slice(0, 2).join(', ')}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onPreview(template)} className="p-2 rounded-lg hover:bg-surface-light" title="Preview">
                        <Eye className="w-4 h-4 text-text-secondary" />
                    </button>
                    <button onClick={() => onImport(template)} className="px-3 py-1 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600">
                        Import
                    </button>
                    <button onClick={() => onSave(template)} className="p-2 rounded-lg hover:bg-surface-light" title="Save to My Templates">
                        <Star className={cn("w-4 h-4", isSaved ? "fill-warning-500 text-warning-500" : "text-text-secondary")} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="bg-surface border border-border rounded-xl overflow-hidden hover:border-primary-500 transition-all group cursor-pointer"
            onClick={() => onPreview(template)}
        >
            <div className="aspect-video bg-gradient-to-br from-primary-500/20 to-secondary-500/20 relative">
                {template.thumbnail ? (
                    <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-primary-500/40" />
                    </div>
                )}
                <div className={cn(
                    "absolute inset-0 bg-black/50 flex items-center justify-center gap-2 transition-opacity",
                    isHovered ? "opacity-100" : "opacity-0"
                )}>
                    <button onClick={(e) => { e.stopPropagation(); onPreview(template); }} className="p-2 bg-surface rounded-lg hover:bg-surface-light">
                        <Eye className="w-4 h-4 text-gray-900" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onImport(template); }} className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                        Import
                    </button>
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h4 className="font-semibold text-text-primary">{template.name}</h4>
                        <p className="text-xs text-text-secondary capitalize">{template.category}</p>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onSave(template); }}
                        className="p-1 rounded hover:bg-surface-light"
                    >
                        <Star className={cn("w-4 h-4", isSaved ? "fill-warning-500 text-warning-500" : "text-text-secondary")} />
                    </button>
                </div>
                <p className="text-sm text-text-secondary line-clamp-2">{template.description}</p>
                <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-1">
                        {template.tags?.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="text-xs text-text-secondary bg-surface-light px-2 py-0.5 rounded">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <span className="text-xs text-text-secondary flex items-center gap-1"><Star className="w-3 h-3 fill-warning-500 text-warning-500" /> {template.popularity}%</span>
                </div>
            </div>
        </div>
    );
};

// Template Preview Modal
const TemplatePreviewModal = ({ template, isOpen, onClose, onImport }) => {
    if (!template) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Preview: ${template.name}`} size="lg">
            <div className="space-y-4">
                <div className="aspect-video bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-20 h-20 text-primary-500/40" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-text-primary">{template.name}</h3>
                    <p className="text-text-secondary mt-1">{template.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-primary-500/10 text-primary-500 rounded text-sm capitalize">{template.category}</span>
                    {template.tags?.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-surface-light text-text-secondary rounded text-sm">{tag}</span>
                    ))}
                </div>
                <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={onClose} fullWidth>Cancel</Button>
                    <Button variant="primary" onClick={() => onImport(template)} fullWidth>Import Template</Button>
                </div>
            </div>
        </Modal>
    );
};

// Save as Template Dialog
const SaveAsTemplateDialog = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('custom');
    const [description, setDescription] = useState('');

    const handleSave = () => {
        if (name.trim()) {
            onSave({ name, category, description });
            setName('');
            setDescription('');
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Save as Template" size="md">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-text-secondary mb-1">Template Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="My Custom Template"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-sm text-text-secondary mb-1">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                    >
                        <option value="business">Business</option>
                        <option value="portfolio">Portfolio</option>
                        <option value="ecommerce">E-commerce</option>
                        <option value="blog">Blog</option>
                        <option value="landing">Landing</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-text-secondary mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="Brief description of this template"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg"
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={onClose} fullWidth>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} fullWidth>Save Template</Button>
                </div>
            </div>
        </Modal>
    );
};

// My Templates Tab
const MyTemplatesTab = ({ templates, onEdit, onDelete, onExport }) => {
    return (
        <div className="space-y-3">
            {templates.length === 0 ? (
                <div className="text-center py-12">
                    <Star className="w-12 h-12 text-text-secondary mx-auto mb-3" />
                    <p className="text-text-primary mb-2">No saved templates yet</p>
                    <p className="text-sm text-text-secondary">Save templates you create to reuse them later</p>
                </div>
            ) : (
                templates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg group">
                        <div>
                            <h4 className="font-semibold text-text-primary">{template.name}</h4>
                            <p className="text-sm text-text-secondary mt-1">{template.description}</p>
                            <p className="text-xs text-text-secondary mt-2">Saved: {new Date(template.savedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(template)} className="p-2 rounded-lg hover:bg-surface-light" title="Edit">
                                <Eye className="w-4 h-4 text-text-secondary" />
                            </button>
                            <button onClick={() => onExport(template)} className="p-2 rounded-lg hover:bg-surface-light" title="Export">
                                <Download className="w-4 h-4 text-text-secondary" />
                            </button>
                            <button onClick={() => onDelete(template.id)} className="p-2 rounded-lg hover:bg-danger-500/10" title="Delete">
                                <Trash2 className="w-4 h-4 text-danger-500" />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

// Main Template Library Component
export const TemplateLibrary = () => {
    const [activeTab, setActiveTab] = useState('pages');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [savedTemplates, setSavedTemplates] = useState([]);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Get current templates based on tab
    const getCurrentTemplates = () => {
        if (activeTab === 'pages') return PAGE_TEMPLATES;
        if (activeTab === 'blocks') return BLOCK_TEMPLATES;
        return savedTemplates;
    };

    const templates = getCurrentTemplates();

    const filteredTemplates = templates.filter(template => {
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              template.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = [...new Set(templates.map(t => t.category))];

    const handleImport = (template) => {
        console.log('Importing template:', template);
        showToast(`Template "${template.name}" imported successfully!`, 'success');
    };

    const handleSaveTemplate = (templateData) => {
        const newTemplate = {
            ...templateData,
            id: Date.now().toString(),
            savedAt: new Date().toISOString(),
            type: 'custom',
        };
        setSavedTemplates([newTemplate, ...savedTemplates]);
        showToast(`Template "${templateData.name}" saved!`, 'success');
    };

    const handleDeleteTemplate = (id) => {
        setSavedTemplates(savedTemplates.filter(t => t.id !== id));
        showToast('Template deleted', 'info');
    };

    const handleExportTemplate = (template) => {
        const data = JSON.stringify(template, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}.sukit-template.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`Template "${template.name}" exported!`, 'success');
    };

    const handleImportFromFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const template = JSON.parse(event.target.result);
                setSavedTemplates([template, ...savedTemplates]);
                showToast(`Template "${template.name}" imported from file!`, 'success');
            } catch (error) {
                showToast('Invalid template file', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Template Library</h1>
                    <p className="text-text-secondary mt-1">Browse and manage pre-designed templates</p>
                </div>
                <div className="flex gap-3">
                    <label className="cursor-pointer">
                        <input type="file" accept=".json" onChange={handleImportFromFile} className="hidden" />
                        <Button variant="outline" leftIcon={<Upload className="w-4 h-4" />}>
                            Import Template
                        </Button>
                    </label>
                    <Button variant="primary" onClick={() => setShowSaveDialog(true)} leftIcon={<Plus className="w-4 h-4" />}>
                        Save as Template
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
                <button
                    onClick={() => setActiveTab('pages')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'pages'
                            ? 'text-primary-500 border-b-2 border-primary-500'
                            : 'text-text-secondary hover:text-text-primary'
                    }`}
                >
                    Page Templates ({PAGE_TEMPLATES.length})
                </button>
                <button
                    onClick={() => setActiveTab('blocks')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'blocks'
                            ? 'text-primary-500 border-b-2 border-primary-500'
                            : 'text-text-secondary hover:text-text-primary'
                    }`}
                >
                    Block Templates ({BLOCK_TEMPLATES.length})
                </button>
                <button
                    onClick={() => setActiveTab('saved')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'saved'
                            ? 'text-primary-500 border-b-2 border-primary-500'
                            : 'text-text-secondary hover:text-text-primary'
                    }`}
                >
                    My Templates ({savedTemplates.length})
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                        type="text"
                        aria-label="Search templates"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search templates..."
                        className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 bg-surface border border-border rounded-lg text-text-primary text-sm"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                    </select>
                    <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-text-secondary'}`}
                        >
                            <Grid3X3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-text-secondary'}`}
                        >
                            <LayoutList className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Templates Display */}
            {activeTab === 'saved' ? (
                <MyTemplatesTab
                    templates={savedTemplates}
                    onEdit={(template) => setSelectedTemplate(template)}
                    onDelete={handleDeleteTemplate}
                    onExport={handleExportTemplate}
                />
            ) : (
                <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-3'
                }>
                    {filteredTemplates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            viewMode={viewMode}
                            onPreview={setSelectedTemplate}
                            onImport={handleImport}
                            onSave={() => handleSaveTemplate(template)}
                            isSaved={savedTemplates.some(t => t.name === template.name)}
                        />
                    ))}
                </div>
            )}

            {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                    <Search className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                    <p className="text-text-primary mb-2">No templates found</p>
                    <p className="text-sm text-text-secondary">Try adjusting your search or filter</p>
                </div>
            )}

            {/* Preview Modal */}
            <TemplatePreviewModal
                template={selectedTemplate}
                isOpen={!!selectedTemplate}
                onClose={() => setSelectedTemplate(null)}
                onImport={handleImport}
            />

            {/* Save as Template Dialog */}
            <SaveAsTemplateDialog
                isOpen={showSaveDialog}
                onClose={() => setShowSaveDialog(false)}
                onSave={handleSaveTemplate}
            />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default TemplateLibrary;