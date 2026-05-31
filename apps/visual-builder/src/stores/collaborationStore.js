import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialRoles = [
  { id: 'admin', name: 'Admin', permissions: ['read', 'write', 'delete', 'manage', 'publish'] },
  { id: 'editor', name: 'Editor', permissions: ['read', 'write', 'publish'] },
  { id: 'viewer', name: 'Viewer', permissions: ['read'] },
];

export const useCollaborationStore = create(
  persist(
    (set, get) => ({
      collaborators: [
        { id: 'user-1', name: 'You', email: 'you@example.com', role: 'admin', online: true, color: '#3B82F6' },
        { id: 'user-2', name: 'Alice', email: 'alice@example.com', role: 'editor', online: true, color: '#10B981' },
        { id: 'user-3', name: 'Bob', email: 'bob@example.com', role: 'viewer', online: false, color: '#F59E0B' },
      ],
      cursors: {},
      comments: [
        { id: 'c1', componentId: 'comp-1', authorId: 'user-2', text: 'Can we make this section full-width?', resolved: false, createdAt: '2026-05-27T10:30:00Z', replies: [] },
        { id: 'c2', componentId: 'comp-2', authorId: 'user-1', text: 'Updated the hero image', resolved: true, createdAt: '2026-05-26T14:00:00Z', replies: [] },
      ],
      versions: [
        { id: 'v1', label: 'Initial design', authorId: 'user-1', timestamp: '2026-05-25T09:00:00Z', snapshot: {} },
        { id: 'v2', label: 'Added hero section', authorId: 'user-2', timestamp: '2026-05-26T11:00:00Z', snapshot: {} },
        { id: 'v3', label: 'Updated color scheme', authorId: 'user-1', timestamp: '2026-05-27T08:00:00Z', snapshot: {} },
      ],
      activityFeed: [
        { id: 'a1', userId: 'user-1', action: 'updated the hero section', timestamp: '2026-05-27T10:32:00Z' },
        { id: 'a2', userId: 'user-2', action: 'added a new testimonial component', timestamp: '2026-05-27T10:15:00Z' },
        { id: 'a3', userId: 'user-1', action: 'changed primary color to blue', timestamp: '2026-05-27T09:45:00Z' },
        { id: 'a4', userId: 'user-2', action: 'commented on Navigation', timestamp: '2026-05-27T09:30:00Z' },
      ],
      notifications: [],
      publishStatus: 'draft',
      roles: initialRoles,

      addCollaborator: (email, role = 'viewer') => set((state) => ({
        collaborators: [...state.collaborators, {
          id: `user-${Date.now()}`,
          name: email.split('@')[0],
          email,
          role,
          online: false,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        }],
      })),

      removeCollaborator: (id) => set((state) => ({
        collaborators: state.collaborators.filter((c) => c.id !== id),
      })),

      updateCollaboratorRole: (id, role) => set((state) => ({
        collaborators: state.collaborators.map((c) => c.id === id ? { ...c, role } : c),
      })),

      setCursor: (userId, position) => set((state) => ({
        cursors: { ...state.cursors, [userId]: { ...position, updatedAt: Date.now() } },
      })),

      removeCursor: (userId) => set((state) => {
        const { [userId]: _, ...rest } = state.cursors;
        return { cursors: rest };
      }),

      addComment: (componentId, text) => set((state) => ({
        comments: [...state.comments, {
          id: `c${Date.now()}`,
          componentId,
          authorId: 'user-1',
          text,
          resolved: false,
          createdAt: new Date().toISOString(),
          replies: [],
        }],
        activityFeed: [{ id: `a${Date.now()}`, userId: 'user-1', action: `commented on a component`, timestamp: new Date().toISOString() }, ...state.activityFeed].slice(0, 50),
      })),

      resolveComment: (id) => set((state) => ({
        comments: state.comments.map((c) => c.id === id ? { ...c, resolved: true } : c),
      })),

      addReply: (commentId, text) => set((state) => ({
        comments: state.comments.map((c) => c.id === commentId ? { ...c, replies: [...c.replies, { id: `r${Date.now()}`, authorId: 'user-1', text, createdAt: new Date().toISOString() }] } : c),
      })),

      saveVersion: (label, snapshot) => set((state) => ({
        versions: [{ id: `v${Date.now()}`, label, authorId: 'user-1', timestamp: new Date().toISOString(), snapshot }, ...state.versions].slice(0, 50),
        activityFeed: [{ id: `a${Date.now()}`, userId: 'user-1', action: `saved version: ${label}`, timestamp: new Date().toISOString() }, ...state.activityFeed].slice(0, 50),
      })),

      restoreVersion: (versionId) => {
        const state = get();
        const version = state.versions.find((v) => v.id === versionId);
        if (version) {
          set((state) => ({
            activityFeed: [{ id: `a${Date.now()}`, userId: 'user-1', action: `restored version: ${version.label}`, timestamp: new Date().toISOString() }, ...state.activityFeed].slice(0, 50),
          }));
        }
        return version?.snapshot || null;
      },

      addActivity: (action) => set((state) => ({
        activityFeed: [{ id: `a${Date.now()}`, userId: 'user-1', action, timestamp: new Date().toISOString() }, ...state.activityFeed].slice(0, 100),
      })),

      addNotification: (message, type = 'info') => set((state) => ({
        notifications: [{ id: `n${Date.now()}`, message, type, read: false, timestamp: new Date().toISOString() }, ...state.notifications].slice(0, 50),
      })),

      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
      })),

      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      })),

      setPublishStatus: (status) => set((state) => {
        const actions = { draft: 'returned to draft', review: 'submitted for review', published: 'published the site' };
        return {
          publishStatus: status,
          activityFeed: [{ id: `a${Date.now()}`, userId: 'user-1', action: actions[status] || `changed status to ${status}`, timestamp: new Date().toISOString() }, ...state.activityFeed].slice(0, 100),
          notifications: [{ id: `n${Date.now()}`, message: `Site ${actions[status] || `moved to ${status}`}`, type: status === 'published' ? 'success' : 'info', read: false, timestamp: new Date().toISOString() }, ...state.notifications].slice(0, 50),
        };
      }),

      getUserName: (userId) => {
        const user = get().collaborators.find((c) => c.id === userId);
        return user?.name || 'Unknown';
      },

      getUserColor: (userId) => {
        const user = get().collaborators.find((c) => c.id === userId);
        return user?.color || '#999';
      },
    }),
    {
      name: 'sukit-collaboration',
      partialize: (state) => ({
        collaborators: state.collaborators,
        comments: state.comments,
        versions: state.versions,
        activityFeed: state.activityFeed,
        notifications: state.notifications,
        publishStatus: state.publishStatus,
      }),
    }
  )
);
