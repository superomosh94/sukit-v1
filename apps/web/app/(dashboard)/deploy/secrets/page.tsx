export default function SecretsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Environment Secrets</h1>
        <p className="text-sm text-muted-foreground">
          Manage sensitive environment variables for your deployments
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Secret Keys</h2>
          <button className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90">
            Add Secret
          </button>
        </div>
        <div className="text-center text-sm text-muted-foreground py-8">
          No secrets configured yet.
        </div>
      </div>
    </div>
  );
}
