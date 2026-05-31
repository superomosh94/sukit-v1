export default function AllFormsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Forms</h1>
        <p className="text-sm text-muted-foreground">
          View form submissions across all your sites
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16">
        <p className="text-sm text-muted-foreground">
          Select a site to view its form submissions.
        </p>
      </div>
    </div>
  );
}
