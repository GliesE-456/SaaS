import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { ChangeList } from '@/components/changes/ChangeList';
import { db, BRANDING } from '@cct/db';

export const metadata: Metadata = {
  title: `Dashboard | ${BRANDING.name}`,
  description: 'Overview of competitor changes',
};

export default async function DashboardOverviewPage() {
  const session = await auth();
  if (!session || !session.user || !(session as any).workspace) return null;

  const workspaceId = (session as any).workspace.id;

  // Fetch stats for StatsBar
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalUrls, activeUrls, totalChanges30d, highImpact30d] = await Promise.all([
    db.trackedUrl.count({ where: { workspaceId } }),
    db.trackedUrl.count({ where: { workspaceId, status: 'ACTIVE' } }),
    db.changeEvent.count({
      where: {
        workspaceId,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    db.changeEvent.count({
      where: {
        workspaceId,
        impactLevel: 'HIGH',
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
  ]);

  const stats = {
    totalUrls,
    activeUrls,
    totalChanges30d,
    highImpact30d,
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <PageHeader
        heading="Dashboard"
        text="Recent changes from your tracked competitors."
      />
      <StatsBar stats={stats} />
      
      <div className="pt-4">
        <h2 className="text-xl font-bold tracking-tight mb-4">Activity Feed</h2>
        <ChangeList />
      </div>
    </div>
  );
}
