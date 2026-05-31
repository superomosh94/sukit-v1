export default function PopupAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Popup Analytics</h1>
        <p className="text-sm text-muted-foreground">
          View performance metrics for your popup campaigns
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Views", value: "0" },
          { label: "Conversions", value: "0" },
          { label: "Conversion Rate", value: "0%" },
          { label: "Active Campaigns", value: "0" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4">
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold mb-4">Views Over Time</h2>
        <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
          No data yet. Popup analytics will appear here.
        </div>
      </div>
    </div>
  );
}
