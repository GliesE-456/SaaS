"use client";

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImpactBadge } from '@/components/changes/ImpactBadge';
import { Check, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MockChange } from '@/lib/demo-mock-data';

interface DemoChangeCardProps {
  change: MockChange;
}

export function DemoChangeCard({ change }: DemoChangeCardProps) {
  const { toast } = useToast();
  const [isRead, setIsRead] = React.useState(false);

  const handleMarkRead = () => {
    setIsRead(true);
    toast({
      title: 'Review updated',
      description: 'Demo mode: Action simulated successfully!',
    });
  };

  const mockUrl = {
    competitorName: change.competitorName,
    category: change.urlId === 'url-alpha-pricing' ? 'PRICING' : change.urlId === 'url-beta-features' ? 'FEATURES' : 'LANDING',
    label: change.pageLabel,
  };

  return (
    <Card className={`glass transition-all duration-350 hover:shadow-lg ${isRead ? 'opacity-70' : 'border-indigo-500/20'}`}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">{mockUrl.competitorName}</h3>
            <Badge variant="secondary" className="text-xs bg-slate-900 text-indigo-400 border border-indigo-500/10">
              {mockUrl.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{mockUrl.label}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs text-muted-foreground">{change.createdAt}</span>
          <ImpactBadge level={change.impactLevel} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4 pt-2">
          <p className="text-sm leading-relaxed text-slate-200">{change.aiSummary}</p>
          {change.aiKeyChanges && change.aiKeyChanges.length > 0 && (
            <ul className="list-disc pl-4 text-sm text-slate-400 space-y-1">
              {change.aiKeyChanges.slice(0, 2).map((kc: string, i: number) => (
                <li key={i}>{kc}</li>
              ))}
              {change.aiKeyChanges.length > 2 && (
                <li className="list-none text-xs text-indigo-400 mt-1">+{change.aiKeyChanges.length - 2} more changes</li>
              )}
            </ul>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between bg-muted/20 py-3 border-t border-indigo-500/10">
        {!isRead ? (
          <Button variant="ghost" size="sm" onClick={handleMarkRead} className="text-muted-foreground hover:text-foreground">
            <Check className="mr-2 h-4 w-4" />
            Mark Reviewed
          </Button>
        ) : (
          <span className="text-xs text-indigo-400 px-2 flex items-center font-medium">
            <Check className="mr-1 h-3 w-3" /> Reviewed
          </span>
        )}
        <Button size="sm" variant="secondary" className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/25" asChild>
          <Link href={`/demo-dashboard/changes/${change.id}`}>
            View Diff <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
