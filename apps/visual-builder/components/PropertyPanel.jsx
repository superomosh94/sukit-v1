import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../stores/editorStore';

export const PropertyPanel = () => {
    const { components, selectedComponentId, updateComponent } = useEditorStore();
    const [activeTab, setActiveTab] = useState('content');
    const [localProps, setLocalProps] = useState({});

    const selectedComponent = components.find(c => c.id === selectedComponentId);

    useEffect(() => {
        if (selectedComponent) {
            setLocalProps(selectedComponent.props || {});
        } else {
            setLocalProps({});
        }
    }, [selectedComponent]);

    const handlePropChange = (key, value) => {
        const newProps = { ...localProps, [key]: value };
        setLocalProps(newProps);
        updateComponent(selectedComponentId, { props: newProps });
    };

    const handleStyleChange = (key, value) => {
        const currentStyles = selectedComponent?.styles || {};
        const newStyles = { ...currentStyles, [key]: value };
        updateComponent(selectedComponentId, { styles: newStyles });
    };

    if (!selectedComponent) {
        return (
            <div className="property-panel">
                <div className="panel-empty"><p>Select a component to edit its properties</p></div>
            </div>
        );
    }

    const renderContentTab = () => {
        switch (selectedComponent.type) {
            case 'Button':
                return (
                    <>
                        <div className="property-group">
                            <label>Text</label>
                            <input
                                type="text"
                                value={localProps.text || ''}
                                onChange={e => handlePropChange('text', e.target.value)}
                            />
                        </div>
                        <div className="property-group">
                            <label>Link</label>
                            <input
                                type="text"
                                value={localProps.link || ''}
                                onChange={e => handlePropChange('link', e.target.value)}
                                placeholder="/page-url"
                            />
                        </div>
                        <div className="property-group">
                            <label>Target</label>
                            <select
                                value={localProps.target || '_self'}
                                onChange={e => handlePropChange('target', e.target.value)}
                            >
                                <option value="_self">Same window</option>
                                <option value="_blank">New window</option>
                            </select>
                        </div>
                    </>
                );
            case 'Heading':
                return (
                    <>
                        <div className="property-group">
                            <label>Text</label>
                            <input
                                type="text"
                                value={localProps.text || ''}
                                onChange={e => handlePropChange('text', e.target.value)}
                            />
                        </div>
                        <div className="property-group">
                            <label>Level</label>
                            <select
                                value={localProps.level || 'h1'}
                                onChange={e => handlePropChange('level', e.target.value)}
                            >
                                <option value="h1">H1 - Largest</option>
                                <option value="h2">H2</option>
                                <option value="h3">H3</option>
                                <option value="h4">H4</option>
                                <option value="h5">H5</option>
                                <option value="h6">H6 - Smallest</option>
                            </select>
                        </div>
                    </>
                );
            case 'Image':
                return (
                    <>
                        <div className="property-group">
                            <label>Image URL</label>
                            <input
                                type="text"
                                value={localProps.src || ''}
                                onChange={e => handlePropChange('src', e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        <div className="property-group">
                            <label>Alt Text</label>
                            <input
                                type="text"
                                value={localProps.alt || ''}
                                onChange={e => handlePropChange('alt', e.target.value)}
                            />
                        </div>
                    </>
                );
            default:
                return (
                    <div className="property-group">
                        <label>Text</label>
                        <input
                            type="text"
                            value={localProps.text || selectedComponent.type}
                            onChange={e => handlePropChange('text', e.target.value)}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="property-panel">
            <div className="panel-header">
                <h3>Properties</h3>
                <div className="component-type">{selectedComponent.type}</div>
            </div>
            <div className="panel-tabs">
                <button className={`tab ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>Content</button>
                <button className={`tab ${activeTab === 'style' ? 'active' : ''}`} onClick={() => setActiveTab('style')}>Style</button>
                <button className={`tab ${activeTab === 'advanced' ? 'active' : ''}`} onClick={() => setActiveTab('advanced')}>Advanced</button>
            </div>
            <div className="panel-content">
                {activeTab === 'content' && renderContentTab()}
                {activeTab === 'style' && (
                    <>
                        <div className="property-group">
                            <label>Background Color</label>
                            <input
                                type="color"
                                value={selectedComponent.styles?.backgroundColor || '#ffffff'}
                                onChange={e => handleStyleChange('backgroundColor', e.target.value)}
                            />
                        </div>
                        <div className="property-group">
                            <label>Text Color</label>
                            <input
                                type="color"
                                value={selectedComponent.styles?.color || '#333333'}
                                onChange={e => handleStyleChange('color', e.target.value)}
                            />
                        </div>
                        <div className="property-group">
                            <label>Padding (px)</label>
                            <input
                                type="number"
                                value={parseInt(selectedComponent.styles?.padding) || 0}
                                onChange={e => handleStyleChange('padding', e.target.value + 'px')}
                            />
                        </div>
                        <div className="property-group">
                            <label>Margin (px)</label>
                            <input
                                type="number"
                                value={parseInt(selectedComponent.styles?.margin) || 0}
                                onChange={e => handleStyleChange('margin', e.target.value + 'px')}
                            />
                        </div>
                        <div className="property-group">
                            <label>Border Radius (px)</label>
                            <input
                                type="number"
                                value={parseInt(selectedComponent.styles?.borderRadius) || 0}
                                onChange={e => handleStyleChange('borderRadius', e.target.value + 'px')}
                            />
                        </div>
                    </>
                )}
                {activeTab === 'advanced' && (
                    <>
                        <div className="property-group">
                            <label>ID</label>
                            <input
                                type="text"
                                value={selectedComponent.props?.id || ''}
                                onChange={e => handlePropChange('id', e.target.value)}
                            />
                        </div>
                        <div className="property-group">
                            <label>CSS Classes</label>
                            <input
                                type="text"
                                value={selectedComponent.props?.className || ''}
                                onChange={e => handlePropChange('className', e.target.value)}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
