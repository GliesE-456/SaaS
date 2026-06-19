import { DemoDashboardShell } from '@/components/layout/DemoDashboardShell';

export default function DemoDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoDashboardShell>
      {children}
    </DemoDashboardShell>
  );
}
