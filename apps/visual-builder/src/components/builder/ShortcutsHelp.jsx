import React from 'react';
import Modal from '../shared/Modal';

const ShortcutsHelp = ({ isOpen, onClose }) => {
    const shortcuts = [
        { keys: 'Ctrl + Z', description: 'Undo last action' },
        { keys: 'Ctrl + Y', description: 'Redo last action' },
        { keys: 'Ctrl + S', description: 'Save project' },
        { keys: 'Ctrl + P', description: 'Preview project' },
        { keys: 'Ctrl + D', description: 'Duplicate selected component' },
        { keys: 'Delete', description: 'Delete selected component' },
        { keys: '?', description: 'Show keyboard shortcuts' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="md">
            <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <span className="text-sm text-text-secondary">{shortcut.description}</span>
                        <kbd className="px-2 py-1 bg-surface-light rounded text-xs font-mono text-text-primary">
                            {shortcut.keys}
                        </kbd>
                    </div>
                ))}
            </div>
        </Modal>
    );
};

export default ShortcutsHelp;
