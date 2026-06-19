import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { db, BRANDING } from '@cct/db';

export const metadata: Metadata = {
  title: `Welcome | ${BRANDING.name}`,
  description: 'Set up your first tracked competitor',
};

export default async function OnboardingPage() {
  const session = await auth();
  if (!session || !session.user || !(session as any).workspace) {
    redirect('/sign-in');
  }

  const workspaceId = (session as any).workspace.id;

  // Check if they already have tracked URLs. If so, they don't need onboarding.
  const count = await db.trackedUrl.count({
    where: { workspaceId },
  });

  if (count > 0) {
    redirect('/dashboard/overview');
  }

  return (
    <div className="flex-1 animate-in fade-in-50 min-h-[calc(100vh-8rem)]">
      <OnboardingWizard />
    </div>
  );
}
