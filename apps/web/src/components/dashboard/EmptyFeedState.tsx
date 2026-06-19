import { Activity } from 'lucide-react';

export function EmptyFeedState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center bg-card/50">
      <div className="rounded-full bg-primary/10 p-4">
        <Activity className="h-6 w-6 text-primary" />
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold">No changes to display</h3>
        <p className="text-muted-foreground max-w-sm">
          We haven't detected any changes that match your filters, or we're still running the first checks on your tracked URLs.
        </p>
      </div>
    </div>
  );
}
