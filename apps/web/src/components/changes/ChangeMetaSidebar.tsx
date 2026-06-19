import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import { ImpactBadge } from './ImpactBadge';
import { Globe, Clock, FileText, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChangeMetaSidebarProps {
  change: any;
}

export function ChangeMetaSidebar({ change }: ChangeMetaSidebarProps) {
  const url = change.trackedUrl;

  return (
    <div className="space-y-6">
      <Card className="glass">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm">Change Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Impact Level</div>
            <ImpactBadge level={change.impactLevel} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Detected</div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {formatRelativeTime(change.createdAt)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Content Changed</div>
            <div className="text-sm font-medium">{change.changePercent.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Status</div>
            <Badge variant={change.isRead ? 'secondary' : 'default'}>
              {change.isRead ? 'Reviewed' : 'Unread'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm">Tracked URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Competitor</div>
            <div className="text-sm font-medium">{url.competitorName || 'Unknown'}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Category</div>
            <Badge variant="outline">{url.category}</Badge>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-2">URL</div>
            <Link 
              href={url.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-sm text-primary hover:underline break-all"
            >
              <Globe className="mr-2 h-4 w-4 shrink-0" />
              {url.url}
            </Link>
          </div>
          
          <Button variant="outline" className="w-full mt-2" asChild>
            <Link href={`/dashboard/urls/${url.id}`}>
              View URL Settings <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
