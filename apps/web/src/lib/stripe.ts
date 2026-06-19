import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

export const PLANS = {
  free: {
    name: 'Free',
    stripePriceId: null,
    maxUrls: 3,
    maxMembers: 1,
    maxWorkspaces: 1,
    maxAiSummariesMonth: 10,
    checkFreqOptions: ['daily'],
    historyRetentionDays: 7,
    featureFlags: { slack: false, webhook: false, api: false, csv: false },
  },
  starter: {
    name: 'Starter',
    stripePriceId: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
    maxUrls: 25,
    maxMembers: 1,
    maxWorkspaces: 1,
    maxAiSummariesMonth: 200,
    checkFreqOptions: ['daily', 'six_hours'],
    historyRetentionDays: 30,
    featureFlags: { slack: true, webhook: true, api: false, csv: false },
  },
  growth: {
    name: 'Growth',
    stripePriceId: process.env.STRIPE_PRICE_GROWTH_MONTHLY!,
    maxUrls: 100,
    maxMembers: 3,
    maxWorkspaces: 1,
    maxAiSummariesMonth: 99999,
    checkFreqOptions: ['daily', 'six_hours', 'one_hour'],
    historyRetentionDays: 90,
    featureFlags: { slack: true, webhook: true, api: true, csv: true },
  },
  agency: {
    name: 'Agency',
    stripePriceId: process.env.STRIPE_PRICE_AGENCY_MONTHLY!,
    maxUrls: 500,
    maxMembers: 10,
    maxWorkspaces: 10,
    maxAiSummariesMonth: 99999,
    checkFreqOptions: ['daily', 'six_hours', 'one_hour'],
    historyRetentionDays: 365,
    featureFlags: { slack: true, webhook: true, api: true, csv: true },
  },
} as const;

export type PlanName = keyof typeof PLANS;

export function getPlanLimits(planName: string) {
  return PLANS[planName as PlanName] ?? PLANS.free;
}

export function getPlanByPriceId(priceId: string) {
  return Object.values(PLANS).find((p) => p.stripePriceId === priceId);
}

export async function createCheckoutSession({
  userId,
  email,
  plan,
  stripeCustomerId,
}: {
  userId: string;
  email: string | null;
  plan: 'starter' | 'pro';
  stripeCustomerId: string | null;
}) {
  const priceId = plan === 'starter' ? process.env.STRIPE_PRICE_STARTER_MONTHLY : process.env.STRIPE_PRICE_GROWTH_MONTHLY;

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId || undefined,
    customer_email: stripeCustomerId ? undefined : (email || undefined),
    client_reference_id: userId,
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
  });

  return session.url;
}

export async function createCustomerPortalSession(stripeCustomerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  });

  return session.url;
}
