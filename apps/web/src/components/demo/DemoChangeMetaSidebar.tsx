import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImpactBadge } from '@/components/changes/ImpactBadge';
import { Globe, Clock, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MockChange } from '@/lib/demo-mock-data';

interface DemoChangeMetaSidebarProps {
  change: MockChange;
}

export function DemoChangeMetaSidebar({ change }: DemoChangeMetaSidebarProps) {
  const mockUrl = {
    id: change.urlId,
    competitorName: change.competitorName,
    category: change.urlId === 'url-alpha-pricing' ? 'PRICING' : change.urlId === 'url-beta-features' ? 'FEATURES' : 'LANDING',
    url: change.urlId === 'url-alpha-pricing' ? 'https://alphacloud.io/pricing' : change.urlId === 'url-beta-features' ? 'https://betaflow.com/features' : 'https://gammasec.com/homepage',
  };

  return (
    <div className="space-y-6">
      <Card className="glass">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm text-white">Change Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs text-slate-400 mb-1">Impact Level</div>
            <ImpactBadge level={change.impactLevel} />
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Detected</div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Clock className="h-4 w-4 text-indigo-400" />
              {change.createdAt}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Content Changed</div>
            <div className="text-sm font-medium text-slate-300">{change.changePercent.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Status</div>
            <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Simulated
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm text-white">Tracked URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs text-slate-400 mb-1">Competitor</div>
            <div className="text-sm font-medium text-slate-300">{mockUrl.competitorName}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Category</div>
            <Badge variant="outline" className="border-indigo-500/25 text-indigo-400">{mockUrl.category}</Badge>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-2">URL</div>
            <a 
              href={mockUrl.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-sm text-indigo-400 hover:underline break-all"
            >
              <Globe className="mr-2 h-4 w-4 shrink-0" />
              {mockUrl.url}
            </a>
          </div>
          
          <Button variant="outline" className="w-full mt-2 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10" asChild>
            <Link href={`/demo-dashboard/urls/${mockUrl.id}`}>
              View URL Settings <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
