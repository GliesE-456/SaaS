import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DiffLine } from './DiffLine';
import { FileDiff } from 'lucide-react';

interface DiffViewerProps {
  diffData: any; // Array of diff objects or parsed JSON
}

export function DiffViewer({ diffData }: DiffViewerProps) {
  let lines: { type: 'added' | 'removed' | 'unchanged'; content: string }[] = [];

  try {
    if (typeof diffData === 'string') {
      lines = JSON.parse(diffData);
    } else if (Array.isArray(diffData)) {
      lines = diffData;
    }
  } catch (e) {
    console.error('Failed to parse diffData', e);
  }

  if (!lines || lines.length === 0) {
    return (
      <Card className="glass">
        <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground">
          <FileDiff className="mb-4 h-8 w-8 opacity-20" />
          <p>No text differences found.</p>
        </CardContent>
      </Card>
    );
  }

  // Count changes
  const additions = lines.filter((l) => l.type === 'added').length;
  const deletions = lines.filter((l) => l.type === 'removed').length;

  return (
    <Card className="glass overflow-hidden">
      <CardHeader className="border-b bg-muted/20 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileDiff className="h-4 w-4" /> Content Changes
          </CardTitle>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-emerald-500">+{additions} additions</span>
            <span className="text-destructive">-{deletions} deletions</span>
          </div>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <div className="min-w-[600px] py-4">
          {lines.map((line, i) => (
            <DiffLine key={i} type={line.type} content={line.content} />
          ))}
        </div>
      </div>
    </Card>
  );
}
