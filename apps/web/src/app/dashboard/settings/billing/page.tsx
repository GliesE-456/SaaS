import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { BillingCard } from '@/components/settings/BillingCard';
import { LimitsCard } from '@/components/settings/LimitsCard';
import { db } from '@cct/db';

export const metadata: Metadata = {
  title: 'Billing | Competitor Change Tracker',
  description: 'Manage your subscription and limits',
};

export default async function BillingPage() {
  const session = await auth();
  if (!session || !session.user || !(session as any).workspace) return null;

  const workspaceId = (session as any).workspace.id;

  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      _count: {
        select: {
          trackedUrls: true,
          changeEvents: {
            where: {
              aiStatus: 'DONE',
            }
          }
        }
      }
    }
  });

  if (!workspace) return null;

  const planUpper = workspace.planName.toUpperCase();

  return (
    <div className="space-y-6 animate-in fade-in-50 max-w-4xl">
      <PageHeader
        heading="Billing & Limits"
        text="Manage your subscription, payment methods, and monitor usage."
      />
      
      <div className="grid gap-6">
        <BillingCard 
          plan={planUpper} 
          stripeCustomerId={workspace.stripeCustomerId}
          stripeSubscriptionId={workspace.stripeSubscriptionId}
          cancelAtPeriodEnd={workspace.planStatus !== 'ACTIVE'}
        />
        <LimitsCard 
          plan={planUpper}
          urlsCount={workspace._count.trackedUrls}
          aiSummariesCount={workspace._count.changeEvents}
        />
      </div>
    </div>
  );
}
