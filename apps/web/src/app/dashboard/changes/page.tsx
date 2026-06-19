import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { ChangeList } from '@/components/changes/ChangeList';

export const metadata: Metadata = {
  title: 'Activity Feed | Competitor Change Tracker',
  description: 'View all detected changes across your tracked competitors',
};

export default async function ChangesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <PageHeader
        heading="Activity Feed"
        text="All detected changes across your tracked competitors."
      />
      <ChangeList />
    </div>
  );
}
