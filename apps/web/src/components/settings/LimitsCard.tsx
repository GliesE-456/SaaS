import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsageMeter } from '../billing/UsageMeter';
import { PLAN_LIMITS } from '@/lib/plan-limits';

interface LimitsCardProps {
  plan: string;
  urlsCount: number;
  aiSummariesCount: number;
}

export function LimitsCard({ plan, urlsCount, aiSummariesCount }: LimitsCardProps) {
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Usage & Limits</CardTitle>
        <CardDescription>
          Your current resource usage for this billing cycle.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <UsageMeter
          label="Tracked URLs"
          description="Number of competitor pages you are currently monitoring."
          current={urlsCount}
          max={limits.maxUrls}
        />
        <UsageMeter
          label="AI Summaries (Monthly)"
          description="Number of AI-generated change summaries used this month."
          current={aiSummariesCount}
          max={limits.aiSummariesPerMonth}
        />
        
        <div className="pt-4 border-t space-y-2">
          <p className="text-sm font-medium">Included Features</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Check Frequency: Up to {limits.allowedFrequencies.join(', ')}</li>
            <li>Change History: {limits.historyRetentionDays} days retention</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
