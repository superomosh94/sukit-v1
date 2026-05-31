import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useComponentStore } from '../../stores/componentStore';
import { v4 as uuidv4 } from 'uuid';

/**
 * Modal form for creating a custom component.
 * Fields: name, category, description, code (JSX string).
 * On submit it adds the component to the store and closes the modal.
 */
const CustomComponentForm = () => {
  const { addComponent, setShowCustomForm, showCustomForm } = useComponentStore();
  const [formData, setFormData] = useState({
    name: '',
    category: 'custom',
    description: '',
    code: `export const ${'MyComponent'} = () => (\n  <div className="p-4 bg-surface rounded">My Component</div>\n);`,
  });

  if (!showCustomForm) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = uuidv4();
    const component = { id, ...formData };
    addComponent(component);
    setShowCustomForm(false);
    setFormData({ name: '', category: 'custom', description: '', code: '' });
  };

  return (
    <div className={cn('fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50')}> 
      <div className={cn('bg-surface rounded-lg shadow-xl w-11/12 max-w-2xl')}>
        <div className={cn('flex justify-between items-center p-4 border-b border-border')}> 
          <h2 className="text-lg font-semibold">Create Custom Component</h2>
          <button onClick={() => setShowCustomForm(false)} className={cn('p-1 text-text-secondary hover:text-primary-500')}> 
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={cn('p-4 space-y-4')}>
          <div>
            <label className="block text-text-primary mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={cn('w-full border border-border rounded px-3 py-2 bg-surface text-text-primary')}
            />
          </div>
          <div>
            <label className="block text-text-primary mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={cn('w-full border border-border rounded px-3 py-2 bg-surface text-text-primary')}
            >
              <option value="layout">Layout</option>
              <option value="typography">Typography</option>
              <option value="media">Media</option>
              <option value="forms">Forms</option>
              <option value="data">Data</option>
              <option value="navigation">Navigation</option>
              <option value="ecommerce">E‑commerce</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-text-primary mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className={cn('w-full border border-border rounded px-3 py-2 bg-surface text-text-primary')}
            />
          </div>
          <div>
            <label className="block text-text-primary mb-1">Component Code (JSX)</label>
            <textarea
              name="code"
              value={formData.code}
              onChange={handleChange}
              rows={6}
              required
              className={cn('w-full border border-border rounded px-3 py-2 font-mono bg-surface text-text-primary')}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCustomForm(false)} className={cn('px-4 py-2 bg-surface border border-border rounded text-text-primary hover:bg-surface-light')}>Cancel</button>
            <button type="submit" className={cn('px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 flex items-center gap-1')}> 
              <Save size={16} /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomComponentForm;
