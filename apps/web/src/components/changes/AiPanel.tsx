import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AiPanelProps {
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED' | 'SKIPPED';
  summary?: string | null;
  keyChanges?: string[] | null;
}

export function AiPanel({ status, summary, keyChanges }: AiPanelProps) {
  if (status === 'PENDING' || status === 'PROCESSING') {
    return (
      <Card className="glass border-indigo-500/20 bg-indigo-500/5">
        <CardContent className="flex items-center gap-3 py-6">
          <Sparkles className="h-5 w-5 animate-pulse text-indigo-500" />
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            AI is analyzing this change to provide a summary...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'FAILED') {
    return (
      <Card className="glass border-destructive/20 bg-destructive/5">
        <CardContent className="flex items-center gap-3 py-6">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <p className="text-sm font-medium text-destructive">
            AI analysis failed for this change.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  return (
    <Card className="glass border-indigo-500/20 bg-indigo-500/5 shadow-lg shadow-indigo-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
          <Sparkles className="h-4 w-4" /> AI Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{summary}</p>
        
        {keyChanges && keyChanges.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Changes</h4>
            <ul className="space-y-2">
              {keyChanges.map((kc, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 flex h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span className="text-muted-foreground">{kc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
