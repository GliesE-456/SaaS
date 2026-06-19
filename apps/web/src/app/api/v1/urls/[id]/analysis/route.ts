import { db } from '@cct/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// GET: Retrieve analysis text and status
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !(session as any).workspace) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const workspaceId = (session as any).workspace.id;

    const urlRecord = await db.trackedUrl.findFirst({
      where: { id, workspaceId },
      include: {
        checkRuns: {
          where: { status: 'SUCCESS' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      }
    });

    if (!urlRecord) {
      return NextResponse.json({ error: 'Tracked URL not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        analysisText: urlRecord.analysisText,
        analysisStatus: urlRecord.analysisStatus,
        hasSuccessfulCheck: urlRecord.checkRuns.length > 0,
      }
    });
  } catch (error) {
    console.error('GET /api/v1/urls/[id]/analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Trigger manual analysis regeneration
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !(session as any).workspace) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const workspaceId = (session as any).workspace.id;

    const urlRecord = await db.trackedUrl.findFirst({
      where: { id, workspaceId },
      include: {
        checkRuns: {
          where: { status: 'SUCCESS' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      }
    });

    if (!urlRecord) {
      return NextResponse.json({ error: 'Tracked URL not found' }, { status: 404 });
    }

    if (urlRecord.checkRuns.length === 0) {
      return NextResponse.json({ error: 'Cannot analyze. The webpage has not been crawled successfully yet.' }, { status: 400 });
    }

    const latestCheckRun = urlRecord.checkRuns[0];
    if (!latestCheckRun.snapshotKey) {
      return NextResponse.json({ error: 'No content snapshot available for analysis.' }, { status: 400 });
    }

    // Set status to PROCESSING
    await db.trackedUrl.update({
      where: { id },
      data: { analysisStatus: 'PROCESSING' }
    });

    // Queue analysis job
    const connection = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });
    const analysisQueue = new Queue('analysisQueue', { connection: connection as any });
    
    await analysisQueue.add('analyzeWebsite', {
      trackedUrlId: id,
      snapshotKey: latestCheckRun.snapshotKey,
    });
    
    await analysisQueue.close();
    await connection.quit();

    return NextResponse.json({ message: 'Analysis triggered successfully' });
  } catch (error) {
    console.error('POST /api/v1/urls/[id]/analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
