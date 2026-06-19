import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db, BRANDING } from '@cct/db';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AiPanel } from '@/components/changes/AiPanel';
import { DiffViewer } from '@/components/changes/DiffViewer';
import { ChangeMetaSidebar } from '@/components/changes/ChangeMetaSidebar';
import { downloadSnapshot } from '@/lib/r2';
import { diffLines } from 'diff';

export const metadata: Metadata = {
  title: `Change Details | ${BRANDING.name}`,
};

export default async function ChangeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !session.user || !(session as any).workspace) {
    redirect('/sign-in');
  }

  const workspaceId = (session as any).workspace.id;
  const { id } = await params;

  const change = await db.changeEvent.findUnique({
    where: { id },
    include: {
      trackedUrl: true,
    },
  });

  if (!change || change.trackedUrl.workspaceId !== workspaceId) {
    notFound();
  }

  // Mark as read if it isn't already
  if (!change.isRead) {
    await db.changeEvent.update({
      where: { id },
      data: { isRead: true },
    });
  }

  // Retrieve snapshots from R2/S3 and compute diff on the fly
  let diffData: any[] = [];
  try {
    console.log(`[ChangeDetails] Downloading snapshot keys: beforeKey=${change.beforeKey}, afterKey=${change.afterKey}`);
    const beforeText = await downloadSnapshot(change.beforeKey);
    const afterText = await downloadSnapshot(change.afterKey);
    console.log(`[ChangeDetails] Snapshot download results: beforeTextLen=${beforeText?.length || 0}, afterTextLen=${afterText?.length || 0}`);

    const diffResult = diffLines(beforeText, afterText);
    diffData = diffResult.flatMap((part) => {
      const type = part.added ? 'added' : part.removed ? 'removed' : 'unchanged';
      const lines = part.value.split('\n');
      if (lines.length > 1 && lines[lines.length - 1] === '') {
        lines.pop();
      }
      return lines.map((content) => ({ type, content }));
    });
  } catch (err) {
    console.error('Failed to download snapshots or compute diff:', err);
  }

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex items-center gap-4 px-2">
        <Button variant="ghost" size="icon" asChild className="-ml-2">
          <Link href="/dashboard/changes">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Feed</span>
          </Link>
        </Button>
        <PageHeader heading="Change Details" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AiPanel 
            status={change.aiStatus as any} 
            summary={change.aiSummary} 
            keyChanges={change.aiKeyChanges as string[] | null} 
          />
          <DiffViewer diffData={diffData} />
        </div>
        <div className="lg:col-span-1">
          <ChangeMetaSidebar change={change as any} />
        </div>
      </div>
    </div>
  );
}
