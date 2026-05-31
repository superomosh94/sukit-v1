import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TopToolbar from '../components/builder/TopToolbar';
import ComponentLibrary from '../components/builder/ComponentLibrary';
import Canvas from '../components/builder/Canvas';
import PropertyPanel from '../components/builder/PropertyPanel';
import LayerPanel from '../components/builder/LayerPanel';
import PreviewWindow from '../components/builder/PreviewWindow';
import HistoryPanel from '../components/builder/HistoryPanel';
import ShortcutsHelp from '../components/builder/ShortcutsHelp';
import CollaborationPanel from '../components/collaboration/CollaborationPanel';
import { useEditorStore } from '../stores/editorStore';
import { useCanvasStore } from '../stores/canvasStore';

const PageBuilder = () => {
const { 
    components, 
    selectedComponentId, 
    addComponent, 
    updateComponent, 
    deleteComponent, 
    selectComponent,
    duplicateComponent,
    undo,
    redo
} = useEditorStore();
    
    const { 
        zoom, 
        device, 
        showGrid, 
        snapToGrid,
        zoomIn, 
        zoomOut, 
        resetZoom, 
        setDevice,
        toggleGrid,
        toggleSnap
    } = useCanvasStore();
    
     const { history, historyIndex, canUndo, canRedo } = useEditorStore();
    
    const [showPreview, setShowPreview] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [rightSidebarTab, setRightSidebarTab] = useState('properties');

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+Z = Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
            // Ctrl+Y or Ctrl+Shift+Z = Redo
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            }
            // Ctrl+S = Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                console.log('Save project');
            }
            // Ctrl+P = Preview
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                setShowPreview(true);
            }
            // Delete = Delete selected component
            if (e.key === 'Delete' && selectedComponentId) {
                deleteComponent(selectedComponentId);
            }
            // Ctrl+D = Duplicate
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                if (selectedComponentId) {
                    duplicateComponent(selectedComponentId);
                }
            }
            // ? = Show shortcuts
            if (e.key === '?') {
                setShowShortcuts(true);
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, deleteComponent, addComponent, components, selectedComponentId]);

    const handleSave = () => {
        console.log('Project saved', { components });
        // Save to localStorage or backend
        localStorage.setItem('sukit-project', JSON.stringify(components));
    };

    const handleDeploy = () => {
        console.log('Deploying project...');
        // Deploy logic
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex flex-col h-full bg-background">
                {/* Top Toolbar */}
                <TopToolbar 
                    onUndo={undo}
                    onRedo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onSave={handleSave}
                    onPreview={() => setShowPreview(true)}
                    onDeploy={handleDeploy}
                    onShowHistory={() => setShowHistory(!showHistory)}
                    device={device}
                    onDeviceChange={setDevice}
                    onZoomIn={zoomIn}
                    onZoomOut={zoomOut}
                    onFitScreen={resetZoom}
                    onToggleGrid={toggleGrid}
                    onToggleSnap={toggleSnap}
                    showGrid={showGrid}
                    snapToGrid={snapToGrid}
                    zoom={zoom}
                />
                
                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar - Component Library */}
                    <ComponentLibrary onAddComponent={addComponent} />
                    
                    {/* Center - Canvas */}
                    <div className="flex-1 relative">
                        <Canvas 
                            components={components}
                            onSelectComponent={selectComponent}
                            selectedId={selectedComponentId}
                            onUpdateComponent={updateComponent}
                            onDeleteComponent={deleteComponent}
                            zoom={zoom}
                            device={device}
                            showGrid={showGrid}
                            snapToGrid={snapToGrid}
                        />
                    </div>
                    
                    {/* Right Sidebar */}
                    {rightSidebarTab === 'collaboration' ? (
                        <CollaborationPanel />
                    ) : (
                        <div className="w-80 bg-surface border-l border-border flex flex-col">
                            <div className="flex border-b border-border">
                                <button onClick={() => setRightSidebarTab('properties')}
                                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                                        rightSidebarTab === 'properties' 
                                            ? 'text-primary-500 border-b-2 border-primary-500' 
                                            : 'text-text-secondary hover:text-text-primary'
                                    }`}>Properties</button>
                                <button onClick={() => setRightSidebarTab('layers')}
                                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                                        rightSidebarTab === 'layers' 
                                            ? 'text-primary-500 border-b-2 border-primary-500' 
                                            : 'text-text-secondary hover:text-text-primary'
                                    }`}>Layers</button>
                                <button onClick={() => setRightSidebarTab('history')}
                                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                                        rightSidebarTab === 'history' 
                                            ? 'text-primary-500 border-b-2 border-primary-500' 
                                            : 'text-text-secondary hover:text-text-primary'
                                    }`}>History</button>
                                <button onClick={() => setRightSidebarTab('collaboration')}
                                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                                        rightSidebarTab === 'collaboration' 
                                            ? 'text-primary-500 border-b-2 border-primary-500' 
                                            : 'text-text-secondary hover:text-text-primary'
                                    }`}>Team</button>
                            </div>
                            <div className="flex-1 overflow-auto">
                                {rightSidebarTab === 'properties' && (
                                    <PropertyPanel selectedComponent={components.find(c => c.id === selectedComponentId)}
                                        onUpdate={(updates) => updateComponent(selectedComponentId, updates)} />
                                )}
                                {rightSidebarTab === 'layers' && (
                                    <LayerPanel components={components} selectedId={selectedComponentId}
                                        onSelect={selectComponent} onDelete={deleteComponent}
                                        onDuplicate={duplicateComponent} />
                                )}
                                {rightSidebarTab === 'history' && (
                                    <HistoryPanel history={history} currentIndex={historyIndex} onUndo={undo} onRedo={redo} />
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Preview Modal */}
                <PreviewWindow 
                    isOpen={showPreview}
                    onClose={() => setShowPreview(false)}
                    components={components}
                />
                
                {/* Shortcuts Help Modal */}
                <ShortcutsHelp 
                    isOpen={showShortcuts}
                    onClose={() => setShowShortcuts(false)}
                />
            </div>
        </DndProvider>
    );
};

export default PageBuilder;
