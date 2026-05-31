import { CodeEditorPlaceholder } from "./code-editor-placeholder";

export default async function CodeEditorPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Code Editor</h1>
        <p className="text-sm text-muted-foreground">
          Edit HTML, CSS, and JavaScript for your site
        </p>
      </div>
      <CodeEditorPlaceholder siteId={siteId} />
    </div>
  );
}
