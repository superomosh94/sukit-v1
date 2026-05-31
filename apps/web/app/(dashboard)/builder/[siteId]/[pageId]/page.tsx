import { BuilderEditor } from "./builder-editor";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ siteId: string; pageId: string }>;
}) {
  const { siteId, pageId } = await params;

  return <BuilderEditor siteId={siteId} pageId={pageId} />;
}
