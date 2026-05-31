import Link from "next/link";

export default function CodeListPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Code Editor</h1>
        <p className="text-sm text-muted-foreground">
          Edit site templates and custom code
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16">
        <p className="text-sm text-muted-foreground">
          No sites yet.{" "}
          <Link href="/sites/new" className="text-primary hover:underline">
            Create a site
          </Link>{" "}
          to access the code editor.
        </p>
      </div>
    </div>
  );
}
