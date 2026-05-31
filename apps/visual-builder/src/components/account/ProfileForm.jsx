import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';

export const ProfileForm = ({ user, onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    setIsOpen(false);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>Edit Profile</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit Profile" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Avatar URL</label>
            <input
              type="url"
              value={formData.avatar}
              onChange={e => handleChange('avatar', e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>Save</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProfileForm;
