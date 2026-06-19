import { auth } from '@/lib/auth';
import { prisma } from '@cct/db';
import { NextResponse } from 'next/server';

export async function getAuthSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session;
}

export async function getActiveWorkspace(userId: string) {
  return prisma.workspace.findFirst({
    where: { ownerId: userId },
  });
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { session, response: null };
}

export async function requireWorkspace(userId: string) {
  const workspace = await getActiveWorkspace(userId);
  if (!workspace) {
    return {
      workspace: null,
      response: NextResponse.json({ error: 'Workspace not found' }, { status: 404 }),
    };
  }
  return { workspace, response: null };
}

// Standard error response helpers
export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export function notFound(entity = 'Resource') {
  return NextResponse.json({ error: `${entity} not found` }, { status: 404 });
}

export function conflict(message: string) {
  return NextResponse.json({ error: message }, { status: 409 });
}

export function paymentRequired(limitType: string, current: number, max: number, planName: string) {
  return NextResponse.json(
    {
      error: 'Plan limit reached',
      code: 'PLAN_LIMIT',
      limitType,
      current,
      max,
      planName,
    },
    { status: 402 },
  );
}

export function serverError(message = 'Internal server error') {
  return NextResponse.json({ error: message }, { status: 500 });
}
