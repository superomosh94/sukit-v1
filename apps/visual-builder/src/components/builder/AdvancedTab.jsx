import React from 'react';
import { Code, Hash, Type, Plus, X } from 'lucide-react';

const htmlTags = [
    'div', 'span', 'section', 'article', 'header', 'footer', 'main',
    'nav', 'aside', 'figure', 'figcaption', 'ul', 'ol', 'li',
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button',
    'form', 'input', 'textarea', 'select', 'label', 'table',
];

export const AdvancedTab = ({ component, onUpdate }) => {
    const [customAttrs, setCustomAttrs] = React.useState([]);
    const [newAttrKey, setNewAttrKey] = React.useState('');
    const [newAttrValue, setNewAttrValue] = React.useState('');

    React.useEffect(() => {
        if (component?.props?.customAttributes) {
            setCustomAttrs(Object.entries(component.props.customAttributes).map(([key, value]) => ({ key, value })));
        } else {
            setCustomAttrs([]);
        }
    }, [component]);

    if (!component) {
        return (
            <div className="p-4 text-center text-text-secondary text-xs">
                Select a component to edit advanced properties
            </div>
        );
    }

    const props = component.props || {};

    const updateProp = (key, value) => {
        onUpdate({ props: { ...props, [key]: value } });
    };

    const addAttribute = () => {
        if (!newAttrKey.trim()) return;
        const updated = [...customAttrs, { key: newAttrKey.trim(), value: newAttrValue }];
        setCustomAttrs(updated);
        const attrsObj = {};
        updated.forEach((a) => { attrsObj[a.key] = a.value; });
        updateProp('customAttributes', attrsObj);
        setNewAttrKey('');
        setNewAttrValue('');
    };

    const removeAttribute = (index) => {
        const updated = customAttrs.filter((_, i) => i !== index);
        setCustomAttrs(updated);
        const attrsObj = {};
        updated.forEach((a) => { attrsObj[a.key] = a.value; });
        updateProp('customAttributes', attrsObj);
    };

    return (
        <div className="p-4 overflow-y-auto h-full space-y-4 text-xs">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Code className="w-3.5 h-3.5 text-text-secondary" />
                    <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">CSS Classes</span>
                </div>
                <input
                    type="text"
                    value={props.className || ''}
                    onChange={(e) => updateProp('className', e.target.value)}
                    placeholder="custom-class another-class"
                    className="w-full px-2 py-1.5 bg-surface-light border border-border rounded text-xs text-text-primary"
                />
                <p className="text-xs text-text-secondary mt-1">Space-separated class names</p>
            </div>

            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-3.5 h-3.5 text-text-secondary" />
                    <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Element ID</span>
                </div>
                <input
                    type="text"
                    value={props.id || ''}
                    onChange={(e) => updateProp('id', e.target.value)}
                    placeholder="my-element-id"
                    className="w-full px-2 py-1.5 bg-surface-light border border-border rounded text-xs text-text-primary"
                />
            </div>

            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Type className="w-3.5 h-3.5 text-text-secondary" />
                    <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">HTML Tag</span>
                </div>
                <select
                    value={props.htmlTag || 'div'}
                    onChange={(e) => updateProp('htmlTag', e.target.value)}
                    className="w-full px-2 py-1.5 bg-surface-light border border-border rounded text-xs text-text-primary"
                >
                    {htmlTags.map((tag) => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
            </div>

            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Code className="w-3.5 h-3.5 text-text-secondary" />
                    <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Custom Attributes</span>
                </div>
                <div className="space-y-2">
                    {customAttrs.map((attr, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                            <span className="px-2 py-1 bg-primary-500/10 text-primary-500 rounded text-xs font-mono">{attr.key}</span>
                            <span className="text-text-secondary">=</span>
                            <span className="px-2 py-1 bg-surface-light border border-border rounded text-xs flex-1">{attr.value}</span>
                            <button onClick={() => removeAttribute(idx)} className="p-1 hover:bg-danger-500/10 rounded">
                                <X className="w-3 h-3 text-danger-500" />
                            </button>
                        </div>
                    ))}
                    <div className="flex gap-1">
                        <input
                            type="text"
                            value={newAttrKey}
                            onChange={(e) => setNewAttrKey(e.target.value)}
                            placeholder="data-*"
                            className="flex-1 px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                        />
                        <input
                            type="text"
                            value={newAttrValue}
                            onChange={(e) => setNewAttrValue(e.target.value)}
                            placeholder="value"
                            className="flex-1 px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                        />
                        <button
                            onClick={addAttribute}
                            disabled={!newAttrKey.trim()}
                            className="p-1.5 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

AdvancedTab.displayName = 'AdvancedTab';
export default AdvancedTab;
