import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link
        href="/"
        className="mb-8 text-2xl font-bold tracking-tight"
      >
        SUKIT
      </Link>
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
