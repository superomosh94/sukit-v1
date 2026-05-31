import React, { useState } from 'react';
import { useEditorStore } from '../stores/editorStore';

const COMPONENTS = [
    { type: 'Container', icon: '📦', category: 'layout', description: 'Content container' },
    { type: 'Section', icon: '📐', category: 'layout', description: 'Full-width section' },
    { type: 'Row', icon: '↔️', category: 'layout', description: 'Horizontal row' },
    { type: 'Column', icon: '▯', category: 'layout', description: 'Vertical column' },
    { type: 'Heading', icon: 'H1', category: 'typography', description: 'Heading text' },
    { type: 'Paragraph', icon: '¶', category: 'typography', description: 'Text paragraph' },
    { type: 'Button', icon: '🔘', category: 'form', description: 'Clickable button' },
    { type: 'Image', icon: '🖼️', category: 'media', description: 'Image display' },
    { type: 'Card', icon: '🃏', category: 'layout', description: 'Content card' },
    { type: 'Form', icon: '📋', category: 'form', description: 'Form container' },
    { type: 'Input', icon: '✏️', category: 'form', description: 'Text input' },
    { type: 'Video', icon: '🎬', category: 'media', description: 'Video player' },
    { type: 'Table', icon: '📊', category: 'data', description: 'Data table' },
    { type: 'Menu', icon: '☰', category: 'navigation', description: 'Navigation menu' },
    { type: 'Footer', icon: '📌', category: 'layout', description: 'Page footer' }
];

const CATEGORIES = [
    { id: 'all', name: 'All', icon: '📦' },
    { id: 'layout', name: 'Layout', icon: '📐' },
    { id: 'typography', name: 'Typography', icon: '📝' },
    { id: 'media', name: 'Media', icon: '🖼️' },
    { id: 'form', name: 'Forms', icon: '📋' },
    { id: 'data', name: 'Data', icon: '📊' },
    { id: 'navigation', name: 'Navigation', icon: '☰' }
];

export const ComponentLibrary = () => {
    const { addComponent } = useEditorStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    
    const handleDragStart = (e, componentType) => {
        e.dataTransfer.setData('componentType', componentType);
        e.dataTransfer.effectAllowed = 'copy';
    };
    
    const filteredComponents = COMPONENTS.filter(comp => {
        const matchesCategory = activeCategory === 'all' || comp.category === activeCategory;
        const matchesSearch = comp.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              comp.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    
    const handleAddComponent = (componentType) => {
        addComponent(componentType);
    };
    
    return (
        <div className="component-library">
            <div className="library-header">
                <h3>Components</h3>
                <div className="library-search">
                    <input
                        type="text"
                        placeholder="Search components..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="library-categories">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                    >
                        {cat.icon} {cat.name}
                    </button>
                ))}
            </div>
            
            <div className="components-grid">
                {filteredComponents.map(comp => (
                    <div
                        key={comp.type}
                        className="component-card"
                        draggable
                        onDragStart={(e) => handleDragStart(e, comp.type)}
                        onClick={() => handleAddComponent(comp.type)}
                    >
                        <div className="component-icon">{comp.icon}</div>
                        <div className="component-info">
                            <div className="component-name">{comp.type}</div>
                            <div className="component-desc">{comp.description}</div>
                        </div>
                    </div>
                ))}
            </div>
            
            {filteredComponents.length === 0 && (
                <div className="no-results">No components found</div>
            )}
        </div>
    );
};
