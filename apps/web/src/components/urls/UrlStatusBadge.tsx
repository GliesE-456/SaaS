import { Badge } from '@/components/ui/badge';
import { UrlStatus } from '@cct/db';

export function UrlStatusBadge({ status }: { status: UrlStatus }) {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>;
    case 'PAUSED':
      return <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20">Paused</Badge>;
    case 'ERROR':
      return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Error</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
