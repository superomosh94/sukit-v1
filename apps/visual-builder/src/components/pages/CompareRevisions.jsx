import React, { useState } from 'react';
import { GitCompare, ArrowRight, Plus, Minus, FileText, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const mockRevisions = [
    { id: 'v1', label: 'Version 1', timestamp: '2024-06-20 14:30', components: [
        { id: 'h1', type: 'Heading', props: { text: 'Welcome' }, position: { x: 0, y: 0 } },
        { id: 'p1', type: 'Paragraph', props: { text: 'Hello world' }, position: { x: 0, y: 100 } },
    ]},
    { id: 'v2', label: 'Version 2', timestamp: '2024-06-21 10:00', components: [
        { id: 'h1', type: 'Heading', props: { text: 'Welcome!' }, position: { x: 0, y: 0 } },
        { id: 'p1', type: 'Paragraph', props: { text: 'Hello world!' }, position: { x: 0, y: 100 } },
        { id: 'b1', type: 'Button', props: { text: 'Click' }, position: { x: 0, y: 200 } },
    ]},
];

export const CompareRevisions = ({ pageId, onClose }) => {
    const [leftVersion, setLeftVersion] = useState(mockRevisions[0]?.id);
    const [rightVersion, setRightVersion] = useState(mockRevisions[1]?.id);

    const left = mockRevisions.find((r) => r.id === leftVersion);
    const right = mockRevisions.find((r) => r.id === rightVersion);

    const getComponentChanges = () => {
        if (!left || !right) return [];
        const changes = [];

        const leftMap = {};
        left.components.forEach((c) => { leftMap[c.id] = c; });
        const rightMap = {};
        right.components.forEach((c) => { rightMap[c.id] = c; });

        const allIds = [...new Set([...Object.keys(leftMap), ...Object.keys(rightMap)])];

        for (const id of allIds) {
            const lc = leftMap[id];
            const rc = rightMap[id];
            if (!lc) {
                changes.push({ id, type: 'added', component: rc });
            } else if (!rc) {
                changes.push({ id, type: 'removed', component: lc });
            } else if (JSON.stringify(lc.props) !== JSON.stringify(rc.props)) {
                changes.push({ id, type: 'changed', oldComponent: lc, newComponent: rc });
            }
        }

        return changes;
    };

    const changes = getComponentChanges();

    const getChangeIcon = (type) => {
        switch (type) {
            case 'added': return <Plus className="w-4 h-4 text-success-500" />;
            case 'removed': return <Minus className="w-4 h-4 text-danger-500" />;
            case 'changed': return <ArrowRight className="w-4 h-4 text-warning-500" />;
            default: return null;
        }
    };

    const getChangeLabel = (type) => {
        switch (type) {
            case 'added': return 'Added';
            case 'removed': return 'Removed';
            case 'changed': return 'Modified';
            default: return '';
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-surface rounded-xl w-full max-w-4xl shadow-xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <GitCompare className="w-5 h-5 text-primary-500" />
                        <h2 className="text-lg font-semibold text-text-primary">Compare Revisions</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded hover:bg-surface-light">
                        <X className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>

                <div className="flex items-center gap-4 px-6 py-4 border-b border-border">
                    <div className="flex-1">
                        <label className="block text-xs text-text-secondary mb-1">Left (Old)</label>
                        <select
                            value={leftVersion}
                            onChange={(e) => setLeftVersion(e.target.value)}
                            className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-sm text-text-primary"
                        >
                            {mockRevisions.map((r) => (
                                <option key={r.id} value={r.id}>{r.label} - {r.timestamp}</option>
                            ))}
                        </select>
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-secondary mt-5" />
                    <div className="flex-1">
                        <label className="block text-xs text-text-secondary mb-1">Right (New)</label>
                        <select
                            value={rightVersion}
                            onChange={(e) => setRightVersion(e.target.value)}
                            className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-sm text-text-primary"
                        >
                            {mockRevisions.map((r) => (
                                <option key={r.id} value={r.id}>{r.label} - {r.timestamp}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {changes.length === 0 ? (
                        <div className="text-center py-12">
                            <GitCompare className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                            <p className="text-text-primary">No differences found</p>
                            <p className="text-sm text-text-secondary mt-1">These versions are identical</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-text-secondary">{changes.length} change(s) detected</p>
                            {changes.map((change) => (
                                <div
                                    key={change.id}
                                    className={cn(
                                        'border rounded-lg p-4',
                                        change.type === 'added' && 'border-success-500/30 bg-success-500/5',
                                        change.type === 'removed' && 'border-danger-500/30 bg-danger-500/5',
                                        change.type === 'changed' && 'border-warning-500/30 bg-warning-500/5',
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {getChangeIcon(change.type)}
                                        <span className={cn(
                                            'px-2 py-0.5 rounded-full text-xs font-medium',
                                            change.type === 'added' && 'bg-success-500/10 text-success-500',
                                            change.type === 'removed' && 'bg-danger-500/10 text-danger-500',
                                            change.type === 'changed' && 'bg-warning-500/10 text-warning-500',
                                        )}>
                                            {getChangeLabel(change.type)}
                                        </span>
                                        <span className="text-sm font-medium text-text-primary">{change.component?.type || change.oldComponent?.type}</span>
                                        <span className="text-xs text-text-secondary">({change.id})</span>
                                    </div>

                                    {change.type === 'changed' && (
                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div className="bg-surface rounded p-3">
                                                <p className="text-xs text-text-secondary mb-2">Before</p>
                                                <pre className="text-xs text-text-primary">{JSON.stringify(change.oldComponent.props, null, 2)}</pre>
                                            </div>
                                            <div className="bg-surface rounded p-3">
                                                <p className="text-xs text-text-secondary mb-2">After</p>
                                                <pre className="text-xs text-text-primary">{JSON.stringify(change.newComponent.props, null, 2)}</pre>
                                            </div>
                                        </div>
                                    )}

                                    {change.type === 'added' && (
                                        <div className="bg-surface rounded p-3 mt-2">
                                            <pre className="text-xs text-text-primary">{JSON.stringify(change.component.props, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

CompareRevisions.displayName = 'CompareRevisions';
export default CompareRevisions;
