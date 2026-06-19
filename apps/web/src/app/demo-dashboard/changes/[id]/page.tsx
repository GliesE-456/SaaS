"use client";

import * as React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { AiPanel } from '@/components/changes/AiPanel';
import { DiffViewer } from '@/components/changes/DiffViewer';
import { DemoChangeMetaSidebar } from '@/components/demo/DemoChangeMetaSidebar';
import { MOCK_CHANGES } from '@/lib/demo-mock-data';
import { diffLines } from 'diff';

interface Props {
  params: React.Usable<{ id: string }>;
}

export default function DemoChangeDetailPage({ params }: Props) {
  const { id } = React.use(params);

  const change = MOCK_CHANGES.find((c) => c.id === id);
  if (!change) {
    notFound();
  }

  // Compute diff on the fly
  const diffResult = diffLines(change.beforeContent, change.afterContent);
  const diffData = diffResult.flatMap((part) => {
    const type = part.added ? 'added' : part.removed ? 'removed' : 'unchanged';
    const lines = part.value.split('\n');
    if (lines.length > 1 && lines[lines.length - 1] === '') {
      lines.pop();
    }
    return lines.map((content) => ({ type, content }));
  });

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex items-center gap-4 px-2">
        <Button variant="ghost" size="icon" asChild className="-ml-2">
          <Link href="/demo-dashboard/changes">
            <ArrowLeft className="h-5 w-5 text-slate-400" />
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
            keyChanges={change.aiKeyChanges} 
          />
          <DiffViewer diffData={diffData} />
        </div>
        <div className="lg:col-span-1">
          <DemoChangeMetaSidebar change={change} />
        </div>
      </div>
    </div>
  );
}
