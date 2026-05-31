import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFormStore = create(
    persist(
        (set, get) => ({
            forms: [],
            currentForm: {
                id: 'default',
                name: 'Contact Form',
                fields: [
                    { id: '1', type: 'text', label: 'Name', required: true, placeholder: 'Enter your name' },
                    { id: '2', type: 'email', label: 'Email', required: true, placeholder: 'Enter your email' },
                    { id: '3', type: 'textarea', label: 'Message', required: true, placeholder: 'Enter your message', rows: 4 },
                ],
                settings: {
                    successMessage: 'Thank you for contacting us!',
                    redirectUrl: '',
                    sendEmailTo: 'admin@example.com',
                    storeEntries: true,
                    recaptchaEnabled: false,
                    recaptchaKey: '',
                    honeypotEnabled: false,
                    webhookUrl: '',
                    webhookEnabled: false,
                    confirmationModal: false,
                    confirmationTitle: 'Thank You!',
                    confirmationMessage: 'Your submission has been received.',
                },
                steps: [
                    { id: 'step1', title: 'Step 1', fields: ['1', '2'] },
                    { id: 'step2', title: 'Step 2', fields: ['3'] },
                ],
                analytics: {
                    views: 0,
                    starts: 0,
                    completions: 0,
                },
            },
            entries: [
                { id: '1', data: { name: 'John Doe', email: 'john@example.com', message: 'Hello!' }, createdAt: new Date().toISOString() },
                { id: '2', data: { name: 'Jane Smith', email: 'jane@example.com', message: 'Hi there!' }, createdAt: new Date().toISOString() },
            ],

            addForm: (form) => set((state) => ({ forms: [...state.forms, { ...form, id: Date.now().toString(), analytics: { views: 0, starts: 0, completions: 0 } }] })),

            updateForm: (id, updates) => set((state) => ({
                forms: state.forms.map(f => f.id === id ? { ...f, ...updates } : f),
                currentForm: state.currentForm?.id === id ? { ...state.currentForm, ...updates } : state.currentForm
            })),

            deleteForm: (id) => set((state) => ({ forms: state.forms.filter(f => f.id !== id) })),

            setCurrentForm: (form) => set({ currentForm: form }),

            addField: (fieldType) => set((state) => {
                const newField = {
                    id: Date.now().toString(),
                    type: fieldType,
                    label: fieldType.charAt(0).toUpperCase() + fieldType.slice(1),
                    required: false,
                    placeholder: `Enter ${fieldType}`,
                };
                return {
                    currentForm: {
                        ...state.currentForm,
                        fields: [...(state.currentForm?.fields || []), newField]
                    }
                };
            }),

            updateField: (fieldId, updates) => set((state) => ({
                currentForm: {
                    ...state.currentForm,
                    fields: state.currentForm?.fields?.map(f => f.id === fieldId ? { ...f, ...updates } : f) || []
                }
            })),

            deleteField: (fieldId) => set((state) => ({
                currentForm: {
                    ...state.currentForm,
                    fields: state.currentForm?.fields?.filter(f => f.id !== fieldId) || []
                }
            })),

            // Multi-step
            addStep: () => set((state) => {
                const steps = state.currentForm?.steps || [];
                return {
                    currentForm: {
                        ...state.currentForm,
                        steps: [...steps, { id: `step${Date.now()}`, title: `Step ${steps.length + 1}`, fields: [] }]
                    }
                };
            }),

            updateStep: (stepId, updates) => set((state) => ({
                currentForm: {
                    ...state.currentForm,
                    steps: state.currentForm?.steps?.map(s => s.id === stepId ? { ...s, ...updates } : s) || []
                }
            })),

            deleteStep: (stepId) => set((state) => ({
                currentForm: {
                    ...state.currentForm,
                    steps: state.currentForm?.steps?.filter(s => s.id !== stepId) || []
                }
            })),

            reorderSteps: (steps) => set((state) => ({
                currentForm: { ...state.currentForm, steps }
            })),

            // Form Settings
            updateFormSettings: (settings) => set((state) => ({
                currentForm: {
                    ...state.currentForm,
                    settings: { ...state.currentForm.settings, ...settings }
                }
            })),

            // Analytics
            incrementView: (formId) => set((state) => ({
                forms: state.forms.map(f => f.id === formId ? { ...f, analytics: { ...f.analytics, views: (f.analytics?.views || 0) + 1 } } : f),
                currentForm: state.currentForm?.id === formId ? { ...state.currentForm, analytics: { ...state.currentForm.analytics, views: (state.currentForm.analytics?.views || 0) + 1 } } : state.currentForm
            })),

            incrementStart: (formId) => set((state) => ({
                forms: state.forms.map(f => f.id === formId ? { ...f, analytics: { ...f.analytics, starts: (f.analytics?.starts || 0) + 1 } } : f),
                currentForm: state.currentForm?.id === formId ? { ...state.currentForm, analytics: { ...state.currentForm.analytics, starts: (state.currentForm.analytics?.starts || 0) + 1 } } : state.currentForm
            })),

            incrementCompletion: (formId) => set((state) => ({
                forms: state.forms.map(f => f.id === formId ? { ...f, analytics: { ...f.analytics, completions: (f.analytics?.completions || 0) + 1 } } : f),
                currentForm: state.currentForm?.id === formId ? { ...state.currentForm, analytics: { ...state.currentForm.analytics, completions: (state.currentForm.analytics?.completions || 0) + 1 } } : state.currentForm
            })),

            getConversionRate: (formId) => {
                const form = get().forms.find(f => f.id === formId) || get().currentForm;
                const analytics = form?.analytics || {};
                if (!analytics.starts || analytics.starts === 0) return 0;
                return Math.round((analytics.completions / analytics.starts) * 100);
            },

            // Webhook test
            testWebhook: async (url) => {
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
                    });
                    return response.ok ? { success: true } : { success: false, error: `HTTP ${response.status}` };
                } catch (err) {
                    return { success: false, error: err.message };
                }
            },

            addEntry: (entry) => set((state) => ({
                entries: [{ ...entry, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...state.entries]
            })),

            deleteEntry: (id) => set((state) => ({ entries: state.entries.filter(e => e.id !== id) })),
        }),
        { name: 'sukit-forms' }
    )
);
