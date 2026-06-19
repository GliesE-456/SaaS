import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@cct/db';
import * as z from 'zod';
import { checkPlanLimits } from '@/lib/plan-limits';

const patchSchema = z.object({
  label: z.string().optional(),
  competitorName: z.string().optional(),
  category: z.enum(['PRICING', 'FEATURES', 'PRODUCT', 'LANDING', 'TOS', 'BLOG', 'OTHER']).optional(),
  checkFrequency: z.enum(['ONE_HOUR', 'SIX_HOURS', 'DAILY']).optional(),
  noiseThreshold: z.number().min(0).max(10).optional(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user || !(session as any).workspace) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = (session as any).workspace.id;
    const { id } = await params;
    const url = await db.trackedUrl.findUnique({
      where: { id },
      include: {
        changeEvents: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!url || url.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: url });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user || !(session as any).workspace) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = (session as any).workspace.id;
    const workspaceOwnerId = (session as any).workspace.ownerId || session.user.id;
    const { id } = await params;
    const url = await db.trackedUrl.findUnique({ where: { id } });

    if (!url || url.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
    }

    // Check plan limit if frequency changed
    if (parsed.data.checkFrequency && parsed.data.checkFrequency !== url.checkFrequency) {
      const limitCheck = await checkPlanLimits(workspaceOwnerId, 'urls', 0, parsed.data.checkFrequency);
      if (!limitCheck.allowed) {
         return NextResponse.json({ error: limitCheck.reason, code: 'PLAN_LIMIT' }, { status: 402 });
      }
    }

    const updated = await db.trackedUrl.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user || !(session as any).workspace) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = (session as any).workspace.id;
    const { id } = await params;
    const url = await db.trackedUrl.findUnique({ where: { id } });

    if (!url || url.workspaceId !== workspaceId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.trackedUrl.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
