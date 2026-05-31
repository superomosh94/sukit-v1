export default function AllMediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Media Library</h1>
        <p className="text-sm text-muted-foreground">
          All media files across your sites
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16">
        <p className="text-sm text-muted-foreground">
          Select a site to view and manage its media files.
        </p>
      </div>
    </div>
  );
}
