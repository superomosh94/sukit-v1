import React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

const LivePreviewCard = ({ theme }) => {
    const [device, setDevice] = React.useState('desktop');

    const getDeviceWidth = () => {
        switch (device) {
            case 'mobile': return '375px';
            case 'tablet': return '768px';
            default: return '100%';
        }
    };

    return (
        <div className="bg-surface border border-border rounded-xl overflow-hidden sticky top-6">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-primary-500" />
                    <h3 className="font-semibold text-text-primary">Live Preview</h3>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => setDevice('desktop')}
                        className={`p-1.5 rounded transition-colors ${device === 'desktop' ? 'bg-primary-500 text-white' : 'text-text-secondary hover:bg-surface-light'}`}
                    >
                        <Monitor className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => setDevice('tablet')}
                        className={`p-1.5 rounded transition-colors ${device === 'tablet' ? 'bg-primary-500 text-white' : 'text-text-secondary hover:bg-surface-light'}`}
                    >
                        <Tablet className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => setDevice('mobile')}
                        className={`p-1.5 rounded transition-colors ${device === 'mobile' ? 'bg-primary-500 text-white' : 'text-text-secondary hover:bg-surface-light'}`}
                    >
                        <Smartphone className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <div className="p-4" style={{ backgroundColor: theme.colors?.background }}>
                <div 
                    className="mx-auto transition-all duration-300"
                    style={{ maxWidth: getDeviceWidth() }}
                >
                    {/* Navigation Bar */}
                    <div 
                        className="rounded-t-lg p-3 flex items-center justify-between"
                        style={{ backgroundColor: theme.colors?.surface, borderBottom: `1px solid ${theme.colors?.border}` }}
                    >
                        <span className="text-sm font-medium" style={{ color: theme.colors?.text }}>My Site</span>
                        <div className="flex gap-4">
                            <span className="text-xs" style={{ color: theme.colors?.textSecondary }}>Home</span>
                            <span className="text-xs" style={{ color: theme.colors?.textSecondary }}>About</span>
                            <span className="text-xs" style={{ color: theme.colors?.textSecondary }}>Contact</span>
                        </div>
                    </div>

                    {/* Hero Section */}
                    <div className="p-6 text-center">
                        <h1 
                            className="text-2xl font-bold mb-2"
                            style={{ 
                                fontFamily: theme.typography?.headings?.h1?.fontFamily || theme.typography?.base?.fontFamily,
                                fontSize: `${theme.typography?.headings?.h1?.fontSize || 28}px`,
                                fontWeight: theme.typography?.headings?.h1?.fontWeight || 700,
                                color: theme.colors?.text
                            }}
                        >
                            Welcome to Your Site
                        </h1>
                        <p 
                            className="text-sm mb-4"
                            style={{ 
                                fontFamily: theme.typography?.base?.fontFamily,
                                fontSize: `${theme.typography?.base?.fontSize || 14}px`,
                                lineHeight: theme.typography?.body?.lineHeight,
                                color: theme.colors?.textSecondary
                            }}
                        >
                            This is a live preview of your theme settings. Changes will appear in real-time.
                        </p>
                        <button 
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{ 
                                backgroundColor: theme.colors?.primary,
                                color: '#FFFFFF',
                                borderRadius: `${theme.borderRadius?.md || 8}px`
                            }}
                        >
                            Get Started
                        </button>
                    </div>

                    {/* Cards Section */}
                    <div className="grid grid-cols-2 gap-3 p-4">
                        <div 
                            className="p-3 rounded-lg"
                            style={{ 
                                backgroundColor: theme.colors?.surface,
                                border: `1px solid ${theme.colors?.border}`,
                                borderRadius: `${theme.borderRadius?.lg || 12}px`,
                                boxShadow: theme.shadows?.md
                            }}
                        >
                            <h4 className="text-sm font-semibold mb-1" style={{ color: theme.colors?.text }}>Card Title</h4>
                            <p className="text-xs" style={{ color: theme.colors?.textSecondary }}>Card content goes here</p>
                        </div>
                        <div 
                            className="p-3 rounded-lg"
                            style={{ 
                                backgroundColor: theme.colors?.surface,
                                border: `1px solid ${theme.colors?.border}`,
                                borderRadius: `${theme.borderRadius?.lg || 12}px`,
                                boxShadow: theme.shadows?.md
                            }}
                        >
                            <h4 className="text-sm font-semibold mb-1" style={{ color: theme.colors?.text }}>Another Card</h4>
                            <p className="text-xs" style={{ color: theme.colors?.textSecondary }}>More content here</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div 
                        className="p-3 text-center rounded-b-lg text-xs"
                        style={{ 
                            backgroundColor: theme.colors?.surface,
                            borderTop: `1px solid ${theme.colors?.border}`,
                            color: theme.colors?.textSecondary
                        }}
                    >
                        © 2024 Your Company. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivePreviewCard;
