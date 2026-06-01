import { create } from 'zustand';

export interface FormField {
  id: string;
  type:
    | 'text'
    | 'textarea'
    | 'email'
    | 'number'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'file'
    | 'date'
    | 'rating';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: Record<string, any>;
  conditionalLogic?: ConditionalRule[];
  order: number;
}

export interface ConditionalRule {
  fieldId: string;
  operator:
    | 'equals'
    | 'not-equals'
    | 'contains'
    | 'greater-than'
    | 'less-than'
    | 'is-empty'
    | 'is-not-empty';
  value: string;
  action: 'show' | 'hide' | 'require' | 'disable';
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: string[];
}

export interface FormIntegration {
  id: string;
  type: string;
  enabled: boolean;
  config: Record<string, string>;
}

export interface EmailNotification {
  enabled: boolean;
  to: string[];
  subject: string;
  template: string;
  fromName?: string;
  fromEmail?: string;
}

interface FormBuilderStore {
  fields: FormField[];
  steps: FormStep[];
  integrations: FormIntegration[];
  emailNotification: EmailNotification;
  selectedFieldId: string | null;
  addField: (type: FormField['type']) => void;
  updateField: (id: string, data: Partial<FormField>) => void;
  removeField: (id: string) => void;
  reorderFields: (fromIndex: number, toIndex: number) => void;
  setSelectedField: (id: string | null) => void;
  addStep: (title: string) => void;
  removeStep: (id: string) => void;
  updateStep: (id: string, data: Partial<FormStep>) => void;
  addIntegration: (type: string) => void;
  removeIntegration: (id: string) => void;
  updateIntegration: (id: string, data: Partial<FormIntegration>) => void;
  setEmailNotification: (data: Partial<EmailNotification>) => void;
}

let fieldCounter = 0;

export const useFormBuilderStore = create<FormBuilderStore>()((set, get) => ({
  fields: [],
  steps: [],
  integrations: [],
  emailNotification: { enabled: false, to: [], subject: '', template: '' },
  selectedFieldId: null,

  addField: (type) => {
    const newField: FormField = {
      id: `field-${++fieldCounter}`,
      type,
      label: `New ${type} field`,
      required: false,
      options:
        type === 'select' || type === 'radio'
          ? ['Option 1', 'Option 2']
          : undefined,
      order: get().fields.length,
    };
    set((s) => ({
      fields: [...s.fields, newField],
      selectedFieldId: newField.id,
    }));
  },

  updateField: (id, data) =>
    set((s) => ({
      fields: s.fields.map((f) => (f.id === id ? { ...f, ...data } : f)),
    })),

  removeField: (id) =>
    set((s) => ({
      fields: s.fields.filter((f) => f.id !== id),
      selectedFieldId: s.selectedFieldId === id ? null : s.selectedFieldId,
    })),

  reorderFields: (fromIndex, toIndex) =>
    set((s) => {
      const fields = [...s.fields];
      const [moved] = fields.splice(fromIndex, 1);
      fields.splice(toIndex, 0, moved);
      return { fields: fields.map((f, i) => ({ ...f, order: i })) };
    }),

  setSelectedField: (id) => set({ selectedFieldId: id }),

  addStep: (title) => {
    const newStep: FormStep = {
      id: `step-${Date.now()}`,
      title,
      fields: [],
    };
    set((s) => ({ steps: [...s.steps, newStep] }));
  },

  removeStep: (id) =>
    set((s) => ({ steps: s.steps.filter((st) => st.id !== id) })),

  updateStep: (id, data) =>
    set((s) => ({
      steps: s.steps.map((st) => (st.id === id ? { ...st, ...data } : st)),
    })),

  addIntegration: (type) => {
    const newIntegration: FormIntegration = {
      id: `integration-${Date.now()}`,
      type,
      enabled: true,
      config: {},
    };
    set((s) => ({ integrations: [...s.integrations, newIntegration] }));
  },

  removeIntegration: (id) =>
    set((s) => ({
      integrations: s.integrations.filter((i) => i.id !== id),
    })),

  updateIntegration: (id, data) =>
    set((s) => ({
      integrations: s.integrations.map((i) =>
        i.id === id ? { ...i, ...data } : i
      ),
    })),

  setEmailNotification: (data) =>
    set((s) => ({
      emailNotification: { ...s.emailNotification, ...data },
    })),
}));
