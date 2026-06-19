import { PageHeader } from '@/components/shared/PageHeader';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { DemoChangeList } from '@/components/demo/DemoChangeList';
import { MOCK_STATS } from '@/lib/demo-mock-data';

export default function DemoOverviewPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50">
      <PageHeader
        heading="Demo Overview"
        text="A real-time simulation showing competitor changes and automated insights."
      />
      <StatsBar stats={MOCK_STATS} />
      
      <div className="pt-4">
        <h2 className="text-xl font-bold tracking-tight mb-4">Activity Feed</h2>
        <DemoChangeList />
      </div>
    </div>
  );
}
