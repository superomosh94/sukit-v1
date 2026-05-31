export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          Track changes and activity across your workspace
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <select className="rounded-lg border bg-background px-3 py-1.5 text-sm">
            <option value="all">All Events</option>
            <option value="site">Site Changes</option>
            <option value="deploy">Deployments</option>
            <option value="auth">Authentication</option>
            <option value="team">Team</option>
          </select>
          <input
            type="date"
            className="rounded-lg border bg-background px-3 py-1.5 text-sm"
          />
        </div>
        <div className="text-center text-sm text-muted-foreground py-12">
          No audit events recorded yet.
        </div>
      </div>
    </div>
  );
}
