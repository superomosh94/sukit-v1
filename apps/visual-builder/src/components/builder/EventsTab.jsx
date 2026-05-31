import React from 'react';
import { MousePointer2, Pointer, ScrollText, Plus, X, ExternalLink, Code, Eye, ToggleLeft } from 'lucide-react';

const triggerTypes = [
    { value: 'click', label: 'Click', icon: MousePointer2 },
    { value: 'hover', label: 'Hover', icon: Pointer },
    { value: 'scroll', label: 'Scroll Into View', icon: ScrollText },
];

const actionTypes = [
    { value: 'navigate', label: 'Navigate to URL', icon: ExternalLink },
    { value: 'showPopup', label: 'Show Popup', icon: Eye },
    { value: 'toggleClass', label: 'Toggle CSS Class', icon: ToggleLeft },
    { value: 'customJS', label: 'Run Custom JS', icon: Code },
];

export const EventsTab = ({ component, onUpdate }) => {
    const [events, setEvents] = React.useState([]);

    React.useEffect(() => {
        if (component?.props?.events) {
            setEvents(component.props.events);
        } else {
            setEvents([]);
        }
    }, [component]);

    if (!component) {
        return (
            <div className="p-4 text-center text-text-secondary text-xs">
                Select a component to add event handlers
            </div>
        );
    }

    const props = component.props || {};

    const updateProp = (key, value) => {
        onUpdate({ props: { ...props, [key]: value } });
    };

    const addEvent = () => {
        const newEvent = {
            id: Date.now().toString(),
            trigger: 'click',
            action: 'navigate',
            config: { url: '', popupId: '', className: '', code: '' },
        };
        const updated = [...events, newEvent];
        setEvents(updated);
        updateProp('events', updated);
    };

    const updateEvent = (id, field, value) => {
        const updated = events.map((ev) => {
            if (ev.id !== id) return ev;
            if (field === 'trigger' || field === 'action') {
                return { ...ev, [field]: value, config: { url: '', popupId: '', className: '', code: '' } };
            }
            return { ...ev, config: { ...ev.config, [field]: value } };
        });
        setEvents(updated);
        updateProp('events', updated);
    };

    const removeEvent = (id) => {
        const updated = events.filter((ev) => ev.id !== id);
        setEvents(updated);
        updateProp('events', updated);
    };

    const renderConfig = (event) => {
        switch (event.action) {
            case 'navigate':
                return (
                    <input
                        type="text"
                        value={event.config.url}
                        onChange={(e) => updateEvent(event.id, 'url', e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                    />
                );
            case 'showPopup':
                return (
                    <input
                        type="text"
                        value={event.config.popupId}
                        onChange={(e) => updateEvent(event.id, 'popupId', e.target.value)}
                        placeholder="Popup ID"
                        className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                    />
                );
            case 'toggleClass':
                return (
                    <input
                        type="text"
                        value={event.config.className}
                        onChange={(e) => updateEvent(event.id, 'className', e.target.value)}
                        placeholder=".active-class"
                        className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                    />
                );
            case 'customJS':
                return (
                    <textarea
                        value={event.config.code}
                        onChange={(e) => updateEvent(event.id, 'code', e.target.value)}
                        placeholder="console.log('hello');"
                        rows={3}
                        className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary font-mono resize-none"
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-4 overflow-y-auto h-full space-y-3 text-xs">
            {events.length === 0 && (
                <div className="text-center py-8">
                    <MousePointer2 className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                    <p className="text-text-secondary">No events configured</p>
                    <p className="text-text-secondary text-xs mt-1">Add click, hover, or scroll triggers</p>
                </div>
            )}

            {events.map((event) => (
                <div key={event.id} className="bg-surface-light border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-text-primary">Event</span>
                        <button onClick={() => removeEvent(event.id)} className="p-1 hover:bg-danger-500/10 rounded">
                            <X className="w-3 h-3 text-danger-500" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <select
                            value={event.trigger}
                            onChange={(e) => updateEvent(event.id, 'trigger', e.target.value)}
                            className="px-2 py-1 bg-surface border border-border rounded text-xs text-text-primary"
                        >
                            {triggerTypes.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                        <select
                            value={event.action}
                            onChange={(e) => updateEvent(event.id, 'action', e.target.value)}
                            className="px-2 py-1 bg-surface border border-border rounded text-xs text-text-primary"
                        >
                            {actionTypes.map((a) => (
                                <option key={a.value} value={a.value}>{a.label}</option>
                            ))}
                        </select>
                    </div>

                    {renderConfig(event)}

                    {event.action === 'navigate' && (
                        <div>
                            <select
                                value={event.config.target || '_self'}
                                onChange={(e) => updateEvent(event.id, 'target', e.target.value)}
                                className="w-full px-2 py-1 bg-surface border border-border rounded text-xs text-text-primary"
                            >
                                <option value="_self">Same Tab</option>
                                <option value="_blank">New Tab</option>
                            </select>
                        </div>
                    )}
                </div>
            ))}

            <button
                onClick={addEvent}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 border-2 border-dashed border-border rounded-lg text-text-secondary hover:border-primary-500 hover:text-primary-500 transition-colors"
            >
                <Plus className="w-3.5 h-3.5" />
                Add Event
            </button>
        </div>
    );
};

EventsTab.displayName = 'EventsTab';
export default EventsTab;
