'use client';

import * as React from 'react';
import { useChangeFeed } from '@/hooks/useChangeFeed';
import { ChangeCard } from './ChangeCard';
import { FeedFilters, FilterState } from './FeedFilters';
import { EmptyFeedState } from '../dashboard/EmptyFeedState';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Button } from '@/components/ui/button';

export function ChangeList() {
  const [filters, setFilters] = React.useState<FilterState>({ impact: 'ALL', readState: 'ALL' });
  const { changes, isLoadingInitialData, isLoadingMore, isReachingEnd, isEmpty, loadMore, mutate } = useChangeFeed(filters);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isReachingEnd && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => observer.disconnect();
  }, [isReachingEnd, isLoadingMore, loadMore]);

  return (
    <div className="space-y-6">
      <FeedFilters filters={filters} onChange={setFilters} />

      {isLoadingInitialData ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner className="h-8 w-8 text-primary" />
        </div>
      ) : isEmpty ? (
        <EmptyFeedState />
      ) : (
        <div className="grid gap-6">
          {changes.map((change: any) => (
            <ChangeCard key={change.id} change={change} onUpdate={() => mutate()} />
          ))}

          {!isReachingEnd && (
            <div ref={sentinelRef} className="flex justify-center py-8">
              <LoadingSpinner className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
