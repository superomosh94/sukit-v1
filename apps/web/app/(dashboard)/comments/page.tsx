export default function CommentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Comments</h1>
        <p className="text-sm text-muted-foreground">Moderate site comments</p>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <select className="rounded-lg border bg-background px-3 py-1.5 text-sm">
          <option value="all">All Status</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING">Pending</option>
          <option value="SPAM">Spam</option>
          <option value="TRASH">Trash</option>
        </select>
        <select className="rounded-lg border bg-background px-3 py-1.5 text-sm">
          <option value="">All Sites</option>
        </select>
      </div>
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed p-16 text-sm text-muted-foreground">
        No comments yet.
      </div>
    </div>
  );
}
