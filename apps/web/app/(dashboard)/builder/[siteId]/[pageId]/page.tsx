import { BuilderWrapper } from './builder-wrapper';

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ siteId: string; pageId: string }>;
}) {
  const { siteId, pageId } = await params;

  return <BuilderWrapper siteId={siteId} pageId={pageId} />;
}
