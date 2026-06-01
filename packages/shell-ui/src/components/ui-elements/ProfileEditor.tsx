'use client';

import React, { useState } from 'react';
import { User, Camera } from 'lucide-react';
import { ModalDialog } from '../modal/ModalDialog';

export interface ProfileEditorProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onSave: (data: { name: string; email: string; avatar?: string }) => void;
}

export function ProfileEditor({ user, onSave }: ProfileEditorProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-accent transition-colors"
      >
        <User size={16} />
        <span>Edit Profile</span>
      </button>
      <ModalDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Edit Profile"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={24} className="text-muted-foreground" />
              )}
              <button className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full">
                <Camera size={12} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm rounded-md border border-border hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave({ name, email });
                setOpen(false);
              }}
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </ModalDialog>
    </>
  );
}
