'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddUrlForm } from './AddUrlForm';
import { RobotsTxtWarning } from './RobotsTxtWarning';
import { UpgradePrompt } from '../billing/UpgradePrompt';
import { useToast } from '@/hooks/use-toast';
import { getDomainFromUrl } from '@/lib/utils';

import { useSWRConfig } from 'swr';

interface AddUrlDialogProps {
  onSuccess?: () => void;
  allowedFrequencies: string[];
}

export function AddUrlDialog({ onSuccess, allowedFrequencies }: AddUrlDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const { mutate } = useSWRConfig();

  // Robots warning state
  const [showRobotsWarning, setShowRobotsWarning] = React.useState(false);
  const [pendingData, setPendingData] = React.useState<any>(null);
  const [blockedDomain, setBlockedDomain] = React.useState('');

  // Limit error state
  const [limitError, setLimitError] = React.useState<any>(null);

  const handleSubmit = async (data: any, forceOverride = false) => {
    setIsLoading(true);
    setLimitError(null);
    try {
      const body = { ...data };
      if (forceOverride) {
        body.overrideRobots = true;
      }

      const res = await fetch('/api/v1/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        
        if (res.status === 402 && errData.code === 'PLAN_LIMIT') {
          setLimitError(errData);
          setIsLoading(false);
          return;
        }

        if (res.status === 403 && errData.robotsBlocked && !forceOverride) {
          setBlockedDomain(getDomainFromUrl(data.url));
          setPendingData(data);
          setShowRobotsWarning(true);
          setIsLoading(false);
          return;
        }

        throw new Error(errData.error || 'Failed to add URL');
      }

      toast({ title: 'URL added successfully', description: 'We will check this URL shortly.' });
      setOpen(false);
      mutate('/api/v1/urls'); // Refresh SWR cache
      if (onSuccess) onSuccess();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRobotsOverride = () => {
    setShowRobotsWarning(false);
    if (pendingData) {
      handleSubmit(pendingData, true);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add URL
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Track a new URL</DialogTitle>
          </DialogHeader>
          
          {limitError ? (
            <div className="py-6">
              <UpgradePrompt 
                limitType="urls" 
                current={limitError.current} 
                max={limitError.max} 
              />
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={() => setLimitError(null)}>Back</Button>
              </div>
            </div>
          ) : (
            <AddUrlForm 
              onSubmit={(data) => handleSubmit(data, false)} 
              isLoading={isLoading} 
              onCancel={() => setOpen(false)}
              allowedFrequencies={allowedFrequencies}
            />
          )}
        </DialogContent>
      </Dialog>

      <RobotsTxtWarning 
        open={showRobotsWarning} 
        onOpenChange={setShowRobotsWarning}
        onConfirm={handleRobotsOverride}
        domain={blockedDomain}
      />
    </>
  );
}
