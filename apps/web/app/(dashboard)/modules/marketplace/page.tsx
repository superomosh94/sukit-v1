'use client';

import { useEffect } from 'react';
import {
  MarketplaceHome,
  useMarketplaceSearch,
  useModuleInstall,
} from '@sukit/marketplace';

export default function MarketplacePage() {
  const { search, loadFeatured, loadPopular, searchResults, loading } =
    useMarketplaceSearch();
  const { install, installedModules } = useModuleInstall();

  useEffect(() => {
    loadFeatured();
    loadPopular();
  }, [loadFeatured, loadPopular]);

  const installedIds = installedModules.map((m) => m.moduleId);

  return (
    <MarketplaceHome
      onFetchModules={async (options) => search(options)}
      onFetchFeatured={async () => {
        loadFeatured();
        return [];
      }}
      onFetchPopular={async () => {
        loadPopular();
        return [];
      }}
      onInstall={(moduleId) => install(moduleId)}
      onDetail={(moduleId) => {
        window.location.href = `/modules/marketplace/${moduleId}`;
      }}
    />
  );
}
