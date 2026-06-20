import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { db } from '@cct/db';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const dbUser = await db.user.findUnique({ where: { id: user.id } });

  return (
    <>
      {!dbUser?.emailVerified && user.email && (
        <div className="md:ml-64">
          <EmailVerificationBanner email={user.email} />
        </div>
      )}
      <DashboardShell user={user}>
        {children}
      </DashboardShell>
    </>
  );
}
