'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImpactBadge } from './ImpactBadge';
import { formatRelativeTime } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, ChevronRight, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChangeCardProps {
  change: any; // We'll type this properly later with Prisma includes
  onUpdate: () => void;
}

export function ChangeCard({ change, onUpdate }: ChangeCardProps) {
  const { toast } = useToast();
  const [isMarking, setIsMarking] = React.useState(false);

  const handleMarkRead = async () => {
    setIsMarking(true);
    try {
      const res = await fetch(`/api/v1/changes/${change.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      if (!res.ok) throw new Error('Failed to update');
      onUpdate();
    } catch (err) {
      toast({ title: 'Error marking as read', variant: 'destructive' });
      setIsMarking(false);
    }
  };

  const isAiPending = change.aiStatus === 'PENDING' || change.aiStatus === 'PROCESSING';

  return (
    <Card className={`glass transition-colors ${change.isRead ? 'opacity-70' : 'border-primary/30'}`}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{change.trackedUrl.competitorName || 'Unknown Competitor'}</h3>
            <Badge variant="secondary" className="text-xs">{change.trackedUrl.category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{change.trackedUrl.label}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs text-muted-foreground">{formatRelativeTime(change.createdAt)}</span>
          <ImpactBadge level={change.impactLevel} />
        </div>
      </CardHeader>
      
      <CardContent>
        {isAiPending ? (
          <div className="space-y-2 py-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>AI is analyzing this change...</span>
            </div>
            <Skeleton className="h-4 w-full shimmer" />
            <Skeleton className="h-4 w-[90%] shimmer" />
            <Skeleton className="h-4 w-[60%] shimmer" />
          </div>
        ) : change.aiStatus === 'DONE' && change.aiSummary ? (
          <div className="space-y-4 pt-2">
            <p className="text-sm leading-relaxed">{change.aiSummary}</p>
            {change.aiKeyChanges && change.aiKeyChanges.length > 0 && (
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                {change.aiKeyChanges.slice(0, 2).map((kc: string, i: number) => (
                  <li key={i}>{kc}</li>
                ))}
                {change.aiKeyChanges.length > 2 && (
                  <li className="list-none text-xs mt-1">+{change.aiKeyChanges.length - 2} more changes</li>
                )}
              </ul>
            )}
          </div>
        ) : (
          <div className="py-2 text-sm text-muted-foreground">
            {change.changePercent.toFixed(1)}% of page content changed.
            {change.aiStatus === 'FAILED' && ' (AI analysis failed)'}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between bg-muted/20 py-3 border-t">
        {!change.isRead ? (
          <Button variant="ghost" size="sm" onClick={handleMarkRead} disabled={isMarking} className="text-muted-foreground hover:text-foreground">
            <Check className="mr-2 h-4 w-4" />
            Mark Reviewed
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground px-2 flex items-center">
            <Check className="mr-1 h-3 w-3" /> Reviewed
          </span>
        )}
        <Button size="sm" variant="secondary" asChild>
          <Link href={`/dashboard/changes/${change.id}`}>
            View Diff <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
