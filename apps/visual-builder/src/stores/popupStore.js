import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const popupTemplates = [
    {
        id: 'template-newsletter',
        name: 'Newsletter Signup',
        type: 'modal',
        triggers: { time: { enabled: true, delaySeconds: 5 }, scroll: { enabled: false, scrollPercent: 50 }, exit: { enabled: false }, click: { enabled: false } },
        content: { title: 'Stay Updated!', description: 'Subscribe to our newsletter for the latest news and updates.', buttonText: 'Subscribe' },
    },
    {
        id: 'template-announcement',
        name: 'Announcement',
        type: 'slide-in',
        triggers: { time: { enabled: true, delaySeconds: 3 }, scroll: { enabled: false, scrollPercent: 50 }, exit: { enabled: false }, click: { enabled: false } },
        content: { title: 'Big News!', description: 'Check out our latest features and updates.', buttonText: 'Learn More' },
    },
    {
        id: 'template-cookie',
        name: 'Cookie Consent',
        type: 'floating-bar',
        triggers: { time: { enabled: true, delaySeconds: 1 }, scroll: { enabled: false, scrollPercent: 50 }, exit: { enabled: false }, click: { enabled: false } },
        content: { title: 'Cookie Consent', description: 'We use cookies to improve your experience.', buttonText: 'Accept All' },
    },
    {
        id: 'template-discount',
        name: 'Welcome Discount',
        type: 'modal',
        triggers: { time: { enabled: true, delaySeconds: 10 }, scroll: { enabled: false, scrollPercent: 50 }, exit: { enabled: false }, click: { enabled: false } },
        content: { title: 'Welcome! Get 10% Off', description: 'Sign up now and get 10% off your first purchase.', buttonText: 'Get Discount' },
    },
];

export const usePopupStore = create(
    persist(
        (set, get) => ({
            popups: [],
            currentPopup: {
                id: 'default',
                name: 'Welcome Popup',
                type: 'modal',
                size: { width: 500, height: 400 },
                position: 'center',
                triggers: {
                    time: { enabled: true, delaySeconds: 5 },
                    scroll: { enabled: false, scrollPercent: 50 },
                    exit: { enabled: false },
                    click: { enabled: false },
                },
                rules: {
                    pages: 'all',
                    devices: { desktop: true, tablet: true, mobile: true },
                    users: { all: true, loggedIn: false, loggedOut: false },
                },
                animation: {
                    entrance: 'fade',
                    exit: 'fade',
                    duration: 300,
                },
                schedule: { enabled: false },
                content: {
                    title: 'Welcome!',
                    description: 'Thanks for visiting our site',
                    buttonText: 'Learn More',
                },
            },

            addPopup: (popup) => set((state) => ({ popups: [...state.popups, { ...popup, id: Date.now().toString() }] })),

            updatePopup: (id, updates) => set((state) => ({
                popups: state.popups.map(p => p.id === id ? { ...p, ...updates } : p),
                currentPopup: state.currentPopup?.id === id ? { ...state.currentPopup, ...updates } : state.currentPopup
            })),

            deletePopup: (id) => set((state) => ({ popups: state.popups.filter(p => p.id !== id) })),

            setCurrentPopup: (popup) => set({ currentPopup: popup }),

            // Templates
            getTemplates: () => popupTemplates,

            applyTemplate: (templateId) => {
                const template = popupTemplates.find(t => t.id === templateId);
                if (template) {
                    const newPopup = {
                        ...get().currentPopup,
                        name: template.name,
                        type: template.type,
                        triggers: JSON.parse(JSON.stringify(template.triggers)),
                        content: JSON.parse(JSON.stringify(template.content)),
                    };
                    set({ currentPopup: newPopup });
                }
            },
        }),
        { name: 'sukit-popups' }
    )
);
