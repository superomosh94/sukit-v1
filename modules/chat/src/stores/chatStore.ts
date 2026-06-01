import { create } from 'zustand';

interface TrainingDocument {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'indexed' | 'failed';
  chunks: number;
  uploadedAt: string;
}

interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface LeadCaptureConfig {
  enabled: boolean;
  formFields: Array<{
    name: string;
    label: string;
    required: boolean;
    type: string;
  }>;
  crmIntegration: string;
  webhookUrl: string;
}

interface ChatAnalytics {
  conversationCount: number;
  satisfactionRate: number;
  topQuestions: Array<{ question: string; count: number }>;
  avgResponseTime: number;
  totalMessages: number;
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  lastMessage: string;
  status: 'active' | 'resolved' | 'waiting';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

interface ChatStore {
  trainingDocuments: TrainingDocument[];
  faqEntries: FaqEntry[];
  leadCapture: LeadCaptureConfig;
  analytics: ChatAnalytics | null;
  conversations: Conversation[];
  setTrainingDocuments: (docs: TrainingDocument[]) => void;
  addTrainingDocument: (doc: TrainingDocument) => void;
  removeTrainingDocument: (id: string) => void;
  setFaqEntries: (entries: FaqEntry[]) => void;
  addFaqEntry: (entry: FaqEntry) => void;
  removeFaqEntry: (id: string) => void;
  setLeadCapture: (config: Partial<LeadCaptureConfig>) => void;
  setAnalytics: (analytics: ChatAnalytics) => void;
  setConversations: (conversations: Conversation[]) => void;
  updateConversation: (id: string, data: Partial<Conversation>) => void;
}

export const useChatStore = create<ChatStore>()((set) => ({
  trainingDocuments: [],
  faqEntries: [],
  leadCapture: {
    enabled: false,
    formFields: [],
    crmIntegration: '',
    webhookUrl: '',
  },
  analytics: null,
  conversations: [],
  setTrainingDocuments: (docs) => set({ trainingDocuments: docs }),
  addTrainingDocument: (doc) =>
    set((s) => ({ trainingDocuments: [...s.trainingDocuments, doc] })),
  removeTrainingDocument: (id) =>
    set((s) => ({
      trainingDocuments: s.trainingDocuments.filter((d) => d.id !== id),
    })),
  setFaqEntries: (entries) => set({ faqEntries: entries }),
  addFaqEntry: (entry) =>
    set((s) => ({ faqEntries: [...s.faqEntries, entry] })),
  removeFaqEntry: (id) =>
    set((s) => ({ faqEntries: s.faqEntries.filter((e) => e.id !== id) })),
  setLeadCapture: (config) =>
    set((s) => ({ leadCapture: { ...s.leadCapture, ...config } })),
  setAnalytics: (analytics) => set({ analytics }),
  setConversations: (conversations) => set({ conversations }),
  updateConversation: (id, data) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    })),
}));
