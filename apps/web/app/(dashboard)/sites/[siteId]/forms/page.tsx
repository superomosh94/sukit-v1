export default function SiteFormsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Forms</h1>
          <p className="text-sm text-muted-foreground">
            Manage form submissions and form builders
          </p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          New Form
        </button>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16">
        <p className="text-sm text-muted-foreground">
          Form builder coming soon
        </p>
      </div>
    </div>
  );
}
