import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { tokenStorage } from '@/lib/export/github/TokenStorage';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/github/auth`;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=repo,user&state=${session.user.id}`;
    return NextResponse.redirect(url);
  }

  try {
    const tokenRes = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: REDIRECT_URI,
        }),
      }
    );
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return NextResponse.json(
        { error: tokenData.error_description || 'OAuth failed' },
        { status: 400 }
      );
    }

    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const githubUser = await userRes.json();

    const site = await prisma.site.findFirst({
      where: { userId: session.user.id },
    });
    if (site) {
      const settings = (site.settings as Record<string, unknown>) || {};
      await prisma.site.update({
        where: { id: site.id },
        data: {
          settings: {
            ...settings,
            githubToken: tokenData.access_token,
            githubUser: githubUser.login,
          } as any,
        },
      });
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/deploy?github=connected`
    );
  } catch {
    return NextResponse.json({ error: 'GitHub OAuth failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  if (body.action === 'revoke') {
    const site = await prisma.site.findFirst({
      where: { userId: session.user.id },
    });
    if (site) {
      const settings = (site.settings as Record<string, unknown>) || {};
      if (settings.githubToken) {
        await fetch(
          `https://api.github.com/applications/${GITHUB_CLIENT_ID}/token`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Basic ${Buffer.from(`${GITHUB_CLIENT_ID}:${GITHUB_CLIENT_SECRET}`).toString('base64')}`,
            },
            body: JSON.stringify({ access_token: settings.githubToken }),
          }
        );
      }
      const { githubToken: _, githubUser: __, ...rest } = settings;
      await prisma.site.update({
        where: { id: site.id },
        data: { settings: rest as any },
      });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
