"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function DashboardHeader() {
  const { data: session } = useSession();

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <div className="text-sm font-medium">
        Welcome, {session?.user?.name ?? "User"}
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Dashboard
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
