import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface RedirectRule {
  source: string;
  target: string;
  type: "301" | "302";
}

const redirectCache = new Map<string, { rules: RedirectRule[]; expiry: number }>();
const CACHE_TTL = 60_000;

export const config = {
  matcher: [
    "/((?!api/|_next/|_static/|_vercel|favicon.ico|robots.txt|sitemap.xml|uploads/|images/|fonts/).*)",
  ],
};

async function fetchRedirectRules(host: string): Promise<RedirectRule[]> {
  const cacheKey = `redirects_${host}`;
  const cached = redirectCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.rules;
  }

  try {
    const res = await fetch(
      `http://localhost:${process.env.PORT || 3000}/api/redirects/lookup?host=${encodeURIComponent(host)}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    const rules = (data.redirects as RedirectRule[]) || [];
    redirectCache.set(cacheKey, { rules, expiry: Date.now() + CACHE_TTL });
    return rules;
  } catch {
    return [];
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  const rules = await fetchRedirectRules(host);

  if (rules.length === 0) {
    return NextResponse.next();
  }

  const normalizedPath = pathname.endsWith("/") ? pathname.slice(0, -1) || "/" : pathname;

  for (const rule of rules) {
    const sourceNormalized = rule.source.endsWith("/")
      ? rule.source.slice(0, -1) || "/"
      : rule.source;

    if (normalizedPath === sourceNormalized) {
      const statusCode = rule.type === "301" ? 301 : 302;
      return NextResponse.redirect(new URL(rule.target, request.url), {
        status: statusCode,
      });
    }
  }

  return NextResponse.next();
}
