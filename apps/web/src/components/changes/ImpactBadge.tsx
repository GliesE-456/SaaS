import { Badge } from '@/components/ui/badge';
import { ImpactLevel } from '@cct/db';
import { cn } from '@/lib/utils';
import { AlertCircle, ArrowUpRight, Minus } from 'lucide-react';

interface ImpactBadgeProps {
  level: ImpactLevel;
  className?: string;
}

export function ImpactBadge({ level, className }: ImpactBadgeProps) {
  switch (level) {
    case 'HIGH':
      return (
        <Badge variant="outline" className={cn('impact-high', className)}>
          <AlertCircle className="mr-1 h-3 w-3" />
          High Impact
        </Badge>
      );
    case 'MEDIUM':
      return (
        <Badge variant="outline" className={cn('impact-medium', className)}>
          <ArrowUpRight className="mr-1 h-3 w-3" />
          Medium Impact
        </Badge>
      );
    case 'LOW':
    default:
      return (
        <Badge variant="outline" className={cn('impact-low', className)}>
          <Minus className="mr-1 h-3 w-3" />
          Low Impact
        </Badge>
      );
  }
}
