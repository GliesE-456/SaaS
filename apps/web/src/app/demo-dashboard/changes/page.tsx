import { PageHeader } from '@/components/shared/PageHeader';
import { DemoChangeList } from '@/components/demo/DemoChangeList';

export default function DemoChangesPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50">
      <PageHeader
        heading="Changes Feed"
        text="Chronological feed of all detected updates across simulated competitors."
      />
      <DemoChangeList />
    </div>
  );
}
