import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardShellProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <Sidebar />
      <div className="flex flex-1 flex-col md:pl-64">
        <Header user={user} />
        <main className="flex-1 space-y-4 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
