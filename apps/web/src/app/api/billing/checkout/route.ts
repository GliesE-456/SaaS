import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/stripe';
import { db } from '@cct/db';
import * as z from 'zod';

const postSchema = z.object({
  plan: z.enum(['starter', 'pro']),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const dbUser = await db.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const url = await createCheckoutSession({
      userId: user.id as string,
      email: dbUser.email,
      plan: parsed.data.plan,
      stripeCustomerId: dbUser.stripeCustomerId,
    });

    return NextResponse.json({ data: { url } });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
