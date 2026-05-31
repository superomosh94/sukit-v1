import React, { useState, useEffect } from 'react';
import { Clock, Star, Eye, Download } from 'lucide-react';

export const RecentComponentsList = ({ onSelect, onAdd }) => {
    const [recentComponents, setRecentComponents] = useState([]);

    useEffect(() => {
        // Load recent components from localStorage
        const stored = localStorage.getItem('sukit-recent-components');
        if (stored) {
            setRecentComponents(JSON.parse(stored));
        }
    }, []);

    const addToRecent = (component) => {
        const updated = [component, ...recentComponents.filter(c => c.id !== component.id)].slice(0, 10);
        setRecentComponents(updated);
        localStorage.setItem('sukit-recent-components', JSON.stringify(updated));
    };

    if (recentComponents.length === 0) {
        return (
            <div className="p-4 text-center">
                <Clock className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                <p className="text-sm text-text-secondary">No recent components</p>
                <p className="text-xs text-text-secondary mt-1">Components you use will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 p-2">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-2">Recently Used</h4>
            {recentComponents.map((component) => (
                <div
                    key={component.id}
                    className="flex items-center justify-between p-2 bg-surface-light rounded-lg cursor-pointer hover:bg-surface-light/80 transition-colors group"
                    onClick={() => onSelect?.(component)}
                >
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-500" />
                        <span className="text-sm text-text-primary">{component.name}</span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdd?.(component.type);
                        }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface"
                    >
                        <Download className="w-3.5 h-3.5 text-text-secondary" />
                    </button>
                </div>
            ))}
        </div>
    );
};
