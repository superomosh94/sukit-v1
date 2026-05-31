export default function CronPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cron Jobs</h1>
          <p className="text-sm text-muted-foreground">Scheduled tasks and automation</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">New Job</button>
      </div>
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed p-16 text-sm text-muted-foreground">
        No cron jobs scheduled yet.
      </div>
    </div>
  );
}
