'use client';

import { useState, useEffect } from 'react';
import type { ModuleCategory, SubmissionStep, SubmissionDraft } from '../types';
import { SubmissionStatus } from './SubmissionStatus';

interface ModuleSubmissionFormProps {
  draft: SubmissionDraft | null;
  existingModuleId?: string;
  onSaveDraft: (draft: SubmissionDraft) => Promise<void>;
  onSubmit: (
    moduleId: string
  ) => Promise<{ success: boolean; message: string }>;
  onUploadFile: (
    file: File
  ) => Promise<{ url: string; size: number; version: string }>;
  onUploadScreenshot: (file: File) => Promise<{ url: string }>;
  onUploadIcon: (file: File) => Promise<{ url: string }>;
  onUploadBanner: (file: File) => Promise<{ url: string }>;
  submitting?: boolean;
}

const _defaultCategories: { value: ModuleCategory; label: string }[] = [
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'seo', label: 'SEO' },
  { value: 'forms', label: 'Forms' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'media', label: 'Media' },
  { value: 'social', label: 'Social' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'content', label: 'Content' },
  { value: 'performance', label: 'Performance' },
  { value: 'security', label: 'Security' },
  { value: 'ai', label: 'AI' },
  { value: 'automation', label: 'Automation' },
  { value: 'integration', label: 'Integration' },
  { value: 'theme', label: 'Theme' },
  { value: 'tool', label: 'Tool' },
  { value: 'other', label: 'Other' },
];

export function ModuleSubmissionForm({
  draft,
  existingModuleId,
  onSaveDraft,
  onSubmit,
  onUploadFile,
  onUploadScreenshot,
  onUploadIcon,
  onUploadBanner,
  submitting,
}: ModuleSubmissionFormProps) {
  const [step, setStep] = useState<SubmissionStep>(
    draft?.currentStep || 'basic-info'
  );
  const [basicInfo, setBasicInfo] = useState(
    draft?.basicInfo || {
      name: '',
      description: '',
      category: 'tool' as ModuleCategory,
      tags: [],
    }
  );
  const [pricing, setPricing] = useState(
    draft?.pricing || { priceModel: 'free' }
  );
  const [upload, setUpload] = useState(draft?.upload);
  const [assets, setAssets] = useState(draft?.assets || { screenshots: [] });
  const [docs, setDocs] = useState(draft?.documentation || {});
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [categories, setCategories] = useState(_defaultCategories);
  const [priceOptions, setPriceOptions] = useState([
    { value: 'free' as const, label: 'Free', desc: 'No cost to users' },
    {
      value: 'one-time' as const,
      label: 'One-Time',
      desc: 'Single payment for lifetime access',
    },
    {
      value: 'subscription' as const,
      label: 'Subscription',
      desc: 'Recurring monthly/yearly',
    },
    {
      value: 'tiered' as const,
      label: 'Tiered',
      desc: 'Multiple pricing tiers',
    },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        if (data.marketplaceCategories?.length) {
          const mapped = data.marketplaceCategories
            .filter((c: any) => c.value)
            .map((c: any) => ({
              value: c.value as ModuleCategory,
              label: c.label,
            }));
          if (mapped.length) setCategories(mapped);
        }
      } catch {}
    })();
  }, []);

  const steps: SubmissionStep[] = [
    'basic-info',
    'pricing',
    'upload',
    'assets',
    'documentation',
    'review',
  ];
  const stepIndex = steps.indexOf(step);
  const progress = Math.round((stepIndex / steps.length) * 100);

  async function saveAndAdvance(nextStep: SubmissionStep) {
    setError('');
    const currentDraft: SubmissionDraft = {
      currentStep: nextStep,
      basicInfo: step === 'basic-info' ? basicInfo : draft?.basicInfo,
      pricing: step === 'pricing' ? (pricing as any) : draft?.pricing,
      upload: step === 'upload' ? upload : draft?.upload,
      assets: step === 'assets' ? assets : draft?.assets,
      documentation: step === 'documentation' ? docs : draft?.documentation,
    };
    await onSaveDraft(currentDraft);
    setStep(nextStep);
  }

  async function handleSubmit() {
    setError('');
    if (!existingModuleId) {
      setError('Module must be created first. Save basic info to continue.');
      return;
    }
    const result = await onSubmit(existingModuleId);
    if (!result.success) setError(result.message);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {existingModuleId ? 'Edit Module' : 'New Module'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete all steps to publish your module to the marketplace.
        </p>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => (i < stepIndex ? setStep(s) : undefined)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors
                  ${i < stepIndex ? 'bg-green-500 text-white cursor-pointer' : ''}
                  ${i === stepIndex ? 'bg-indigo-600 text-white' : ''}
                  ${i > stepIndex ? 'bg-gray-200 text-gray-500 cursor-default' : ''}
                `}
              >
                {i < stepIndex ? (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </button>
              {i < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 ${i < stepIndex ? 'bg-green-500' : 'bg-gray-200'}`}
                />
              )}
            </div>
          ))}
        </div>
        <span className="text-xs text-gray-500">{progress}% complete</span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {step === 'basic-info' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Module Name *
              </label>
              <input
                type="text"
                value={basicInfo.name}
                onChange={(e) =>
                  setBasicInfo((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., SEO Optimizer"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={basicInfo.description}
                onChange={(e) =>
                  setBasicInfo((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                placeholder="Describe what your module does..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={basicInfo.category}
                onChange={(e) =>
                  setBasicInfo((prev) => ({
                    ...prev,
                    category: e.target.value as ModuleCategory,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      e.preventDefault();
                      setBasicInfo((prev) => ({
                        ...prev,
                        tags: [...prev.tags, tagInput.trim().toLowerCase()],
                      }));
                      setTagInput('');
                    }
                  }}
                  placeholder="Type and press Enter to add tags"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {basicInfo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {basicInfo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() =>
                          setBasicInfo((prev) => ({
                            ...prev,
                            tags: prev.tags.filter((t) => t !== tag),
                          }))
                        }
                        className="hover:text-indigo-900"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'pricing' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Model
              </label>
              <div className="grid grid-cols-2 gap-3">
                {priceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setPricing((prev) => ({
                        ...prev,
                        priceModel: option.value,
                      }))
                    }
                    className={`p-3 rounded-lg border text-left transition-colors ${pricing.priceModel === option.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {option.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            {pricing.priceModel !== 'free' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.99}
                    value={(pricing as any).price ?? ''}
                    onChange={(e) =>
                      setPricing((prev) => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                {pricing.priceModel === 'subscription' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly ($)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.99}
                        value={(pricing as any).subscriptionMonthly ?? ''}
                        onChange={(e) =>
                          setPricing((prev) => ({
                            ...prev,
                            subscriptionMonthly:
                              parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Yearly ($)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.99}
                        value={(pricing as any).subscriptionYearly ?? ''}
                        onChange={(e) =>
                          setPricing((prev) => ({
                            ...prev,
                            subscriptionYearly: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {step === 'upload' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Upload Module
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
              <svg
                className="w-10 h-10 text-gray-400 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-gray-600 mb-1">
                Drag and drop your module ZIP file here
              </p>
              <p className="text-xs text-gray-400 mb-3">or</p>
              <label className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 cursor-pointer">
                Browse files
                <input
                  type="file"
                  accept=".zip,.tar.gz"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const result = await onUploadFile(file);
                      setUpload({
                        fileUrl: result.url,
                        fileSize: result.size,
                        version: result.version,
                        sukVersion: '1.0.0',
                      });
                    }
                  }}
                />
              </label>
              {upload && (
                <div className="mt-4 text-left bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    File uploaded: {(upload.fileSize / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-xs text-gray-500">
                    Version {upload.version || 'detecting...'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'assets' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Assets & Links
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <label className="inline-flex px-4 py-2 border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50">
                Upload Icon
                <input
                  type="file"
                  accept="image/png,image/svg+xml"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const result = await onUploadIcon(file);
                      setAssets((prev) => ({ ...prev, icon: result.url }));
                    }
                  }}
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner (hero image)
              </label>
              <label className="inline-flex px-4 py-2 border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50">
                Upload Banner
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const result = await onUploadBanner(file);
                      setAssets((prev) => ({ ...prev, banner: result.url }));
                    }
                  }}
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Screenshots (up to 5)
              </label>
              <label className="inline-flex px-4 py-2 border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50">
                Add Screenshot
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const result = await onUploadScreenshot(file);
                      setAssets((prev) => ({
                        ...prev,
                        screenshots: [...prev.screenshots, result.url],
                      }));
                    }
                  }}
                />
              </label>
              {assets.screenshots.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {assets.screenshots.map((url, i) => (
                    <div
                      key={i}
                      className="relative w-20 h-14 bg-gray-100 rounded overflow-hidden"
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() =>
                          setAssets((prev) => ({
                            ...prev,
                            screenshots: prev.screenshots.filter(
                              (_, j) => j !== i
                            ),
                          }))
                        }
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Demo URL
                </label>
                <input
                  type="url"
                  value={assets.demoUrl || ''}
                  onChange={(e) =>
                    setAssets((prev) => ({ ...prev, demoUrl: e.target.value }))
                  }
                  placeholder="https://"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Support URL
                </label>
                <input
                  type="url"
                  value={assets.supportUrl || ''}
                  onChange={(e) =>
                    setAssets((prev) => ({
                      ...prev,
                      supportUrl: e.target.value,
                    }))
                  }
                  placeholder="https://"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source URL
                </label>
                <input
                  type="url"
                  value={assets.sourceUrl || ''}
                  onChange={(e) =>
                    setAssets((prev) => ({
                      ...prev,
                      sourceUrl: e.target.value,
                    }))
                  }
                  placeholder="https://"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {step === 'documentation' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Documentation
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                README (Markdown)
              </label>
              <textarea
                value={docs.readme || ''}
                onChange={(e) =>
                  setDocs((prev) => ({ ...prev, readme: e.target.value }))
                }
                rows={12}
                placeholder="Write your module documentation in Markdown..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-indigo-500 resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Changelog (Markdown)
              </label>
              <textarea
                value={docs.changelog || ''}
                onChange={(e) =>
                  setDocs((prev) => ({ ...prev, changelog: e.target.value }))
                }
                rows={6}
                placeholder="List the changes in this version..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-indigo-500 resize-y"
              />
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Review & Submit
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{basicInfo.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Category</span>
                <span className="font-medium">{basicInfo.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Price Model</span>
                <span className="font-medium">{pricing.priceModel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">File</span>
                <span className="font-medium">
                  {upload
                    ? `${(upload.fileSize / 1024).toFixed(1)} KB`
                    : 'Not uploaded'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Screenshots</span>
                <span className="font-medium">{assets.screenshots.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tags</span>
                <span className="font-medium">{basicInfo.tags.length}</span>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setStep(steps[stepIndex - 1])}
            disabled={stepIndex === 0}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => saveAndAdvance(steps[stepIndex])}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Save Draft
            </button>
            {step === 'review' ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            ) : (
              <button
                onClick={() => saveAndAdvance(steps[stepIndex + 1])}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
