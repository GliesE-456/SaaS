"use client";

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UrlStatusBadge } from '@/components/urls/UrlStatusBadge';
import { Globe, Clock, MoreVertical, Pause, Play, Trash2, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { MockUrl } from '@/lib/demo-mock-data';

interface DemoUrlCardProps {
  url: MockUrl;
}

export function DemoUrlCard({ url }: DemoUrlCardProps) {
  const { toast } = useToast();
  const [status, setStatus] = React.useState(url.status);
  const [isChecking, setIsChecking] = React.useState(false);

  const handleAction = (action: 'pause' | 'resume' | 'delete') => {
    if (action === 'delete') {
      toast({
        title: 'Action locked',
        description: 'Demo mode: You cannot delete URLs in this shared workspace.',
        variant: 'destructive',
      });
      return;
    }
    setStatus(action === 'pause' ? 'PAUSED' : 'ACTIVE');
    toast({
      title: 'Action simulated',
      description: `URL successfully ${action}d in demo mode!`,
    });
  };

  const handleCheckNow = () => {
    setIsChecking(true);
    toast({
      title: 'Crawling started',
      description: 'Demo mode: Crawling simulated instantly.',
    });
    setTimeout(() => {
      setIsChecking(false);
      toast({
        title: 'Check complete',
        description: 'No changes detected on target page.',
      });
    }, 1500);
  };

  return (
    <Card className="flex flex-col glass hover:border-indigo-500/50 transition-colors duration-300">
      <CardContent className="flex-1 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{url.competitorName}</h3>
              <Badge variant="secondary" className="text-xs bg-slate-900 text-indigo-400 border border-indigo-500/10">
                {url.category}
              </Badge>
            </div>
            <a 
              href={url.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center text-sm text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <Globe className="mr-1 h-3 w-3" />
              {url.label || url.url}
            </a>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="-mr-2 -mt-2">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/demo-dashboard/urls/${url.id}`}>View Details</Link>
              </DropdownMenuItem>
              {status === 'ACTIVE' ? (
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

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1.5">
            <UrlStatusBadge status={status as any} />
          </div>
          <div className="flex items-center gap-1.5" title="Check Frequency">
            <Clock className="h-4 w-4" />
            <span className="capitalize">{url.checkFrequency.toLowerCase().replace('_', ' ')}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/20 px-6 py-4 border-t border-indigo-500/10 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Last checked {url.lastCheckedAt}
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleCheckNow} 
          disabled={isChecking}
          className="h-8 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
        >
          {isChecking ? (
            <>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Crawling...
            </>
          ) : (
            'Check Now'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
