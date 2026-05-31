import React, { useState } from 'react';
import { Grid, Settings, X } from 'lucide-react';

export const GridControls = ({ 
    showGrid, 
    onToggleGrid, 
    gridSize, 
    onGridSizeChange,
    snapToGrid,
    onToggleSnap,
    snapDistance,
    onSnapDistanceChange 
}) => {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={onToggleGrid}
                className={`p-2 rounded-lg transition-colors ${
                    showGrid ? 'bg-primary-500/20 text-primary-500' : 'text-text-secondary hover:bg-surface-light'
                }`}
                title="Toggle Grid"
            >
                <Grid className="w-4 h-4" />
            </button>
            
            <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg hover:bg-surface-light transition-colors"
                title="Grid Settings"
            >
                <Settings className="w-4 h-4 text-text-secondary" />
            </button>
            
            {showSettings && (
                <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-lg shadow-lg z-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-text-primary">Grid Settings</h4>
                        <button onClick={() => setShowSettings(false)} className="p-1 rounded hover:bg-surface-light">
                            <X className="w-3 h-3 text-text-secondary" />
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-text-secondary mb-1">Grid Size (px)</label>
                            <input
                                type="range"
                                min={4}
                                max={50}
                                step={2}
                                value={gridSize}
                                onChange={(e) => onGridSizeChange(parseInt(e.target.value))}
                                className="w-full h-2 bg-surface-light rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-text-secondary mt-1">
                                <span>4px</span>
                                <span>{gridSize}px</span>
                                <span>50px</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <label className="text-xs text-text-secondary">Snap to Grid</label>
                            <button
                                onClick={onToggleSnap}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                    snapToGrid ? 'bg-primary-500' : 'bg-surface-light'
                                }`}
                            >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${
                                    snapToGrid ? 'translate-x-4.5' : 'translate-x-0.5'
                                }`} />
                            </button>
                        </div>
                        
                        {snapToGrid && (
                            <div>
                                <label className="block text-xs text-text-secondary mb-1">Snap Distance (px)</label>
                                <input
                                    type="range"
                                    min={2}
                                    max={20}
                                    step={1}
                                    value={snapDistance}
                                    onChange={(e) => onSnapDistanceChange(parseInt(e.target.value))}
                                    className="w-full h-2 bg-surface-light rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-text-secondary mt-1">
                                    <span>2px</span>
                                    <span>{snapDistance}px</span>
                                    <span>20px</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
