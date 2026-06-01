import { NextRequest, NextResponse } from 'next/server';
import {
  trackEvent,
  trackPageView,
  getAnalytics,
  getFunnelAnalysis,
  getUserAnalytics,
} from '../controllers/analyticsController';

export async function POST_track(req: NextRequest) {
  const { siteId, event, data, userId } = await req.json();
  const result = await trackEvent(siteId, event, data, userId);
  return NextResponse.json(result, { status: 201 });
}

export async function POST_pageview(req: NextRequest) {
  const { siteId, page, userId, metadata } = await req.json();
  await trackPageView(siteId, page, userId, metadata);
  return NextResponse.json({ success: true });
}

export async function GET_stats(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get('siteId') as string;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  if (!siteId)
    return NextResponse.json({ error: 'siteId required' }, { status: 400 });

  const type = searchParams.get('type');
  if (type === 'funnel') {
    const steps = searchParams.get('steps')?.split(',') || [];
    return NextResponse.json(
      await getFunnelAnalysis(siteId, steps, startDate, endDate)
    );
  }
  if (type === 'users') {
    return NextResponse.json(await getUserAnalytics(siteId));
  }

  return NextResponse.json(await getAnalytics(siteId, startDate, endDate));
}
