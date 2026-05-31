export default function TaxonomiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories & Tags</h1>
          <p className="text-sm text-muted-foreground">Organize content with taxonomies</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">New Category</button>
      </div>
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed p-16 text-sm text-muted-foreground">
        No taxonomies yet. Create categories and tags to organize content.
      </div>
    </div>
  );
}
