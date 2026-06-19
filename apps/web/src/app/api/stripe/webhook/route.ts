import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@cct/db';
import { PLANS } from '@/lib/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed.', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.client_reference_id) {
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          // Retrieve full subscription to apply plan limits immediately
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;
          let planName = 'free';
          let limits: any = PLANS.free;

          if (priceId === process.env.STRIPE_PRICE_STARTER_MONTHLY) {
            planName = 'starter';
            limits = PLANS.starter;
          } else if (priceId === process.env.STRIPE_PRICE_GROWTH_MONTHLY) {
            planName = 'growth';
            limits = PLANS.growth;
          } else if (priceId === process.env.STRIPE_PRICE_AGENCY_MONTHLY) {
            planName = 'agency';
            limits = PLANS.agency;
          }

          const isActive = subscription.status === 'active' || subscription.status === 'trialing';

          // Update user
          await db.user.update({
            where: { id: session.client_reference_id },
            data: { stripeCustomerId: customerId },
          }).catch(() => {});

          // Update workspace
          const workspace = await db.workspace.findFirst({
            where: { ownerId: session.client_reference_id },
          });

          if (workspace) {
            await db.workspace.update({
              where: { id: workspace.id },
              data: {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                planName,
                planStatus: isActive ? 'ACTIVE' : 'PAST_DUE',
                stripePriceId: priceId,
                maxUrls: limits.maxUrls,
                maxMembers: limits.maxMembers,
                maxWorkspaces: limits.maxWorkspaces,
                maxAiSummariesMonth: limits.maxAiSummariesMonth,
                checkFreqOptions: limits.checkFreqOptions as any,
                historyRetentionDays: limits.historyRetentionDays,
              },
            });
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find workspace by customer ID or subscription ID
        const workspace = await db.workspace.findFirst({
          where: {
            OR: [
              { stripeCustomerId: subscription.customer as string },
              { stripeSubscriptionId: subscription.id },
            ]
          }
        });

        if (workspace) {
          const priceId = subscription.items.data[0]?.price.id;
          let planName = 'free';
          let limits: any = PLANS.free;

          if (priceId === process.env.STRIPE_PRICE_STARTER_MONTHLY) {
            planName = 'starter';
            limits = PLANS.starter;
          } else if (priceId === process.env.STRIPE_PRICE_GROWTH_MONTHLY) {
            planName = 'growth';
            limits = PLANS.growth;
          } else if (priceId === process.env.STRIPE_PRICE_AGENCY_MONTHLY) {
            planName = 'agency';
            limits = PLANS.agency;
          }

          const isActive = subscription.status === 'active' || subscription.status === 'trialing';

          await db.workspace.update({
            where: { id: workspace.id },
            data: {
              planName,
              planStatus: isActive ? 'ACTIVE' : 'PAST_DUE',
              stripePriceId: priceId,
              stripeSubscriptionId: subscription.id,
              maxUrls: limits.maxUrls,
              maxMembers: limits.maxMembers,
              maxWorkspaces: limits.maxWorkspaces,
              maxAiSummariesMonth: limits.maxAiSummariesMonth,
              checkFreqOptions: limits.checkFreqOptions as any,
              historyRetentionDays: limits.historyRetentionDays,
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const workspace = await db.workspace.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (workspace) {
          const limits = PLANS.free;
          await db.workspace.update({
            where: { id: workspace.id },
            data: {
              planName: 'free',
              planStatus: 'CANCELED',
              stripeSubscriptionId: null,
              stripePriceId: null,
              maxUrls: limits.maxUrls,
              maxMembers: limits.maxMembers,
              maxWorkspaces: limits.maxWorkspaces,
              maxAiSummariesMonth: limits.maxAiSummariesMonth,
              checkFreqOptions: limits.checkFreqOptions as any,
              historyRetentionDays: limits.historyRetentionDays,
            },
          });
        }
        break;
      }
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
