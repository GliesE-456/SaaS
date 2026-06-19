'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrackedUrl, UrlStatus } from '@cct/db';
import { formatRelativeTime, getDomainFromUrl } from '@/lib/utils';
import { UrlStatusBadge } from './UrlStatusBadge';
import { CheckNowButton } from './CheckNowButton';
import { Globe, Clock, AlertTriangle, MoreVertical, Pause, Play, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface UrlCardProps {
  url: TrackedUrl;
  onUpdate: () => void;
}

export function UrlCard({ url, onUpdate }: UrlCardProps) {
  const { toast } = useToast();

  const handleAction = async (action: 'pause' | 'resume' | 'delete') => {
    try {
      const endpoint = action === 'delete' ? `/api/v1/urls/${url.id}` : `/api/v1/urls/${url.id}/${action}`;
      const method = action === 'delete' ? 'DELETE' : 'POST';
      
      const res = await fetch(endpoint, { method });
      if (!res.ok) throw new Error(`Failed to ${action} URL`);
      
      toast({ title: `URL ${action}d successfully` });
      onUpdate();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="flex flex-col glass hover:border-primary/50 transition-colors">
      <CardContent className="flex-1 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold tracking-tight">{url.competitorName || getDomainFromUrl(url.url)}</h3>
              <Badge variant="secondary" className="text-xs">{url.category}</Badge>
            </div>
            <Link 
              href={url.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Globe className="mr-1 h-3 w-3" />
              {url.label || url.url}
            </Link>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="-mr-2 -mt-2">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/urls/${url.id}`}>View Details</Link>
              </DropdownMenuItem>
              {url.status === 'ACTIVE' ? (
                <DropdownMenuItem onClick={() => handleAction('pause')}>
                  <Pause className="mr-2 h-4 w-4" /> Pause Tracking
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleAction('resume')}>
                  <Play className="mr-2 h-4 w-4" /> Resume Tracking
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleAction('delete')} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <UrlStatusBadge status={url.status} />
          </div>
          <div className="flex items-center gap-1.5" title="Check Frequency">
            <Clock className="h-4 w-4" />
            <span className="capitalize">{url.checkFrequency.toLowerCase().replace('_', ' ')}</span>
          </div>
          {url.consecutiveFails > 0 && (
            <div className="flex items-center gap-1.5 text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              <span>{url.consecutiveFails} fails</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 px-6 py-4 border-t flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {url.lastCheckedAt ? `Last checked ${formatRelativeTime(url.lastCheckedAt)}` : 'Never checked'}
        </div>
        <CheckNowButton urlId={url.id} onComplete={onUpdate} />
      </CardFooter>
    </Card>
  );
}
