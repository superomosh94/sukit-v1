import Link from 'next/link';

export default function BuilderIndexPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Builder</h1>
        <p className="text-muted-foreground mb-4">
          Select a site and page to start building.
        </p>
        <Link
          href="/sites"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm"
        >
          Go to Sites
        </Link>
      </div>
    </div>
  );
}
