import React from 'react';
import { useSettingsStore } from '../../stores/settingsStore';

const Editor = () => {
    const { settings, updateSettings } = useSettingsStore();
    const editor = settings.editor || {};

    const update = (key, value) => updateSettings('editor', { [key]: value });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-text-primary">Editor</h2>
                <p className="text-sm text-text-secondary mt-1">Grid, snap, auto-save</p>
            </div>

            <div className="space-y-4 bg-surface border border-border rounded-xl p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-primary">Show Grid</p>
                        <p className="text-xs text-text-secondary">Display grid lines on the canvas</p>
                    </div>
                    <button
                        onClick={() => update('showGrid', !editor.showGrid)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${editor.showGrid ? 'bg-primary-500' : 'bg-surface-light'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-full transition-transform ${editor.showGrid ? 'translate-x-5' : ''}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-primary">Snap to Grid</p>
                        <p className="text-xs text-text-secondary">Align elements to grid when dragging</p>
                    </div>
                    <button
                        onClick={() => update('snapToGrid', !editor.snapToGrid)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${editor.snapToGrid ? 'bg-primary-500' : 'bg-surface-light'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-full transition-transform ${editor.snapToGrid ? 'translate-x-5' : ''}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-primary">Auto-Save</p>
                        <p className="text-xs text-text-secondary">Automatically save changes periodically</p>
                    </div>
                    <button
                        onClick={() => update('autoSave', !editor.autoSave)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${editor.autoSave ? 'bg-primary-500' : 'bg-surface-light'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-full transition-transform ${editor.autoSave ? 'translate-x-5' : ''}`} />
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Grid Size (px)</label>
                    <input
                        type="number"
                        value={editor.gridSize || 8}
                        onChange={(e) => update('gridSize', parseInt(e.target.value) || 8)}
                        min={4}
                        max={32}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Auto-Save Interval (seconds)</label>
                    <input
                        type="number"
                        value={editor.autoSaveInterval || 30}
                        onChange={(e) => update('autoSaveInterval', parseInt(e.target.value) || 30)}
                        min={5}
                        max={300}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Default Canvas Zoom</label>
                    <select
                        value={editor.defaultZoom || 100}
                        onChange={(e) => update('defaultZoom', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value={50}>50%</option>
                        <option value={75}>75%</option>
                        <option value={100}>100%</option>
                        <option value={125}>125%</option>
                        <option value={150}>150%</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default Editor;
