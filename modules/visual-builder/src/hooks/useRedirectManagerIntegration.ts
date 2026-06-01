'use client';

import { useCallback, useState } from 'react';

export function useRedirectManagerIntegration() {
  const [redirects, setRedirects] = useState<any[]>([]);

  const loadRedirects = useCallback(async (siteId: string) => {
    try {
      const res = await fetch(`/api/sites/${siteId}/redirects`);
      const data = await res.json();
      setRedirects(data);
      return data;
    } catch {
      return [];
    }
  }, []);

  const checkBlockForRedirects = useCallback(
    (url: string) => {
      return redirects.find((r) => r.from === url || r.to === url) ?? null;
    },
    [redirects]
  );

  return { redirects, loadRedirects, checkBlockForRedirects };
}
