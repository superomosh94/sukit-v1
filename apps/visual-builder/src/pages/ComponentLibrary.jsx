import React, { useState, useEffect } from 'react';
import { Plus, Upload, Grid3X3, LayoutList, Star, Search } from 'lucide-react';
import ComponentSearch from '../components/library/ComponentSearch';
import CategoryTabs from '../components/library/CategoryTabs';
import ComponentCard from '../components/library/ComponentCard';
import ComponentPreview from '../components/library/ComponentPreview';
import FavoritesList from '../components/library/FavoritesList';
import CustomComponentForm from '../components/library/CustomComponentForm';
import ImportComponent from '../components/library/ImportComponent';
import Button from '../components/shared/Button';
import { useComponentStore } from '../stores/componentStore';
import componentRegistry from '../utils/componentRegistry';

const ComponentLibrary = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [previewComponent, setPreviewComponent] = useState(null);
    
    const { favorites, addFavorite, removeFavorite, customComponents, addCustomComponent } = useComponentStore();
    
    // Get all components from registry
    const allComponents = [...componentRegistry.getAll(), ...customComponents];
    
    // Filter components
    const filteredComponents = allComponents.filter(comp => {
        const matchesCategory = activeCategory === 'all' || comp.category === activeCategory;
        const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              comp.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    
    const favoriteComponents = allComponents.filter(comp => favorites.includes(comp.id));
    
    const handleToggleFavorite = (id) => {
        if (favorites.includes(id)) {
            removeFavorite(id);
        } else {
            addFavorite(id);
        }
    };
    
    const handleAddComponent = (component) => {
        console.log('Add component to canvas:', component);
        alert(`Component "${component.name}" added to canvas!`);
    };
    
    const handleCreateCustomComponent = (componentData) => {
        const newComponent = {
            id: `custom-${Date.now()}`,
            name: componentData.name,
            type: componentData.name,
            category: componentData.category || 'custom',
            description: componentData.description || 'Custom component',
            icon: componentData.icon || 'Component',
            isCustom: true,
            code: componentData.code,
            createdAt: new Date().toISOString(),
        };
        addCustomComponent(newComponent);
        componentRegistry.register(newComponent);
    };
    
    const handleImportComponent = (importedData) => {
        const newComponent = {
            id: `imported-${Date.now()}`,
            name: importedData.name,
            type: importedData.name,
            category: 'imported',
            description: `Imported from ${importedData.fileName}`,
            isCustom: true,
            code: importedData.code,
            createdAt: new Date().toISOString(),
        };
        addCustomComponent(newComponent);
        componentRegistry.register(newComponent);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Component Library</h1>
                    <p className="text-text-secondary mt-1">Browse and manage reusable components for your projects</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowImport(true)} leftIcon={<Upload className="w-4 h-4" />}>
                        Import
                    </Button>
                    <Button variant="primary" onClick={() => setShowCustomForm(true)} leftIcon={<Plus className="w-4 h-4" />}>
                        Create Component
                    </Button>
                </div>
            </div>
            
            {/* Search Bar */}
            <ComponentSearch onSearch={setSearchTerm} />
            
            {/* Category Tabs */}
            <CategoryTabs 
                activeCategory={activeCategory} 
                onSelect={setActiveCategory} 
            />
            
            {/* View Controls */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <button 
                        onClick={() => setViewMode('grid')} 
                        className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-text-secondary hover:bg-surface-light'}`}
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')} 
                        className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-text-secondary hover:bg-surface-light'}`}
                    >
                        <LayoutList className="w-4 h-4" />
                    </button>
                </div>
                <button 
                    onClick={() => setActiveCategory('favorites')} 
                    className="text-sm text-primary-500 hover:underline flex items-center gap-1"
                >
                    <Star className="w-3 h-3" />
                    Favorites ({favoriteComponents.length})
                </button>
            </div>
            
            {/* Content */}
            {activeCategory === 'favorites' ? (
                <FavoritesList 
                    favorites={favoriteComponents}
                    onRemoveFavorite={handleToggleFavorite}
                    onSelectComponent={setPreviewComponent}
                    onAddComponent={handleAddComponent}
                />
            ) : (
                <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                    : 'space-y-3'}
                >
                    {filteredComponents.map((component) => (
                        <ComponentCard 
                            key={component.id}
                            component={component}
                            onPreview={setPreviewComponent}
                            onAdd={() => handleAddComponent(component)}
                            isFavorite={favorites.includes(component.id)}
                            onToggleFavorite={handleToggleFavorite}
                            viewMode={viewMode}
                        />
                    ))}
                    {filteredComponents.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <p className="text-text-secondary">No components found</p>
                            <button 
                                onClick={() => setShowCustomForm(true)}
                                className="mt-2 text-primary-500 hover:underline"
                            >
                                Create your first component
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            {/* Modals */}
            <ComponentSearch onSearch={setSearchTerm} />
            
            <ComponentPreview 
                component={previewComponent} 
                isOpen={!!previewComponent} 
                onClose={() => setPreviewComponent(null)} 
            />
            
            <CustomComponentForm 
                isOpen={showCustomForm} 
                onClose={() => setShowCustomForm(false)} 
                onSave={handleCreateCustomComponent} 
            />
            
            <ImportComponent 
                isOpen={showImport} 
                onClose={() => setShowImport(false)} 
                onImport={handleImportComponent} 
            />
        </div>
    );
};

export default ComponentLibrary;
