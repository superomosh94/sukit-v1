export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'phone'
  | 'date'
  | 'time'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'hidden'
  | 'password'
  | 'url';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: { label: string; value: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
  defaultValue?: any;
  sortOrder: number;
}

export interface FormSettings {
  submitLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  redirectUrl?: string;
  sendToEmail?: string;
  enableCaptcha?: boolean;
  captchaSiteKey?: string;
  storeSubmissions: boolean;
  allowMultipleSubmissions?: boolean;
}

export interface Form {
  id: string;
  siteId: string;
  name: string;
  fields: FormField[];
  settings: FormSettings;
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}
