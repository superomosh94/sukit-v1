'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ModuleDetail,
  useModuleDetail,
  useModuleInstall,
} from '@sukit/marketplace';
import type {
  MarketplaceModuleData,
  ModuleVersionData,
} from '@sukit/marketplace';

export default function ModuleDetailPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const { loadModule, currentModule, loading } = useModuleDetail();
  const { install } = useModuleInstall();

  useEffect(() => {
    if (moduleId) loadModule(moduleId);
  }, [moduleId, loadModule]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto animate-pulse space-y-4">
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    );
  }

  if (!currentModule) {
    return (
      <div className="max-w-5xl mx-auto text-center py-16">
        <h2 className="text-lg font-semibold text-gray-900">
          Module not found
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          The module you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <ModuleDetail
      module={currentModule}
      versions={currentModule.versions || []}
      onInstall={(mid) => install(mid)}
      onReport={() => {}}
    />
  );
}
