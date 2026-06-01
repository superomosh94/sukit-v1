'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ModuleSubmissionForm,
  useMarketplace,
  useMarketplaceStore,
} from '@sukit/marketplace';
import type { SubmissionDraft } from '@sukit/marketplace';

export default function NewModulePage() {
  const router = useRouter();
  const marketplace = useMarketplace();
  const { submissionDraft } = useMarketplaceStore();
  const [submitting, setSubmitting] = useState(false);
  const [createdModuleId, setCreatedModuleId] = useState<string | undefined>();

  return (
    <ModuleSubmissionForm
      draft={submissionDraft}
      existingModuleId={createdModuleId}
      onSaveDraft={async (draft: SubmissionDraft) => {
        if (!createdModuleId && draft.basicInfo) {
          const mod = await marketplace.developer.createModule(draft.basicInfo);
          setCreatedModuleId(mod.moduleId);
        }
        await marketplace.submission.saveDraft(draft);
      }}
      onSubmit={async (moduleId) => {
        setSubmitting(true);
        try {
          const result = await marketplace.submission.submitForReview(moduleId);
          if (result.success) {
            router.push('/developer/dashboard');
          }
          return result;
        } finally {
          setSubmitting(false);
        }
      }}
      onUploadFile={async (file) =>
        marketplace.developer.uploadModuleFile(file)
      }
      onUploadScreenshot={async (file) =>
        marketplace.developer.uploadScreenshot(file)
      }
      onUploadIcon={async (file) => marketplace.developer.uploadIcon(file)}
      onUploadBanner={async (file) => marketplace.developer.uploadBanner(file)}
      submitting={submitting}
    />
  );
}
