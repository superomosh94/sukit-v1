import React, { useState } from 'react';
import { Palette, Type, Square, Layers, Moon, Code2, Monitor, Download, Upload } from 'lucide-react';
import ColorPalette from '../components/theme/ColorPalette';
import TypographyPanel from '../components/theme/TypographyPanel';
import SpacingControl from '../components/theme/SpacingControl';
import BorderRadiusControl from '../components/theme/BorderRadiusControl';
import ShadowControl from '../components/theme/ShadowControl';
import DarkModeToggle from '../components/theme/DarkModeToggle';
import CustomCSSEditor from '../components/theme/CustomCSSEditor';
import LivePreviewCard from '../components/theme/LivePreviewCard';
import ThemeExportButton from '../components/theme/ThemeExportButton';
import ThemeImportButton from '../components/theme/ThemeImportButton';
import { useThemeStore } from '../stores/themeStore';

const ThemeDesigner = () => {
    const [activeSection, setActiveSection] = useState('colors');
    const { colors, typography, spacing, borderRadius, shadows, isDark, updateColors, updateTypography, updateSpacing, updateBorderRadius, updateShadows, toggleDarkMode, setCustomCSS, resetTheme } = useThemeStore();

    const sections = [
        { id: 'colors', name: 'Colors', icon: Palette, description: 'Brand color palette' },
        { id: 'typography', name: 'Typography', icon: Type, description: 'Fonts and text styles' },
        { id: 'spacing', name: 'Spacing', icon: Square, description: 'Margin and padding' },
        { id: 'radius', name: 'Border Radius', icon: Square, description: 'Corner rounding' },
        { id: 'shadows', name: 'Shadows', icon: Layers, description: 'Box shadows' },
        { id: 'darkmode', name: 'Dark Mode', icon: Moon, description: 'Dark/light theme' },
        { id: 'css', name: 'Custom CSS', icon: Code2, description: 'Custom styles' },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'colors':
                return <ColorPalette colors={colors} onChange={updateColors} />;
            case 'typography':
                return <TypographyPanel typography={typography} onChange={updateTypography} />;
            case 'spacing':
                return <SpacingControl spacing={spacing} onChange={updateSpacing} />;
            case 'radius':
                return <BorderRadiusControl borderRadius={borderRadius} onChange={updateBorderRadius} />;
            case 'shadows':
                return <ShadowControl shadows={shadows} onChange={updateShadows} />;
            case 'darkmode':
                return <DarkModeToggle isDark={isDark} onToggle={toggleDarkMode} />;
            case 'css':
                return <CustomCSSEditor onSave={setCustomCSS} />;
            default:
                return null;
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Theme Designer</h1>
                    <p className="text-text-secondary mt-1">Customize your site's appearance globally</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={resetTheme}
                        className="px-4 py-2 bg-surface border border-border rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                    >
                        Reset to Default
                    </button>
                    <ThemeImportButton onImport={(theme) => {
                        updateColors(theme.colors);
                        updateTypography(theme.typography);
                        updateSpacing(theme.spacing);
                        updateBorderRadius(theme.borderRadius);
                        updateShadows(theme.shadows);
                        if (theme.isDark !== undefined) toggleDarkMode();
                    }} />
                    <ThemeExportButton theme={{ colors, typography, spacing, borderRadius, shadows, isDark }} />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex gap-6">
                {/* Left Sidebar - Sections */}
                <div className="w-64 shrink-0 space-y-1">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                                activeSection === section.id
                                    ? 'bg-primary-500/20 text-primary-500'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                            }`}
                        >
                            <section.icon className="w-4 h-4" />
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium">{section.name}</p>
                                <p className="text-xs opacity-70">{section.description}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Center - Content */}
                <div className="flex-1 space-y-6">
                    {renderContent()}
                </div>

                {/* Right Sidebar - Live Preview */}
                <div className="w-96 shrink-0">
                    <LivePreviewCard theme={{ colors, typography, spacing, borderRadius, shadows, isDark }} />
                </div>
            </div>
        </div>
    );
};

export default ThemeDesigner;
