import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createCustomerPortalSession } from '@/lib/stripe';
import { db } from '@cct/db';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await db.user.findUnique({ where: { id: user.id } });
    if (!dbUser || !dbUser.stripeCustomerId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    const url = await createCustomerPortalSession(dbUser.stripeCustomerId);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}
