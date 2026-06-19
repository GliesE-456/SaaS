'use client';

import * as React from 'react';
import useSWR from 'swr';
import { TrackedUrl } from '@cct/db';
import { UrlCard } from './UrlCard';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckProgressModal } from './CheckProgressModal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function UrlList() {
  const { data, error, isLoading, mutate } = useSWR<{ data: TrackedUrl[] }>('/api/v1/urls', fetcher);
  const searchParams = useSearchParams();
  const router = useRouter();
  const firstCheckJobId = searchParams.get('firstCheckJobId');
  const [modalOpen, setModalOpen] = React.useState(!!firstCheckJobId);

  React.useEffect(() => {
    if (firstCheckJobId) {
      setModalOpen(true);
    }
  }, [firstCheckJobId]);

  const handleComplete = () => {
    mutate();
    router.replace('/dashboard/urls');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p>Failed to load URLs</p>
        <Button variant="outline" onClick={() => mutate()}>Retry</Button>
      </div>
    );
  }

  const urls = data?.data || [];

  if (urls.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <AlertCircle className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold">No URLs tracked yet</h3>
        <p className="text-muted-foreground">Add your first URL to start monitoring competitors.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {urls.map((url) => (
          <UrlCard key={url.id} url={url} onUpdate={() => mutate()} />
        ))}
      </div>
      {firstCheckJobId && (
        <CheckProgressModal
          jobId={firstCheckJobId}
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) {
              router.replace('/dashboard/urls');
            }
          }}
          onComplete={handleComplete}
        />
      )}
    </>
  );
}
