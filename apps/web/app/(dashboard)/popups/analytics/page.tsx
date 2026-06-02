'use client';

import { useEffect, useState } from 'react';

export default function PopupAnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    conversions: 0,
    conversionRate: '0%',
    activeCampaigns: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/popups/analytics');
        const data = await res.json();
        const views = data?.totalViews ?? data?.views ?? 0;
        const convs = data?.conversions ?? 0;
        setAnalytics({
          totalViews: views,
          conversions: convs,
          conversionRate:
            views > 0 ? `${((convs / views) * 100).toFixed(1)}%` : '0%',
          activeCampaigns: data?.activeCampaigns ?? data?.campaigns ?? 0,
        });
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Popup Analytics</h1>
        <p className="text-sm text-muted-foreground">
          View performance metrics for your popup campaigns
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <div className="col-span-4 text-sm text-muted-foreground">
            Loading...
          </div>
        ) : (
          <>
            {[
              { label: 'Total Views', value: analytics.totalViews.toString() },
              { label: 'Conversions', value: analytics.conversions.toString() },
              { label: 'Conversion Rate', value: analytics.conversionRate },
              {
                label: 'Active Campaigns',
                value: analytics.activeCampaigns.toString(),
              },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border bg-card p-4">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Views Over Time chart disabled until analytics data is available */}
      {/*
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold mb-4">Views Over Time</h2>
        <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
          No data yet. Popup analytics will appear here.
        </div>
      </div>
      */}
    </div>
  );
}
