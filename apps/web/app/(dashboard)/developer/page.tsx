'use client';

import { useEffect, useState } from 'react';
import { DeveloperDashboard, useDeveloperPortal } from '@sukit/marketplace';

export default function DeveloperDashboardPage() {
  const {
    developer,
    developerModules,
    developerStats,
    loadDeveloper,
    loadModules,
    loadStats,
  } = useDeveloperPortal();
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadDeveloper();
    loadModules();
    loadStats();
  }, [loadDeveloper, loadModules, loadStats]);

  return (
    <div className="max-w-6xl mx-auto">
      <DeveloperDashboard
        stats={developerStats}
        modules={developerModules}
        loading={!developerStats}
        onCreateModule={() => setShowCreateForm(true)}
        onEditModule={(id) => {
          window.location.href = `/developer/modules/${id}/edit`;
        }}
        onSubmitModule={(id) => {}}
      />
    </div>
  );
}
