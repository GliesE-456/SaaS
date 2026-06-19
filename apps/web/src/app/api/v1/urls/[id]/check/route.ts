import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@cct/db';
import { manualCheckRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { Queue } from 'bullmq';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user || !(session as any).workspace) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = (session as any).workspace.id;

    // Rate limit: 1 manual check per 10 mins per url
    const { id } = await params;
    const rl = await manualCheckRateLimit.limit(id);
    if (!rl.success) {
      return rateLimitResponse(rl.reset);
    }
    const url = await db.trackedUrl.findUnique({ where: { id } });

    if (!url || url.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Connect to BullMQ queue and enqueue manual scrape job
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const scrapeQueue = new Queue('scrapeQueue', {
      connection: {
        url: redisUrl
      } as any
    });

    const job = await scrapeQueue.add('manualCheck', { trackedUrlId: url.id }, {
      removeOnComplete: true,
      removeOnFail: true,
    });

    // Close queue connection immediately to prevent leaking in serverless environments
    await scrapeQueue.close();

    return NextResponse.json({ data: { jobId: job.id } });
  } catch (error: any) {
    console.error('Manual check route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
