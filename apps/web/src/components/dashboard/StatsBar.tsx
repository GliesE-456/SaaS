import { Card, CardContent } from '@/components/ui/card';
import { Activity, Globe, Zap, AlertTriangle } from 'lucide-react';

interface StatsBarProps {
  stats: {
    totalUrls: number;
    activeUrls: number;
    totalChanges30d: number;
    highImpact30d: number;
  };
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="glass">
        <CardContent className="p-6 flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Tracked URLs</p>
            <p className="text-2xl font-bold">{stats.totalUrls}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Globe className="h-5 w-5 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardContent className="p-6 flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Active Checks</p>
            <p className="text-2xl font-bold">{stats.activeUrls}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardContent className="p-6 flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Changes (30d)</p>
            <p className="text-2xl font-bold">{stats.totalChanges30d}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-indigo-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardContent className="p-6 flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">High Impact</p>
            <p className="text-2xl font-bold">{stats.highImpact30d}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
