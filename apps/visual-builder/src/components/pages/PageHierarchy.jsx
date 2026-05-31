import React, { useState } from 'react';
import { FileText, ChevronRight, ChevronDown, GripVertical, Plus, FolderOpen, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export const PageHierarchy = ({ pages = [], onReorder, onNest, onSelect, selectedId }) => {
    const [expanded, setExpanded] = useState({});
    const [dragId, setDragId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);

    const toggleExpand = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const buildTree = (items, parentId = null) => {
        return items
            .filter((p) => p.parentId === parentId)
            .map((item) => ({
                ...item,
                children: buildTree(items, item.id),
            }));
    };

    const tree = buildTree(pages);

    const handleDragStart = (id) => {
        setDragId(id);
    };

    const handleDragOver = (e, id) => {
        e.preventDefault();
        setDragOverId(id);
    };

    const handleDrop = (targetId) => {
        if (!dragId || dragId === targetId) return;
        onReorder?.(dragId, targetId);
        setDragId(null);
        setDragOverId(null);
    };

    const handleDragEnd = () => {
        setDragId(null);
        setDragOverId(null);
    };

    const renderNode = (page, depth = 0) => {
        const hasChildren = page.children && page.children.length > 0;
        const isExpanded = expanded[page.id];
        const isSelected = selectedId === page.id;
        const isDragging = dragId === page.id;

        return (
            <div key={page.id}>
                <div
                    className={cn(
                        'flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer transition-colors group',
                        isSelected ? 'bg-primary-500/20 text-primary-500' : 'hover:bg-surface-light text-text-primary',
                        isDragging && 'opacity-50',
                        dragOverId === page.id && 'border-t-2 border-primary-500'
                    )}
                    style={{ paddingLeft: `${12 + depth * 16}px` }}
                    onClick={() => onSelect?.(page.id)}
                    draggable
                    onDragStart={() => handleDragStart(page.id)}
                    onDragOver={(e) => handleDragOver(e, page.id)}
                    onDrop={() => handleDrop(page.id)}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                        {hasChildren ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleExpand(page.id); }}
                                className="p-0.5 rounded hover:bg-surface-light shrink-0"
                            >
                                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            </button>
                        ) : (
                            <span className="w-4" />
                        )}
                        <GripVertical className="w-3 h-3 text-text-secondary opacity-0 group-hover:opacity-100 shrink-0" />
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-sm truncate">{page.title || page.name || 'Untitled'}</span>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
                        <button
                            onClick={(e) => { e.stopPropagation(); onNest?.(page.id); }}
                            className="p-1 rounded hover:bg-surface-light"
                            title="Nest Child Page"
                        >
                            <Plus className="w-3 h-3 text-text-secondary" />
                        </button>
                    </div>
                </div>
                {hasChildren && isExpanded && (
                    <div>
                        {page.children.map((child) => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-border flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-text-secondary" />
                <span className="text-sm font-medium text-text-primary">Page Hierarchy</span>
            </div>
            <div className="p-2">
                {tree.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary text-sm">
                        No pages yet
                    </div>
                ) : (
                    tree.map((page) => renderNode(page))
                )}
            </div>
        </div>
    );
};

PageHierarchy.displayName = 'PageHierarchy';
export default PageHierarchy;
