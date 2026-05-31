import React from 'react';
import { GitBranch, LogIn, Monitor, Link, Code, Plus, X } from 'lucide-react';

const conditionTypes = [
    { value: 'userLoggedIn', label: 'User is Logged In', group: 'User' },
    { value: 'userLoggedOut', label: 'User is Logged Out', group: 'User' },
    { value: 'userRole', label: 'User Role', group: 'User' },
    { value: 'isDesktop', label: 'Desktop Device', group: 'Device' },
    { value: 'isTablet', label: 'Tablet Device', group: 'Device' },
    { value: 'isMobile', label: 'Mobile Device', group: 'Device' },
    { value: 'pageUrl', label: 'Page URL Matches', group: 'Page' },
    { value: 'pageUrlNot', label: 'Page URL Does Not Match', group: 'Page' },
    { value: 'customCondition', label: 'Custom Condition', group: 'Custom' },
];

export const ConditionalTab = ({ component, onUpdate }) => {
    const [conditions, setConditions] = React.useState([]);

    React.useEffect(() => {
        if (component?.props?.conditions) {
            setConditions(component.props.conditions);
        } else {
            setConditions([]);
        }
    }, [component]);

    if (!component) {
        return (
            <div className="p-4 text-center text-text-secondary text-xs">
                Select a component to add conditions
            </div>
        );
    }

    const props = component.props || {};

    const updateProp = (key, value) => {
        onUpdate({ props: { ...props, [key]: value } });
    };

    const getConditionConfig = (type) => {
        if (type === 'userRole') return { operator: 'equals', value: 'admin' };
        if (type === 'pageUrl') return { operator: 'contains', value: '' };
        if (type === 'pageUrlNot') return { operator: 'contains', value: '' };
        if (type === 'customCondition') return { code: '' };
        return {};
    };

    const addCondition = () => {
        const newCond = {
            id: Date.now().toString(),
            type: 'userLoggedIn',
            config: getConditionConfig('userLoggedIn'),
        };
        const updated = [...conditions, newCond];
        setConditions(updated);
        updateProp('conditions', updated);
    };

    const updateCondition = (id, field, value) => {
        const updated = conditions.map((c) => {
            if (c.id !== id) return c;
            if (field === 'type') {
                return { ...c, type: value, config: getConditionConfig(value) };
            }
            return { ...c, config: { ...c.config, [field]: value } };
        });
        setConditions(updated);
        updateProp('conditions', updated);
    };

    const removeCondition = (id) => {
        const updated = conditions.filter((c) => c.id !== id);
        setConditions(updated);
        updateProp('conditions', updated);
    };

    const [logic, setLogic] = React.useState(props.conditionLogic || 'all');

    const handleLogicChange = (val) => {
        setLogic(val);
        updateProp('conditionLogic', val);
    };

    const renderConfig = (cond) => {
        switch (cond.type) {
            case 'userRole':
                return (
                    <input
                        type="text"
                        value={cond.config.value || ''}
                        onChange={(e) => updateCondition(cond.id, 'value', e.target.value)}
                        placeholder="admin, editor, etc."
                        className="w-full px-2 py-1 bg-surface border border-border rounded text-xs text-text-primary"
                    />
                );
            case 'pageUrl':
            case 'pageUrlNot':
                return (
                    <div className="flex gap-1">
                        <select
                            value={cond.config.operator || 'contains'}
                            onChange={(e) => updateCondition(cond.id, 'operator', e.target.value)}
                            className="px-2 py-1 bg-surface border border-border rounded text-xs text-text-primary"
                        >
                            <option value="contains">Contains</option>
                            <option value="equals">Equals</option>
                            <option value="startsWith">Starts With</option>
                            <option value="regex">Regex</option>
                        </select>
                        <input
                            type="text"
                            value={cond.config.value || ''}
                            onChange={(e) => updateCondition(cond.id, 'value', e.target.value)}
                            placeholder="/about"
                            className="flex-1 px-2 py-1 bg-surface border border-border rounded text-xs text-text-primary"
                        />
                    </div>
                );
            case 'customCondition':
                return (
                    <textarea
                        value={cond.config.code || ''}
                        onChange={(e) => updateCondition(cond.id, 'code', e.target.value)}
                        placeholder="return true; // must return boolean"
                        rows={2}
                        className="w-full px-2 py-1 bg-surface border border-border rounded text-xs text-text-primary font-mono"
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-4 overflow-y-auto h-full space-y-3 text-xs">
            {conditions.length > 0 && (
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-text-secondary">Show when</span>
                    <select
                        value={logic}
                        onChange={(e) => handleLogicChange(e.target.value)}
                        className="px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                    >
                        <option value="all">All conditions match (AND)</option>
                        <option value="any">Any condition matches (OR)</option>
                    </select>
                </div>
            )}

            {conditions.map((cond) => (
                <div key={cond.id} className="bg-surface-light border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <GitBranch className="w-3.5 h-3.5 text-text-secondary" />
                        <button onClick={() => removeCondition(cond.id)} className="p-1 hover:bg-danger-500/10 rounded">
                            <X className="w-3 h-3 text-danger-500" />
                        </button>
                    </div>

                    <select
                        value={cond.type}
                        onChange={(e) => updateCondition(cond.id, 'type', e.target.value)}
                        className="w-full px-2 py-1 bg-surface border border-border rounded text-xs text-text-primary"
                    >
                        {conditionTypes.map((ct) => (
                            <option key={ct.value} value={ct.value}>{ct.label}</option>
                        ))}
                    </select>

                    {renderConfig(cond)}
                </div>
            ))}

            <button
                onClick={addCondition}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 border-2 border-dashed border-border rounded-lg text-text-secondary hover:border-primary-500 hover:text-primary-500 transition-colors"
            >
                <Plus className="w-3.5 h-3.5" />
                Add Condition
            </button>
        </div>
    );
};

ConditionalTab.displayName = 'ConditionalTab';
export default ConditionalTab;
