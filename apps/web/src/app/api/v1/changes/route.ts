import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@cct/db';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !(session as any).workspace) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = (session as any).workspace.id;

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const impact = searchParams.get('impact');
    const readState = searchParams.get('readState');
    const limit = 10;

    const where: any = {
      workspaceId,
    };

    if (impact && impact !== 'ALL') {
      where.impactLevel = impact;
    }

    if (readState && readState !== 'ALL') {
      where.isRead = readState === 'READ';
    }

    const changes = await db.changeEvent.findMany({
      where,
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // Skip the cursor itself
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        trackedUrl: {
          select: {
            id: true,
            url: true,
            competitorName: true,
            category: true,
            label: true,
          },
        },
      },
    });

    let nextCursor: string | null = null;
    if (changes.length > limit) {
      const nextItem = changes.pop();
      nextCursor = nextItem!.id;
    }

    const serializedChanges = changes.map((c: any) => ({
      ...c,
      cursorId: c.cursorId.toString(),
    }));

    return NextResponse.json({ data: serializedChanges, nextCursor });
  } catch (error) {
    console.error('GET /api/v1/changes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
