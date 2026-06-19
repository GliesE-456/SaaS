'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UpgradePromptProps {
  limitType: 'urls' | 'aiSummaries';
  current: number;
  max: number;
  layout?: 'banner' | 'card';
}

export function UpgradePrompt({ limitType, current, max, layout = 'card' }: UpgradePromptProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'starter' }), // Starter is the default upgrade
      });
      if (!res.ok) throw new Error('Failed to create checkout session');
      const { data } = await res.json();
      window.location.href = data.url;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to redirect to Stripe checkout',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const limitName = limitType === 'urls' ? 'Tracked URLs' : 'AI Summaries';

  if (layout === 'banner') {
    return (
      <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-amber-500" />
          <div className="text-sm">
            <span className="font-medium text-amber-900 dark:text-amber-200">
              {limitName} Limit Reached ({current}/{max})
            </span>
            <span className="text-amber-700 dark:text-amber-400 ml-2">
              Upgrade to track more.
            </span>
          </div>
        </div>
        <Button size="sm" onClick={handleUpgrade} disabled={isLoading} className="bg-amber-500 hover:bg-amber-600 text-white">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Upgrade Plan
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed border-amber-500/50 bg-amber-500/5 p-8 text-center">
      <div className="rounded-full bg-amber-500/20 p-3">
        <Zap className="h-6 w-6 text-amber-500" />
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-amber-900 dark:text-amber-200">
          You've hit your {limitName} limit ({current}/{max})
        </h3>
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Upgrade to the Starter plan to unlock higher limits and more frequent checks.
        </p>
      </div>
      <Button onClick={handleUpgrade} disabled={isLoading} className="bg-amber-500 hover:bg-amber-600 text-white">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Upgrade to Starter
      </Button>
    </div>
  );
}
