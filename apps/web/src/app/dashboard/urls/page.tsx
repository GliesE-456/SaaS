import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { UrlList } from '@/components/urls/UrlList';
import { AddUrlDialog } from '@/components/urls/AddUrlDialog';
import { db, BRANDING } from '@cct/db';
import { PLAN_LIMITS } from '@/lib/plan-limits';

export const metadata: Metadata = {
  title: `Tracked URLs | ${BRANDING.name}`,
  description: 'Manage the competitor pages you are tracking',
};

export default async function UrlsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const workspace = await db.workspace.findFirst({
    where: { ownerId: user.id },
    select: { checkFreqOptions: true },
  });

  const allowedFrequencies = workspace?.checkFreqOptions || ['daily'];

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <PageHeader
        heading="Tracked URLs"
        text="Manage the pages you are monitoring for changes."
      >
        <AddUrlDialog allowedFrequencies={allowedFrequencies} />
      </PageHeader>
      
      <UrlList />
    </div>
  );
}
