import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@cct/db';
import * as z from 'zod';

const patchSchema = z.object({
  emailEnabled: z.boolean().optional(),
  emailDigest: z.enum(['IMMEDIATE', 'DAILY', 'WEEKLY']).optional(),
});

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !(session as any).workspace) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = (session as any).workspace.id;

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const updated = await db.notificationPreference.upsert({
      where: {
        userId_workspaceId: {
          userId: session.user.id!,
          workspaceId,
        }
      },
      update: parsed.data,
      create: {
        userId: session.user.id!,
        workspaceId,
        ...parsed.data,
      }
    });

    return NextResponse.json({ 
      data: { 
        emailEnabled: updated.emailEnabled, 
        emailDigest: updated.emailDigest 
      } 
    });
  } catch (error) {
    console.error('Notification PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
