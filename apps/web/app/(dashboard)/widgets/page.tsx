export default function WidgetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Widgets</h1>
        <p className="text-sm text-muted-foreground">Manage sidebar widgets and widget areas</p>
      </div>
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed p-16 text-sm text-muted-foreground">
        No widget areas yet. Create widget areas to add content to sidebars.
      </div>
    </div>
  );
}
