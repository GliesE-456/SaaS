'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface CheckProgressModalProps {
  jobId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function CheckProgressModal({ jobId, open, onOpenChange, onComplete }: CheckProgressModalProps) {
  const [status, setStatus] = React.useState<'pending' | 'running' | 'completed' | 'failed'>('pending');
  const [progress, setProgress] = React.useState(0);
  const [errorMsg, setErrorMsg] = React.useState('');

  React.useEffect(() => {
    if (!open || !jobId) return;

    setStatus('pending');
    setProgress(10);
    
    // Connect to SSE
    const evtSource = new EventSource(`/api/v1/jobs/${jobId}/stream`);

    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === 'created' || data.status === 'active') {
          setStatus('running');
          setProgress((p) => Math.min(p + 20, 80));
        } else if (data.status === 'completed') {
          setStatus('completed');
          setProgress(100);
          evtSource.close();
          setTimeout(() => {
            onComplete();
            onOpenChange(false);
          }, 1500);
        } else if (data.status === 'failed' || data.status === 'cancelled') {
          setStatus('failed');
          setErrorMsg('Check failed or timed out.');
          evtSource.close();
        }
      } catch (err) {}
    };

    evtSource.onerror = () => {
      setStatus('failed');
      setErrorMsg('Connection lost.');
      evtSource.close();
    };

    return () => {
      evtSource.close();
    };
  }, [jobId, open, onComplete, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Checking for changes...</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-6 py-6">
          {status === 'failed' ? (
            <>
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
            </>
          ) : status === 'completed' ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <p className="text-sm text-muted-foreground">Check completed successfully.</p>
            </>
          ) : (
            <>
              <RefreshCw className="h-12 w-12 animate-spin text-primary" />
              <Progress value={progress} className="w-[80%]" />
              <p className="text-sm text-muted-foreground">
                {status === 'pending' ? 'Queued...' : 'Crawling page...'}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
