import React from 'react';
import { X, Box, Activity, FileText, Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ComponentInfoPanel = ({ componentType, onClose }) => {
    const info = {
        type: componentType,
        version: '1.0.0',
        usageCount: 12,
        createdAt: '2024-01-15',
        updatedAt: '2024-06-20',
        author: 'SUKIT Core',
        category: getCategory(componentType),
        description: `${componentType} component for building layouts and interfaces.`,
        dependencies: [],
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-surface rounded-xl w-full max-w-md shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center">
                            <Box className="w-4 h-4 text-primary-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-text-primary">{componentType}</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded hover:bg-surface-light">
                        <X className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>

                <div className="px-6 py-4 space-y-4">
                    <InfoRow icon={FileText} label="Type" value={info.type} />
                    <InfoRow icon={Activity} label="Version" value={info.version} />
                    <InfoRow icon={Activity} label="Category" value={info.category} />
                    <InfoRow icon={Box} label="Usage Count" value={`${info.usageCount} times`} />
                    <InfoRow icon={Calendar} label="Created" value={info.createdAt} />
                    <InfoRow icon={Calendar} label="Updated" value={info.updatedAt} />

                    <div className="pt-3 border-t border-border">
                        <p className="text-sm font-medium text-text-primary mb-2">Description</p>
                        <p className="text-sm text-text-secondary">{info.description}</p>
                    </div>

                    {info.dependencies.length > 0 && (
                        <div className="pt-3 border-t border-border">
                            <p className="text-sm font-medium text-text-primary mb-2">Dependencies</p>
                            <div className="flex flex-wrap gap-2">
                                {info.dependencies.map((dep) => (
                                    <span key={dep} className="px-2 py-1 bg-surface-light rounded text-xs text-text-secondary">
                                        {dep}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 px-6 py-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg text-text-primary hover:bg-surface-light transition-colors"
                    >
                        Close
                    </button>
                    <button className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                        View Documentation
                    </button>
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-text-secondary" />
            <span className="text-sm text-text-secondary">{label}</span>
        </div>
        <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
);

function getCategory(type) {
    const categories = {
        Container: 'Layout', Row: 'Layout', Column: 'Layout', Flexbox: 'Layout',
        Grid: 'Layout', Stack: 'Layout', Spacer: 'Layout', Divider: 'Layout',
        Heading: 'Typography', Paragraph: 'Typography', Text: 'Typography',
        RichText: 'Typography', Link: 'Typography', List: 'Typography',
        Quote: 'Typography', DropCap: 'Typography',
        Button: 'Form', Input: 'Form', Textarea: 'Form', Select: 'Form',
        Checkbox: 'Form', Radio: 'Form', Switch: 'Form', FileUpload: 'Form',
        Image: 'Media', Video: 'Media', Gallery: 'Media', Icon: 'Media',
        Avatar: 'Media', Map: 'Media', Lottie: 'Media',
        Header: 'Navigation', Footer: 'Navigation', Menu: 'Navigation',
        MegaMenu: 'Navigation', Breadcrumb: 'Navigation', Pagination: 'Navigation',
        BackToTop: 'Navigation', SocialIcons: 'Navigation',
        Table: 'Data', Chart: 'Data', Calendar: 'Data', Timeline: 'Data',
        Accordion: 'Data', Tabs: 'Data', Carousel: 'Data',
        PostsLoop: 'Data', Comments: 'Data', TagCloud: 'Data',
        ProductCard: 'E-commerce', ProductGrid: 'E-commerce', ShoppingCart: 'E-commerce',
        LoginForm: 'Auth', UserProfile: 'Auth', UserDirectory: 'Auth',
    };
    return categories[type] || 'Other';
}

ComponentInfoPanel.displayName = 'ComponentInfoPanel';
export default ComponentInfoPanel;
