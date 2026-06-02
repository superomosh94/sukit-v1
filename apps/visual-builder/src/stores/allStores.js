import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Project Store
export const useProjectStore = create(persist((set) => ({
    projects: [],
    addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
    deleteProject: (id) => set((s) => ({ projects: s.projects.filter(p => p.id !== id) })),
}), { name: 'sukit-projects' }));


// Form Store
export const useFormStore = create((set) => ({
    forms: [],
    addForm: (form) => set((s) => ({ forms: [...s.forms, form] })),
}));

// Popup Store
export const usePopupStore = create((set) => ({
    popups: [],
    addPopup: (popup) => set((s) => ({ popups: [...s.popups, popup] })),
}));

// Template Store
export const useTemplateStore = create(persist((set) => ({
    templates: [],
    addTemplate: (template) => set((s) => ({ templates: [...s.templates, template] })),
}), { name: 'sukit-templates' }));

// Plugin Store
export const usePluginStore = create(persist((set) => ({
    installedPlugins: [],
    availablePlugins: [],
    installPlugin: (plugin) => set((s) => ({ installedPlugins: [...s.installedPlugins, plugin] })),
    uninstallPlugin: (id) => set((s) => ({ installedPlugins: s.installedPlugins.filter(p => p.id !== id) })),
}), { name: 'sukit-plugins' }));

// User Store
export const useUserStore = create(persist((set) => ({
    user: { name: '', email: '' },
    updateProfile: (updates) => set((s) => ({ user: { ...s.user, ...updates } })),
}), { name: 'sukit-user' }));
