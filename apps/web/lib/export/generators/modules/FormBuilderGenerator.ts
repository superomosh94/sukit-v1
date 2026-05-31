import type {
  ModuleGenerator,
  ModuleGeneratorContext,
} from './ModuleGenerator';

export class FormBuilderGenerator implements ModuleGenerator {
  readonly moduleId = 'form-builder';
  readonly moduleName = 'Form Builder';

  constructor(private ctx: ModuleGeneratorContext) {}

  generateBackendRoutes(): string {
    return `export const formRouter = Router();

formRouter.post('/:formId/submit', async (req, res, next) => {
  try {
    const submission = await prisma.formSubmission.create({
      data: {
        formId: req.params.formId,
        data: req.body,
        page: (req.query.page as string) || null,
      },
    });
    res.status(201).json(submission);
  } catch (err) { next(err); }
});

formRouter.get('/:formId/submissions', authenticate, async (req, res, next) => {
  try {
    const submissions = await prisma.formSubmission.findMany({
      where: { formId: req.params.formId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });
    res.json(submissions);
  } catch (err) { next(err); }
});
`;
  }

  generatePrismaModels(): string {
    return `model FormSubmission {
  id        String   @id @default(cuid())
  formId    String
  data      Json
  page      String?
  createdAt DateTime @default(now())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("form_submissions")
}
`;
  }

  generateFrontendComponents(): Array<{ path: string; content: string }> {
    return [
      {
        path: 'FormSubmission.tsx',
        content: `import React, { useState } from 'react';
import api from '../../lib/api';

interface FormSubmissionProps {
  formId: string;
  fields: Array<{ type: string; label: string; name: string; required?: boolean }>;
  submitText?: string;
  onSuccess?: () => void;
}

export const FormSubmission: React.FC<FormSubmissionProps> = ({ formId, fields, submitText = 'Submit', onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData.entries());
      await api.post(\`/forms/\${formId}/submit\`, data);
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <div className="p-4 bg-green-50 text-green-700 rounded-md">Thank you! Your submission has been received.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium mb-1">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea name={field.name} required={field.required} className="w-full p-2 border rounded-md" rows={4} />
          ) : (
            <input type={field.type || 'text'} name={field.name} required={field.required} className="w-full p-2 border rounded-md" />
          )}
        </div>
      ))}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50">
        {loading ? 'Submitting...' : submitText}
      </button>
    </form>
  );
};
`,
      },
    ];
  }

  generateValidationSchemas(): string {
    return `import { z } from 'zod';

export const FormFieldSchema = z.object({
  type: z.enum(['text', 'email', 'textarea', 'select', 'checkbox']),
  label: z.string().min(1),
  name: z.string().min(1),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
});

export const FormSubmissionSchema = z.object({
  formId: z.string().min(1),
  data: z.record(z.unknown()),
  page: z.string().optional(),
});
`;
  }

  generateEmailTemplates(): string {
    return `export function formSubmissionEmail(formId: string, data: Record<string, unknown>): string {
  const fields = Object.entries(data)
    .map(([key, value]) => \`<tr><td style="font-weight:600;padding:4px 8px">\${key}</td><td style="padding:4px 8px">\${value}</td></tr>\`)
    .join('');
  return \`<table style="width:100%;border-collapse:collapse">\${fields}</table>\`;
}
`;
  }
}
