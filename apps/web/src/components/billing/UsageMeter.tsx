import { Progress } from '@/components/ui/progress';

interface UsageMeterProps {
  label: string;
  current: number;
  max: number;
  description?: string;
}

export function UsageMeter({ label, current, max, description }: UsageMeterProps) {
  const percentage = Math.min(Math.round((current / max) * 100), 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{label}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className="text-sm font-medium">
          {current} / {max}
        </div>
      </div>
      <Progress 
        value={percentage} 
        className={`h-2 ${isAtLimit ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-amber-500' : ''}`}
      />
    </div>
  );
}
