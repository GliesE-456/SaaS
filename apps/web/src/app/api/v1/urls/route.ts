import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@cct/db';
import { checkPlanLimits } from '@/lib/plan-limits';
import { checkRobotsTxt } from '@/lib/robots-check';
import * as z from 'zod';
import { validateExternalUrl, SsrfError } from '@/lib/ssrf-guard';

const postSchema = z.object({
  url: z.string().url(),
  label: z.string().optional(),
  competitorName: z.string().optional(),
  category: z.enum(['PRICING', 'FEATURES', 'PRODUCT', 'LANDING', 'TOS', 'BLOG', 'OTHER']).default('OTHER'),
  checkFrequency: z.enum(['ONE_HOUR', 'SIX_HOURS', 'DAILY']).default('DAILY'),
  noiseThreshold: z.number().min(0).max(10).default(2.0),
  overrideRobots: z.boolean().default(false),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !(session as any).workspace) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = (session as any).workspace.id;

    const urls = await db.trackedUrl.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: urls });
  } catch (error) {
    console.error('GET /api/v1/urls error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !(session as any).workspace) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = (session as any).workspace.id;

    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
    }

    const data = parsed.data;

    // 0. SSRF validation check
    try {
      await validateExternalUrl(data.url);
    } catch (err) {
      if (err instanceof SsrfError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    // 1. Check Plan Limits (URLs count & Frequency)
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      include: { _count: { select: { trackedUrls: true } } },
    });
    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

    const limitCheck = await checkPlanLimits(workspace.ownerId, 'urls', workspace._count.trackedUrls, data.checkFrequency);
    if (!limitCheck.allowed) {
      return NextResponse.json({ 
        error: limitCheck.reason,
        code: 'PLAN_LIMIT',
        current: workspace._count.trackedUrls,
        max: limitCheck.maxLimit
      }, { status: 402 });
    }

    // 2. Check Robots.txt
    if (!data.overrideRobots) {
      const isAllowed = await checkRobotsTxt(data.url, 'CCTBot');
      if (!isAllowed) {
        return NextResponse.json({ 
          error: 'Crawling this URL is blocked by robots.txt',
          robotsBlocked: true 
        }, { status: 403 });
      }
    }

    // 3. Create URL
    const trackedUrl = await db.trackedUrl.create({
      data: {
        workspaceId,
        url: data.url,
        label: data.label || data.url,
        competitorName: data.competitorName,
        category: data.category,
        checkFrequency: data.checkFrequency,
        noiseThreshold: data.noiseThreshold,
      },
    });

    return NextResponse.json({ data: trackedUrl }, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/urls error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
