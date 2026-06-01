'use client';

import type { ModuleStatus, SubmissionStep } from '../types';

interface SubmissionStatusProps {
  status: ModuleStatus;
  currentStep?: SubmissionStep | null;
  rejectionReason?: string | null;
  percentComplete?: number;
}

const statusFlow: {
  status: ModuleStatus;
  label: string;
  description: string;
}[] = [
  { status: 'draft', label: 'Draft', description: 'Module is being created' },
  {
    status: 'submitted',
    label: 'Submitted',
    description: 'Waiting for automated checks',
  },
  {
    status: 'in_review',
    label: 'Under Review',
    description: 'Manual review in progress',
  },
  {
    status: 'approved',
    label: 'Approved',
    description: 'Published to marketplace',
  },
];

export function SubmissionStatus({
  status,
  currentStep,
  rejectionReason,
  percentComplete,
}: SubmissionStatusProps) {
  const currentIndex = statusFlow.findIndex((s) => s.status === status);
  const isRejected = status === 'rejected' || status === 'changes_requested';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Submission Status
      </h3>

      {status === 'draft' && currentStep && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Completion</span>
            <span>{percentComplete ?? 0}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all"
              style={{ width: `${percentComplete ?? 0}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-0">
        {statusFlow.map((step, i) => {
          const isActive = i === currentIndex;
          const isPast = i < currentIndex;
          const isFuture = i > currentIndex;

          return (
            <div key={step.status} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors
                  ${isPast ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${isActive ? 'bg-indigo-600 border-indigo-600 text-white' : ''}
                  ${isFuture ? 'bg-white border-gray-300 text-gray-400' : ''}
                `}
                >
                  {isPast ? (
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
                </div>
                {i < statusFlow.length - 1 && (
                  <div
                    className={`w-0.5 h-8 ${isPast ? 'bg-green-500' : 'bg-gray-200'}`}
                  />
                )}
              </div>
              <div
                className={`pb-6 ${isActive ? 'text-indigo-600' : isPast ? 'text-gray-500' : 'text-gray-400'}`}
              >
                <p className="text-sm font-medium">{step.label}</p>
                <p className="text-xs mt-0.5">{step.description}</p>
                {isActive && status === 'in_review' && (
                  <p className="text-xs text-amber-600 mt-1">
                    A reviewer is reviewing your module. This typically takes
                    1-3 business days.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isRejected && rejectionReason && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800">
            {status === 'changes_requested' ? 'Changes Requested' : 'Rejected'}
          </p>
          <p className="text-sm text-red-700 mt-1">{rejectionReason}</p>
        </div>
      )}

      {status === 'approved' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800">Published!</p>
          <p className="text-sm text-green-700 mt-1">
            Your module is now live in the marketplace.
          </p>
        </div>
      )}
    </div>
  );
}
