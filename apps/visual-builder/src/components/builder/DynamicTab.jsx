import React from 'react';
import { Database, Filter, ArrowRight, Link as LinkIcon, RefreshCw } from 'lucide-react';

const dataSources = [
    { value: 'pages', label: 'Pages', fields: ['title', 'slug', 'content', 'metaTitle', 'publishedAt'] },
    { value: 'posts', label: 'Blog Posts', fields: ['title', 'excerpt', 'content', 'author', 'category', 'tags', 'publishedAt'] },
    { value: 'products', label: 'Products', fields: ['name', 'description', 'price', 'category', 'image', 'sku'] },
    { value: 'users', label: 'Users', fields: ['name', 'email', 'bio', 'avatar', 'role', 'createdAt'] },
    { value: 'categories', label: 'Categories', fields: ['name', 'slug', 'description', 'parent'] },
    { value: 'custom', label: 'Custom API', fields: [] },
];

export const DynamicTab = ({ component, onUpdate }) => {
    const [selectedSource, setSelectedSource] = React.useState('');
    const [fieldMappings, setFieldMappings] = React.useState([]);
    const [filterField, setFilterField] = React.useState('');
    const [filterOperator, setFilterOperator] = React.useState('equals');
    const [filterValue, setFilterValue] = React.useState('');
    const [customApiUrl, setCustomApiUrl] = React.useState('');
    const [customApiMethod, setCustomApiMethod] = React.useState('GET');
    const [limit, setLimit] = React.useState(10);
    const [sortField, setSortField] = React.useState('');
    const [sortOrder, setSortOrder] = React.useState('asc');

    React.useEffect(() => {
        if (component?.props?.dynamic) {
            const dyn = component.props.dynamic;
            setSelectedSource(dyn.dataSource || '');
            setFieldMappings(dyn.fieldMappings || []);
            setFilterField(dyn.filterField || '');
            setFilterOperator(dyn.filterOperator || 'equals');
            setFilterValue(dyn.filterValue || '');
            setCustomApiUrl(dyn.customApiUrl || '');
            setCustomApiMethod(dyn.customApiMethod || 'GET');
            setLimit(dyn.limit || 10);
            setSortField(dyn.sortField || '');
            setSortOrder(dyn.sortOrder || 'asc');
        }
    }, [component]);

    if (!component) {
        return (
            <div className="p-4 text-center text-text-secondary text-xs">
                Select a component to connect to data
            </div>
        );
    }

    const props = component.props || {};

    const updateProp = (key, value) => {
        onUpdate({ props: { ...props, [key]: value } });
    };

    const handleSourceChange = (value) => {
        setSelectedSource(value);
        if (value === 'custom') {
            setCustomApiUrl('');
        }
        const dynamic = { ...props.dynamic, dataSource: value, fieldMappings: [] };
        updateProp('dynamic', dynamic);
    };

    const addFieldMapping = () => {
        const source = dataSources.find((s) => s.value === selectedSource);
        if (!source || source.fields.length === 0) return;
        const firstField = source.fields[0] || '';
        if (!firstField) return;
        const updated = [...fieldMappings, { componentField: '', dataField: firstField }];
        setFieldMappings(updated);
        updateProp('dynamic', { ...(props.dynamic || {}), fieldMappings: updated });
    };

    const updateMapping = (index, field, value) => {
        const updated = fieldMappings.map((m, i) => (i === index ? { ...m, [field]: value } : m));
        setFieldMappings(updated);
        updateProp('dynamic', { ...(props.dynamic || {}), fieldMappings: updated });
    };

    const removeMapping = (index) => {
        const updated = fieldMappings.filter((_, i) => i !== index);
        setFieldMappings(updated);
        updateProp('dynamic', { ...(props.dynamic || {}), fieldMappings: updated });
    };

    const source = dataSources.find((s) => s.value === selectedSource);

    return (
        <div className="p-4 overflow-y-auto h-full space-y-4 text-xs">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Database className="w-3.5 h-3.5 text-text-secondary" />
                    <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Data Source</span>
                </div>
                <select
                    value={selectedSource}
                    onChange={(e) => handleSourceChange(e.target.value)}
                    className="w-full px-2 py-1.5 bg-surface-light border border-border rounded text-xs text-text-primary"
                >
                    <option value="">Select a data source...</option>
                    {dataSources.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </div>

            {selectedSource === 'custom' && (
                <div className="space-y-2">
                    <div>
                        <span className="text-xs text-text-secondary block mb-1">API URL</span>
                        <input
                            type="text"
                            value={customApiUrl}
                            onChange={(e) => setCustomApiUrl(e.target.value)}
                            placeholder="https://api.example.com/data"
                            className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                        />
                    </div>
                    <div>
                        <span className="text-xs text-text-secondary block mb-1">Method</span>
                        <select
                            value={customApiMethod}
                            onChange={(e) => setCustomApiMethod(e.target.value)}
                            className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                        >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                        </select>
                    </div>
                </div>
            )}

            {selectedSource && selectedSource !== 'custom' && (
                <>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Filter className="w-3.5 h-3.5 text-text-secondary" />
                            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Filters</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                            <select
                                value={filterField}
                                onChange={(e) => setFilterField(e.target.value)}
                                className="px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                            >
                                <option value="">Field</option>
                                {source?.fields.map((f) => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                            <select
                                value={filterOperator}
                                onChange={(e) => setFilterOperator(e.target.value)}
                                className="px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                            >
                                <option value="equals">Equals</option>
                                <option value="notEquals">Not Equals</option>
                                <option value="contains">Contains</option>
                                <option value="gt">Greater Than</option>
                                <option value="lt">Less Than</option>
                            </select>
                            <input
                                type="text"
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                placeholder="Value"
                                className="px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-xs text-text-secondary block mb-1">Limit</span>
                            <input
                                type="number"
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                min="1"
                                max="100"
                                className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                            />
                        </div>
                        <div>
                            <span className="text-xs text-text-secondary block mb-1">Sort By</span>
                            <select
                                value={sortField}
                                onChange={(e) => setSortField(e.target.value)}
                                className="w-full px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                            >
                                <option value="">None</option>
                                {source?.fields.map((f) => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </>
            )}

            {selectedSource && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <LinkIcon className="w-3.5 h-3.5 text-text-secondary" />
                            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Field Mapping</span>
                        </div>
                        <button
                            onClick={addFieldMapping}
                            className="text-xs text-primary-500 hover:text-primary-600"
                        >
                            + Add Mapping
                        </button>
                    </div>

                    {fieldMappings.map((mapping, idx) => (
                        <div key={idx} className="flex items-center gap-1 mb-2">
                            <input
                                type="text"
                                value={mapping.componentField}
                                onChange={(e) => updateMapping(idx, 'componentField', e.target.value)}
                                placeholder="propName"
                                className="flex-1 px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                            />
                            <ArrowRight className="w-3 h-3 text-text-secondary shrink-0" />
                            <select
                                value={mapping.dataField}
                                onChange={(e) => updateMapping(idx, 'dataField', e.target.value)}
                                className="flex-1 px-2 py-1 bg-surface-light border border-border rounded text-xs text-text-primary"
                            >
                                {source?.fields.map((f) => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => removeMapping(idx)}
                                className="p-1 text-danger-500 hover:bg-danger-500/10 rounded"
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    {fieldMappings.length === 0 && (
                        <p className="text-xs text-text-secondary text-center py-2">
                            No field mappings. Add one to connect component props to data fields.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

DynamicTab.displayName = 'DynamicTab';
export default DynamicTab;
