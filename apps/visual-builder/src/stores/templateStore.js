import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTemplateStore = create(
    persist(
        (set, get) => ({
            templates: [
                { id: '1', name: 'Business Starter', category: 'business', description: 'Perfect for corporate websites', thumbnail: null, uses: 1234, preview: null },
                { id: '2', name: 'Portfolio Agency', category: 'portfolio', description: 'Showcase your work beautifully', thumbnail: null, uses: 2345, preview: null },
                { id: '3', name: 'E-commerce Store', category: 'ecommerce', description: 'Online store template', thumbnail: null, uses: 3456, preview: null },
                { id: '4', name: 'Blog Magazine', category: 'blog', description: 'Content-rich blog layout', thumbnail: null, uses: 4567, preview: null },
                { id: '5', name: 'Landing Page', category: 'landing', description: 'High-converting landing page', thumbnail: null, uses: 5678, preview: null },
                { id: '6', name: 'Restaurant', category: 'business', description: 'Menu and reservation system', thumbnail: null, uses: 6789, preview: null },
                { id: '7', name: 'Personal CV', category: 'portfolio', description: 'Professional resume template', thumbnail: null, uses: 7890, preview: null },
                { id: '8', name: 'Wedding Invitation', category: 'event', description: 'Beautiful wedding website', thumbnail: null, uses: 8901, preview: null },
                { id: '9', name: 'Real Estate', category: 'business', description: 'Property listing template', thumbnail: null, uses: 9012, preview: null },
                { id: '10', name: 'Education', category: 'business', description: 'Course and school website', thumbnail: null, uses: 10123, preview: null },
            ],
            myTemplates: [],
            
            addTemplate: (template) => set((state) => ({
                myTemplates: [...state.myTemplates, { ...template, id: Date.now().toString(), savedAt: new Date().toISOString() }]
            })),
            
            deleteTemplate: (id) => set((state) => ({
                myTemplates: state.myTemplates.filter(t => t.id !== id)
            })),
            
            updateTemplate: (id, updates) => set((state) => ({
                myTemplates: state.myTemplates.map(t => t.id === id ? { ...t, ...updates } : t)
            })),
        }),
        { name: 'sukit-templates' }
    )
);
📦 BATCH 4: CODE EDITOR PAGE