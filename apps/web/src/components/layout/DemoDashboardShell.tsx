import { DemoSidebar } from './DemoSidebar';
import { DemoHeader } from './DemoHeader';

interface DemoDashboardShellProps {
  children: React.ReactNode;
}

export function DemoDashboardShell({ children }: DemoDashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <DemoSidebar />
      <div className="flex flex-1 flex-col md:pl-64">
        <DemoHeader />
        <main className="flex-1 space-y-4 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
