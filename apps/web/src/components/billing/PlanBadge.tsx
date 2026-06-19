import { Badge } from '@/components/ui/badge';

export function PlanBadge({ plan }: { plan: string }) {
  switch (plan.toLowerCase()) {
    case 'PRO':
      return <Badge className="bg-indigo-500 hover:bg-indigo-600">Pro</Badge>;
    case 'STARTER':
      return <Badge className="bg-blue-500 hover:bg-blue-600">Starter</Badge>;
    case 'FREE':
    default:
      return <Badge variant="secondary">Free</Badge>;
  }
}
