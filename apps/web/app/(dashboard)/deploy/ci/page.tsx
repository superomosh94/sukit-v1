export default function CICDPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">CI/CD Pipelines</h1>
        <p className="text-sm text-muted-foreground">
          Automated build and deployment pipelines
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16">
        <p className="text-sm text-muted-foreground">
          No pipelines configured. Connect a Git provider to get started.
        </p>
      </div>
    </div>
  );
}
