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
  topQuestions: Array<{
    question: string;
    count: number;
  }>;
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
export declare const useChatStore: import('zustand').UseBoundStore<
  import('zustand').StoreApi<ChatStore>
>;
export {};
//# sourceMappingURL=chatStore.d.ts.map
