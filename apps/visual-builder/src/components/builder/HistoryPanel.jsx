import React from 'react';

const HistoryPanel = ({ history, currentIndex, onUndo, onRedo }) => {
    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-text-primary mb-3">History</h3>
            <div className="flex gap-2 mb-4">
                <button onClick={onUndo} className="flex-1 py-1 bg-surface-light rounded text-xs">Undo</button>
                <button onClick={onRedo} className="flex-1 py-1 bg-surface-light rounded text-xs">Redo</button>
            </div>
            <div className="flex-1 overflow-auto space-y-1">
                {history?.map((step, index) => (
                    <div 
                        key={index} 
                        className={`text-xs px-2 py-1 rounded ${index === currentIndex ? 'bg-primary-500/10 text-primary-500' : 'text-text-secondary'}`}
                    >
                        Step {index + 1}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryPanel;
