export default function BuilderLoading() {
  return (
    <div className="flex h-screen flex-col">
      <div className="h-12 animate-pulse border-b bg-muted/50" />
      <div className="flex flex-1">
        <div className="w-60 animate-pulse border-r bg-muted/30" />
        <div className="flex-1 animate-pulse bg-muted/20 p-8">
          <div className="mx-auto h-full max-w-5xl rounded-xl border-2 border-dashed bg-muted/30" />
        </div>
        <div className="w-72 animate-pulse border-l bg-muted/30" />
      </div>
    </div>
  );
}
