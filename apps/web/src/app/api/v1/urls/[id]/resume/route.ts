import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@cct/db';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    await db.trackedUrl.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
