import React, { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GripVertical, Trash2, Copy, Eye, Settings, Plus, Type, Mail, Phone, Hash, AlignLeft, List, Circle, CheckSquare, Calendar, Clock, Paperclip, Star, Shield, Heading, FileText, Wrench } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import { Toast } from '../shared/Toast';

// Field Types
const FIELD_ICONS = {
  text: Type, email: Mail, tel: Phone, number: Hash, textarea: AlignLeft,
  select: List, radio: Circle, checkbox: CheckSquare, 'checkbox-group': CheckSquare,
  date: Calendar, time: Clock, file: Paperclip, rating: Star, captcha: Shield,
  heading: Heading, paragraph: FileText, html: Wrench,
};

const FIELD_TYPES = [
    { type: 'text', label: 'Text Input', defaultProps: { label: 'Text Field', placeholder: 'Enter text', required: false } },
    { type: 'email', label: 'Email', defaultProps: { label: 'Email', placeholder: 'Enter email', required: false } },
    { type: 'tel', label: 'Phone', defaultProps: { label: 'Phone', placeholder: 'Enter phone', required: false } },
    { type: 'number', label: 'Number', defaultProps: { label: 'Number', placeholder: 'Enter number', required: false } },
    { type: 'textarea', label: 'Textarea', defaultProps: { label: 'Message', placeholder: 'Enter message', rows: 4, required: false } },
    { type: 'select', label: 'Select', defaultProps: { label: 'Select', options: ['Option 1', 'Option 2'], required: false } },
    { type: 'radio', label: 'Radio Group', defaultProps: { label: 'Radio Group', options: ['Option 1', 'Option 2'], required: false } },
    { type: 'checkbox', label: 'Checkbox', defaultProps: { label: 'Checkbox', required: false } },
    { type: 'checkbox-group', label: 'Checkbox Group', defaultProps: { label: 'Checkbox Group', options: ['Option 1', 'Option 2'] } },
    { type: 'date', label: 'Date Picker', defaultProps: { label: 'Date', required: false } },
    { type: 'time', label: 'Time Picker', defaultProps: { label: 'Time', required: false } },
    { type: 'file', label: 'File Upload', defaultProps: { label: 'File Upload', accept: 'image/*,application/pdf', maxSize: 5, required: false } },
    { type: 'rating', label: 'Rating', defaultProps: { label: 'Rating', max: 5, required: false } },
    { type: 'captcha', label: 'Captcha', defaultProps: { label: 'Captcha', siteKey: '', required: true } },
    { type: 'heading', label: 'Heading', defaultProps: { text: 'Section Heading', level: 'h3' } },
    { type: 'paragraph', label: 'Paragraph', defaultProps: { text: 'This is a descriptive paragraph.' } },
    { type: 'html', label: 'HTML Block', defaultProps: { content: '<div>Custom HTML content</div>' } },
];

// Draggable Field Component
const DraggableField = ({ field, index, moveField, onEdit, onDelete, onDuplicate }) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'FORM_FIELD',
        item: { index, id: field.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [{ isOver }, drop] = useDrop({
        accept: 'FORM_FIELD',
        hover: (item) => {
            if (item.index !== index) {
                moveField(item.index, index);
                item.index = index;
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    const getFieldPreview = () => {
        switch (field.type) {
            case 'text':
            case 'email':
            case 'tel':
            case 'number':
                return (
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">
                            {field.label}
                            {field.required && <span className="text-danger-500 ml-1">*</span>}
                        </label>
                        <input type={field.type} placeholder={field.placeholder} disabled className="w-full px-3 py-2 bg-surface border border-border rounded-lg opacity-50" />
                    </div>
                );
            case 'textarea':
                return (
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">
                            {field.label}
                            {field.required && <span className="text-danger-500 ml-1">*</span>}
                        </label>
                        <textarea rows={field.rows || 3} placeholder={field.placeholder} disabled className="w-full px-3 py-2 bg-surface border border-border rounded-lg opacity-50" />
                    </div>
                );
            case 'select':
                return (
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">
                            {field.label}
                            {field.required && <span className="text-danger-500 ml-1">*</span>}
                        </label>
                        <select disabled className="w-full px-3 py-2 bg-surface border border-border rounded-lg opacity-50">
                            {field.options?.map((opt, i) => <option key={i}>{opt}</option>)}
                        </select>
                    </div>
                );
            case 'radio':
                return (
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">{field.label}</label>
                        <div className="space-y-1">
                            {field.options?.map((opt, i) => (
                                <label key={i} className="flex items-center gap-2">
                                    <input type="radio" name={field.id} disabled className="opacity-50" />
                                    <span className="text-sm text-text-secondary">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            case 'checkbox':
                return (
                    <label className="flex items-center gap-2">
                        <input type="checkbox" disabled className="opacity-50" />
                        <span className="text-sm text-text-secondary">
                            {field.label}
                            {field.required && <span className="text-danger-500 ml-1">*</span>}
                        </span>
                    </label>
                );
            case 'file':
                return (
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">
                            {field.label}
                            {field.required && <span className="text-danger-500 ml-1">*</span>}
                        </label>
                        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center opacity-50">
                            <span className="text-text-secondary">Click to upload</span>
                        </div>
                    </div>
                );
            case 'rating':
                return (
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">{field.label}</label>
                        <div className="flex gap-1">
                            {[...Array(field.max || 5)].map((_, i) => (
                                <Star key={i} className="w-6 h-6 text-text-secondary opacity-50" />
                            ))}
                        </div>
                    </div>
                );
            case 'heading':
                const HeadingTag = field.level || 'h3';
                return <HeadingTag className="text-text-primary">{field.text}</HeadingTag>;
            case 'paragraph':
                return <p className="text-text-secondary">{field.text}</p>;
            case 'html':
                return <div dangerouslySetInnerHTML={{ __html: field.content }} className="text-text-secondary" />;
            default:
                return <div className="text-text-secondary">{field.type} field</div>;
        }
    };

    return (
        <div
            ref={(node) => drag(drop(node))}
            className={cn(
                'relative group bg-surface border rounded-lg p-4 cursor-move transition-all',
                isDragging ? 'opacity-50' : 'opacity-100',
                isOver ? 'border-primary-500' : 'border-border'
            )}
        >
            <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-text-secondary" />
            </div>
            <div className="ml-6">
                {getFieldPreview()}
            </div>
            <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(field)} className="p-1 rounded hover:bg-surface-light">
                    <Settings className="w-4 h-4 text-text-secondary" />
                </button>
                <button onClick={() => onDuplicate(field)} className="p-1 rounded hover:bg-surface-light">
                    <Copy className="w-4 h-4 text-text-secondary" />
                </button>
                <button onClick={() => onDelete(field.id)} className="p-1 rounded hover:bg-danger-500/10">
                    <Trash2 className="w-4 h-4 text-danger-500" />
                </button>
            </div>
        </div>
    );
};

// Field Library Component
const FieldLibrary = ({ onAddField }) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'NEW_FIELD',
        item: { type: 'NEW_FIELD' },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div className="w-64 bg-surface border-r border-border p-4 overflow-y-auto">
            <h3 className="font-semibold text-text-primary mb-4">Form Fields</h3>
            <div className="space-y-2">
                {FIELD_TYPES.map((fieldType) => (
                    <div
                        key={fieldType.type}
                        onClick={() => onAddField(fieldType.type)}
                        className="flex items-center gap-3 p-2 bg-surface-light rounded-lg cursor-pointer hover:bg-primary-500/10 transition-colors"
                    >
                        {React.createElement(FIELD_ICONS[fieldType.type] || Type, { className: 'w-5 h-5 text-text-secondary' })}
                        <span className="text-sm text-text-primary">{fieldType.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Field Properties Editor
const FieldProperties = ({ field, onUpdate, onClose }) => {
    const [localField, setLocalField] = useState(field);

    const handleChange = (key, value) => {
        setLocalField({ ...localField, [key]: value });
        onUpdate({ ...localField, [key]: value });
    };

    const handleOptionAdd = () => {
        const options = [...(localField.options || []), `Option ${(localField.options?.length || 0) + 1}`];
        setLocalField({ ...localField, options });
        onUpdate({ ...localField, options });
    };

    const handleOptionRemove = (index) => {
        const options = localField.options.filter((_, i) => i !== index);
        setLocalField({ ...localField, options });
        onUpdate({ ...localField, options });
    };

    const handleOptionChange = (index, value) => {
        const options = [...localField.options];
        options[index] = value;
        setLocalField({ ...localField, options });
        onUpdate({ ...localField, options });
    };

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-surface border-l border-border shadow-xl z-50 overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-text-primary">Field Properties</h3>
                <button onClick={onClose} className="p-1 rounded hover:bg-surface-light">
                    <X className="w-4 h-4 text-text-secondary" />
                </button>
            </div>
            <div className="p-4 space-y-4">
                <div>
                    <label className="block text-sm text-text-secondary mb-1">Field Label</label>
                    <input
                        type="text"
                        value={localField.label || ''}
                        onChange={(e) => handleChange('label', e.target.value)}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                    />
                </div>
                
                {!['heading', 'paragraph', 'html'].includes(localField.type) && (
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Placeholder</label>
                        <input
                            type="text"
                            value={localField.placeholder || ''}
                            onChange={(e) => handleChange('placeholder', e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                        />
                    </div>
                )}
                
                {['select', 'radio', 'checkbox-group'].includes(localField.type) && (
                    <div>
                        <label className="block text-sm text-text-secondary mb-2">Options</label>
                        <div className="space-y-2">
                            {localField.options?.map((option, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                                    />
                                    <button onClick={() => handleOptionRemove(index)} className="p-2 text-danger-500 hover:bg-danger-500/10 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button onClick={handleOptionAdd} className="text-sm text-primary-500 hover:underline">
                                + Add Option
                            </button>
                        </div>
                    </div>
                )}
                
                {localField.type === 'file' && (
                    <>
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">Accepted File Types</label>
                            <input
                                type="text"
                                value={localField.accept || 'image/*,application/pdf'}
                                onChange={(e) => handleChange('accept', e.target.value)}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">Max Size (MB)</label>
                            <input
                                type="number"
                                value={localField.maxSize || 5}
                                onChange={(e) => handleChange('maxSize', parseInt(e.target.value))}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                            />
                        </div>
                    </>
                )}
                
                {localField.type === 'rating' && (
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Max Rating</label>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={localField.max || 5}
                            onChange={(e) => handleChange('max', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                        />
                    </div>
                )}
                
                {localField.type === 'heading' && (
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">Heading Level</label>
                        <select
                            value={localField.level || 'h3'}
                            onChange={(e) => handleChange('level', e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                        >
                            <option value="h1">H1</option>
                            <option value="h2">H2</option>
                            <option value="h3">H3</option>
                            <option value="h4">H4</option>
                        </select>
                    </div>
                )}
                
                {localField.type === 'html' && (
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">HTML Content</label>
                        <textarea
                            value={localField.content || ''}
                            onChange={(e) => handleChange('content', e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary font-mono text-sm"
                        />
                    </div>
                )}
                
                {!['heading', 'paragraph', 'html'].includes(localField.type) && (
                    <div className="flex items-center justify-between">
                        <label className="text-sm text-text-secondary">Required Field</label>
                        <button
                            onClick={() => handleChange('required', !localField.required)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${localField.required ? 'bg-primary-500' : 'bg-surface-light'}`}
                        >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${localField.required ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Conditional Logic Builder
const ConditionalLogicBuilder = ({ logic, fields, onUpdate }) => {
    const [newRule, setNewRule] = useState({ fieldId: '', operator: 'equals', value: '' });

    const addRule = () => {
        if (newRule.fieldId && newRule.value) {
            onUpdate([...(logic || []), newRule]);
            setNewRule({ fieldId: '', operator: 'equals', value: '' });
        }
    };

    const removeRule = (index) => {
        onUpdate(logic.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-primary">Conditional Logic</h4>
            <p className="text-xs text-text-secondary">Show/hide this field based on other field values</p>
            
            {(logic || []).map((rule, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-surface-light rounded-lg">
                    <span className="text-sm text-text-primary">Show if</span>
                    <select className="px-2 py-1 bg-surface border border-border rounded text-sm">
                        {fields.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                    <select className="px-2 py-1 bg-surface border border-border rounded text-sm">
                        <option value="equals">equals</option>
                        <option value="not-equals">not equals</option>
                        <option value="contains">contains</option>
                        <option value="empty">is empty</option>
                        <option value="not-empty">is not empty</option>
                    </select>
                    <input type="text" placeholder="Value" className="flex-1 px-2 py-1 bg-surface border border-border rounded text-sm" />
                    <button onClick={() => removeRule(index)} className="p-1 text-danger-500">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
            
            <div className="flex items-center gap-2">
                <select
                    value={newRule.fieldId}
                    onChange={(e) => setNewRule({ ...newRule, fieldId: e.target.value })}
                    className="flex-1 px-2 py-1 bg-surface border border-border rounded text-sm"
                >
                    <option value="">Select field</option>
                    {fields.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
                <select
                    value={newRule.operator}
                    onChange={(e) => setNewRule({ ...newRule, operator: e.target.value })}
                    className="px-2 py-1 bg-surface border border-border rounded text-sm"
                >
                    <option value="equals">equals</option>
                    <option value="not-equals">not equals</option>
                    <option value="contains">contains</option>
                </select>
                <input
                    type="text"
                    placeholder="Value"
                    value={newRule.value}
                    onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                    className="flex-1 px-2 py-1 bg-surface border border-border rounded text-sm"
                />
                <button onClick={addRule} className="px-2 py-1 bg-primary-500 text-white rounded text-sm">
                    Add
                </button>
            </div>
        </div>
    );
};

// Multi-Step Form Builder
const MultiStepBuilder = ({ steps, onUpdate }) => {
    const [newStep, setNewStep] = useState({ title: '', fields: [] });

    const addStep = () => {
        if (newStep.title) {
            onUpdate([...(steps || []), { ...newStep, id: Date.now().toString() }]);
            setNewStep({ title: '', fields: [] });
        }
    };

    const removeStep = (index) => {
        onUpdate(steps.filter((_, i) => i !== index));
    };

    const updateStep = (index, updates) => {
        const updated = [...steps];
        updated[index] = { ...updated[index], ...updates };
        onUpdate(updated);
    };

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-primary">Multi-Step Form</h4>
            <p className="text-xs text-text-secondary">Break your form into multiple pages</p>
            
            <div className="space-y-2">
                {(steps || []).map((step, index) => (
                    <div key={step.id} className="flex items-center gap-2 p-3 bg-surface-light rounded-lg">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={step.title}
                                onChange={(e) => updateStep(index, { title: e.target.value })}
                                placeholder="Step Title"
                                className="w-full px-2 py-1 bg-surface border border-border rounded text-sm"
                            />
                        </div>
                        <button onClick={() => removeStep(index)} className="p-1 text-danger-500">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newStep.title}
                    onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                    placeholder="Step Title"
                    className="flex-1 px-2 py-1 bg-surface border border-border rounded text-sm"
                />
                <button onClick={addStep} className="px-3 py-1 bg-primary-500 text-white rounded text-sm">
                    Add Step
                </button>
            </div>
        </div>
    );
};

// Form Settings Panel
const FormSettings = ({ settings, onUpdate }) => {
    const [localSettings, setLocalSettings] = useState(settings || {
        successMessage: 'Form submitted successfully!',
        redirectUrl: '',
        submitButtonText: 'Submit',
        emailNotifications: [],
        storeEntries: true,
        enableCaptcha: false,
        captchaSiteKey: '',
        webhookUrl: '',
        confirmationModal: true,
    });

    const handleChange = (key, value) => {
        const updated = { ...localSettings, [key]: value };
        setLocalSettings(updated);
        onUpdate(updated);
    };

    const addEmailNotification = () => {
        handleChange('emailNotifications', [...(localSettings.emailNotifications || []), { to: '', subject: 'New Form Submission' }]);
    };

    const updateEmailNotification = (index, updates) => {
        const notifications = [...(localSettings.emailNotifications || [])];
        notifications[index] = { ...notifications[index], ...updates };
        handleChange('emailNotifications', notifications);
    };

    const removeEmailNotification = (index) => {
        const notifications = localSettings.emailNotifications.filter((_, i) => i !== index);
        handleChange('emailNotifications', notifications);
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm text-text-secondary mb-1">Success Message</label>
                <input
                    type="text"
                    value={localSettings.successMessage}
                    onChange={(e) => handleChange('successMessage', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                />
            </div>
            
            <div>
                <label className="block text-sm text-text-secondary mb-1">Redirect URL (optional)</label>
                <input
                    type="text"
                    value={localSettings.redirectUrl}
                    onChange={(e) => handleChange('redirectUrl', e.target.value)}
                    placeholder="/thank-you"
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                />
            </div>
            
            <div>
                <label className="block text-sm text-text-secondary mb-1">Submit Button Text</label>
                <input
                    type="text"
                    value={localSettings.submitButtonText}
                    onChange={(e) => handleChange('submitButtonText', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                />
            </div>
            
            <div className="border-t border-border pt-4">
                <h4 className="font-medium text-text-primary mb-3">Email Notifications</h4>
                {(localSettings.emailNotifications || []).map((notification, index) => (
                    <div key={index} className="space-y-2 p-3 bg-surface-light rounded-lg mb-3">
                        <input
                            type="email"
                            value={notification.to}
                            onChange={(e) => updateEmailNotification(index, { to: e.target.value })}
                            placeholder="Recipient Email"
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                        />
                        <input
                            type="text"
                            value={notification.subject}
                            onChange={(e) => updateEmailNotification(index, { subject: e.target.value })}
                            placeholder="Subject"
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                        />
                        <button onClick={() => removeEmailNotification(index)} className="text-sm text-danger-500 hover:underline">
                            Remove
                        </button>
                    </div>
                ))}
                <button onClick={addEmailNotification} className="text-sm text-primary-500 hover:underline">
                    + Add Email Notification
                </button>
            </div>
            
            <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm text-text-secondary">Store Entries in Database</label>
                        <p className="text-xs text-text-secondary">Save form submissions to database</p>
                    </div>
                    <button
                        onClick={() => handleChange('storeEntries', !localSettings.storeEntries)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${localSettings.storeEntries ? 'bg-primary-500' : 'bg-surface-light'}`}
                    >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${localSettings.storeEntries ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                    </button>
                </div>
            </div>
            
            <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <label className="block text-sm text-text-secondary">Enable Captcha</label>
                        <p className="text-xs text-text-secondary">Add spam protection</p>
                    </div>
                    <button
                        onClick={() => handleChange('enableCaptcha', !localSettings.enableCaptcha)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${localSettings.enableCaptcha ? 'bg-primary-500' : 'bg-surface-light'}`}
                    >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${localSettings.enableCaptcha ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                    </button>
                </div>
                {localSettings.enableCaptcha && (
                    <div>
                        <label className="block text-sm text-text-secondary mb-1">reCAPTCHA Site Key</label>
                        <input
                            type="text"
                            value={localSettings.captchaSiteKey}
                            onChange={(e) => handleChange('captchaSiteKey', e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                        />
                    </div>
                )}
            </div>
            
            <div className="border-t border-border pt-4">
                <div>
                    <label className="block text-sm text-text-secondary mb-1">Webhook URL</label>
                    <input
                        type="url"
                        value={localSettings.webhookUrl}
                        onChange={(e) => handleChange('webhookUrl', e.target.value)}
                        placeholder="https://example.com/webhook"
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
                    />
                    <p className="text-xs text-text-secondary mt-1">Send form data to external service</p>
                </div>
            </div>
            
            <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm text-text-secondary">Show Confirmation Modal</label>
                        <p className="text-xs text-text-secondary">Display modal after submission</p>
                    </div>
                    <button
                        onClick={() => handleChange('confirmationModal', !localSettings.confirmationModal)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${localSettings.confirmationModal ? 'bg-primary-500' : 'bg-surface-light'}`}
                    >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-text-primary transition-transform ${localSettings.confirmationModal ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Entry Manager
const EntryManager = ({ entries, onView, onDelete, onExport }) => {
    const [viewingEntry, setViewingEntry] = useState(null);

    if (!entries || entries.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-text-primary mb-2">No submissions yet</p>
                <p className="text-sm text-text-secondary">Form submissions will appear here</p>
            </div>
        );
    }

    const headers = entries[0] ? Object.keys(entries[0].data) : [];

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button variant="outline" onClick={onExport} leftIcon={<Download className="w-4 h-4" />}>
                    Export CSV
                </Button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-surface-light border-b border-border">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm text-text-primary">#</th>
                            {headers.map((header, idx) => (
                                <th key={idx} className="px-4 py-3 text-left text-sm text-text-primary">{header}</th>
                            ))}
                            <th className="px-4 py-3 text-left text-sm text-text-primary">Date</th>
                            <th className="px-4 py-3 text-left text-sm text-text-primary">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {entries.map((entry, idx) => (
                            <tr key={entry.id} className="hover:bg-surface-light">
                                <td className="px-4 py-3 text-sm text-text-secondary">{idx + 1}</td>
                                {headers.map((header, hIdx) => (
                                    <td key={hIdx} className="px-4 py-3 text-sm text-text-secondary max-w-xs truncate">
                                        {entry.data[header]}
                                    </td>
                                ))}
                                <td className="px-4 py-3 text-sm text-text-secondary">
                                    {new Date(entry.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => setViewingEntry(entry)} className="p-1 rounded hover:bg-surface-light">
                                            <Eye className="w-4 h-4 text-text-secondary" />
                                        </button>
                                        <button onClick={() => onDelete(entry.id)} className="p-1 rounded hover:bg-danger-500/10">
                                            <Trash2 className="w-4 h-4 text-danger-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* View Entry Modal */}
            {viewingEntry && (
                <Modal isOpen={!!viewingEntry} onClose={() => setViewingEntry(null)} title="Submission Details" size="lg">
                    <div className="space-y-3">
                        <div className="bg-surface-light rounded-lg p-4">
                            {Object.entries(viewingEntry.data).map(([key, value]) => (
                                <div key={key} className="mb-3">
                                    <label className="block text-sm text-text-secondary mb-1">{key}</label>
                                    <p className="text-text-primary">{String(value)}</p>
                                </div>
                            ))}
                            <div className="mt-4 pt-3 border-t border-border">
                                <label className="block text-sm text-text-secondary mb-1">Submitted</label>
                                <p className="text-text-primary">{new Date(viewingEntry.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => setViewingEntry(null)} fullWidth>Close</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// Form Analytics
const FormAnalytics = ({ views, submissions, conversionRate }) => {
    const [timeframe, setTimeframe] = useState('7d');
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-text-primary">Form Analytics</h3>
                <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="px-3 py-1 bg-surface border border-border rounded-lg text-sm"
                >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                </select>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface border border-border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-primary-500">{views}</p>
                    <p className="text-sm text-text-secondary">Views</p>
                </div>
                <div className="bg-surface border border-border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-success-500">{submissions}</p>
                    <p className="text-sm text-text-secondary">Submissions</p>
                </div>
                <div className="bg-surface border border-border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-warning-500">{conversionRate}%</p>
                    <p className="text-sm text-text-secondary">Conversion Rate</p>
                </div>
            </div>
            
            {/* Simple chart representation */}
            <div className="bg-surface border border-border rounded-lg p-4">
                <h4 className="text-sm font-medium text-text-primary mb-3">Last 30 Days Activity</h4>
                <div className="space-y-2">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-xs text-text-secondary w-12">Day {i + 1}</span>
                            <div className="flex-1 h-6 bg-surface-light rounded overflow-hidden">
                                <div className="h-full bg-primary-500 rounded" style={{ width: `${Math.random() * 100}%` }} />
                            </div>
                            <span className="text-xs text-text-secondary w-8">{Math.floor(Math.random() * 50)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Pre-built Templates
const FORM_TEMPLATES = [
    { id: 'contact', name: 'Contact Form', description: 'Basic contact form with name, email, message', fields: [
        { type: 'text', label: 'Name', required: true },
        { type: 'email', label: 'Email', required: true },
        { type: 'textarea', label: 'Message', required: true, rows: 4 },
    ] },
    { id: 'registration', name: 'Registration Form', description: 'User registration with password confirmation', fields: [
        { type: 'text', label: 'Username', required: true },
        { type: 'email', label: 'Email', required: true },
        { type: 'password', label: 'Password', required: true },
        { type: 'password', label: 'Confirm Password', required: true },
    ] },
    { id: 'feedback', name: 'Feedback Form', description: 'Product feedback with rating', fields: [
        { type: 'text', label: 'Name' },
        { type: 'email', label: 'Email' },
        { type: 'rating', label: 'Rating', max: 5 },
        { type: 'textarea', label: 'Feedback', rows: 4 },
    ] },
    { id: 'job', name: 'Job Application', description: 'Job application with file upload', fields: [
        { type: 'text', label: 'Full Name', required: true },
        { type: 'email', label: 'Email', required: true },
        { type: 'tel', label: 'Phone' },
        { type: 'file', label: 'Resume', required: true, accept: 'application/pdf' },
        { type: 'textarea', label: 'Cover Letter', rows: 6 },
    ] },
    { id: 'survey', name: 'Survey Form', description: 'Multi-question survey', fields: [
        { type: 'text', label: 'How did you hear about us?' },
        { type: 'radio', label: 'Would you recommend us?', options: ['Yes', 'No', 'Maybe'] },
        { type: 'rating', label: 'Overall satisfaction', max: 5 },
        { type: 'textarea', label: 'Suggestions for improvement', rows: 4 },
    ] },
];

const TemplateSelector = ({ onSelect }) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            {FORM_TEMPLATES.map((template) => (
                <div
                    key={template.id}
                    onClick={() => onSelect(template)}
                    className="bg-surface border border-border rounded-lg p-4 cursor-pointer hover:border-primary-500 transition-colors"
                >
                    <h4 className="font-semibold text-text-primary">{template.name}</h4>
                    <p className="text-sm text-text-secondary mt-1">{template.description}</p>
                    <p className="text-xs text-text-secondary mt-2">{template.fields.length} fields</p>
                </div>
            ))}
        </div>
    );
};

// Main Form Builder Component
export const FormBuilder = () => {
    const [fields, setFields] = useState([]);
    const [settings, setSettings] = useState({});
    const [entries, setEntries] = useState([]);
    const [selectedField, setSelectedField] = useState(null);
    const [showFieldEditor, setShowFieldEditor] = useState(false);
    const [showTemplateSelector, setShowTemplateSelector] = useState(true);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [formViews, setFormViews] = useState(0);
    const [formSubmissions, setFormSubmissions] = useState(0);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const addField = (fieldType) => {
        const template = FIELD_TYPES.find(ft => ft.type === fieldType);
        const newField = {
            id: Date.now().toString(),
            type: fieldType,
            ...template.defaultProps,
        };
        setFields([...fields, newField]);
        showToast(`Added ${template.label} field`, 'success');
    };

    const moveField = (fromIndex, toIndex) => {
        const updated = [...fields];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        setFields(updated);
    };

    const updateField = (updatedField) => {
        setFields(fields.map(f => f.id === updatedField.id ? updatedField : f));
        setShowFieldEditor(false);
        setSelectedField(null);
    };

    const deleteField = (fieldId) => {
        setFields(fields.filter(f => f.id !== fieldId));
        showToast('Field deleted', 'info');
    };

    const duplicateField = (field) => {
        const newField = { ...field, id: Date.now().toString() };
        setFields([...fields, newField]);
        showToast('Field duplicated', 'success');
    };

    const applyTemplate = (template) => {
        const newFields = template.fields.map((f, index) => ({
            ...f,
            id: Date.now().toString() + index,
        }));
        setFields(newFields);
        setShowTemplateSelector(false);
        showToast(`Applied ${template.name} template`, 'success');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        const entry = {
            id: Date.now().toString(),
            data,
            createdAt: new Date().toISOString(),
        };
        
        setEntries([entry, ...entries]);
        setFormSubmissions(formSubmissions + 1);
        
        // Send email notifications
        if (settings.emailNotifications) {
            // Email sending logic here
        }
        
        // Send webhook
        if (settings.webhookUrl) {
            try {
                await fetch(settings.webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
            } catch (error) {
                console.error('Webhook failed:', error);
            }
        }
        
        showToast(settings.successMessage || 'Form submitted successfully!', 'success');
        e.target.reset();
    };

    // Track form view
    React.useEffect(() => {
        setFormViews(prev => prev + 1);
    }, []);

    const conversionRate = formViews > 0 ? ((formSubmissions / formViews) * 100).toFixed(1) : 0;

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex h-full">
                <FieldLibrary onAddField={addField} />
                
                <div className="flex-1 overflow-y-auto p-6">
                    {showTemplateSelector && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-text-primary">Choose a Template</h2>
                                <button onClick={() => setShowTemplateSelector(false)} className="text-sm text-primary-500">
                                    Start from scratch
                                </button>
                            </div>
                            <TemplateSelector onSelect={applyTemplate} />
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
                        {fields.map((field, index) => (
                            <DraggableField
                                key={field.id}
                                field={field}
                                index={index}
                                moveField={moveField}
                                onEdit={() => {
                                    setSelectedField(field);
                                    setShowFieldEditor(true);
                                }}
                                onDelete={deleteField}
                                onDuplicate={() => duplicateField(field)}
                            />
                        ))}
                        
                        {fields.length === 0 && !showTemplateSelector && (
                            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                                <div className="text-4xl mb-4">📝</div>
                                <p className="text-text-primary mb-2">No fields added yet</p>
                                <p className="text-sm text-text-secondary">Drag fields from the left panel or choose a template</p>
                                <button onClick={() => setShowTemplateSelector(true)} className="mt-4 text-primary-500 hover:underline">
                                    Browse Templates
                                </button>
                            </div>
                        )}
                        
                        {fields.length > 0 && (
                            <Button type="submit" variant="primary" size="lg" fullWidth>
                                {settings.submitButtonText || 'Submit'}
                            </Button>
                        )}
                    </form>
                </div>
                
                <div className="w-80 bg-surface border-l border-border overflow-y-auto">
                    <div className="p-4 border-b border-border">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowAnalytics(false)}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${!showAnalytics ? 'bg-primary-500 text-white' : 'text-text-secondary hover:bg-surface-light'}`}
                            >
                                Settings
                            </button>
                            <button
                                onClick={() => setShowAnalytics(true)}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${showAnalytics ? 'bg-primary-500 text-white' : 'text-text-secondary hover:bg-surface-light'}`}
                            >
                                Analytics
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-4">
                        {showAnalytics ? (
                            <FormAnalytics
                                views={formViews}
                                submissions={formSubmissions}
                                conversionRate={conversionRate}
                            />
                        ) : (
                            <FormSettings settings={settings} onUpdate={setSettings} />
                        )}
                    </div>
                </div>
            </div>
            
            {showFieldEditor && selectedField && (
                <FieldProperties
                    field={selectedField}
                    onUpdate={updateField}
                    onClose={() => {
                        setShowFieldEditor(false);
                        setSelectedField(null);
                    }}
                />
            )}
            
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}
        </DndProvider>
    );
};

export default FormBuilder;