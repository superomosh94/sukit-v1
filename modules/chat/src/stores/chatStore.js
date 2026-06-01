import { create } from 'zustand';
export const useChatStore = create()((set) => ({
    trainingDocuments: [],
    faqEntries: [],
    leadCapture: { enabled: false, formFields: [], crmIntegration: '', webhookUrl: '' },
    analytics: null,
    conversations: [],
    setTrainingDocuments: (docs) => set({ trainingDocuments: docs }),
    addTrainingDocument: (doc) => set((s) => ({ trainingDocuments: [...s.trainingDocuments, doc] })),
    removeTrainingDocument: (id) => set((s) => ({ trainingDocuments: s.trainingDocuments.filter((d) => d.id !== id) })),
    setFaqEntries: (entries) => set({ faqEntries: entries }),
    addFaqEntry: (entry) => set((s) => ({ faqEntries: [...s.faqEntries, entry] })),
    removeFaqEntry: (id) => set((s) => ({ faqEntries: s.faqEntries.filter((e) => e.id !== id) })),
    setLeadCapture: (config) => set((s) => ({ leadCapture: { ...s.leadCapture, ...config } })),
    setAnalytics: (analytics) => set({ analytics }),
    setConversations: (conversations) => set({ conversations }),
    updateConversation: (id, data) => set((s) => ({
        conversations: s.conversations.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
}));
//# sourceMappingURL=chatStore.js.map