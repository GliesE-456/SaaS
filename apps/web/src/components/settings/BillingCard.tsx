'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlanBadge } from '../billing/PlanBadge';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

interface BillingCardProps {
  plan: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  cancelAtPeriodEnd?: boolean;
}

export function BillingCard({ plan, stripeCustomerId, cancelAtPeriodEnd }: BillingCardProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setIsProcessing(true);
      const timer = setTimeout(() => {
        setIsProcessing(false);
        router.replace('/dashboard/settings/billing');
        router.refresh();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to load billing portal');
      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to redirect to billing portal',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'starter' }),
      });
      if (!res.ok) throw new Error('Failed to start checkout');
      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to start checkout',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  if (isProcessing) {
    return (
      <Card className="glass border-indigo-500/30">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <h3 className="font-bold text-lg text-white">Activating your plan...</h3>
          <p className="text-sm text-muted-foreground text-center">We are finalizing your subscription. Your new limits will be available in a moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Subscription Plan</CardTitle>
        <CardDescription>
          Manage your subscription and billing details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
          <div>
            <div className="font-medium flex items-center gap-2">
              Current Plan: <PlanBadge plan={plan} />
            </div>
            {cancelAtPeriodEnd && (
              <p className="text-sm text-destructive mt-1">Your plan will be canceled at the end of the billing period.</p>
            )}
          </div>
          <div className="text-2xl font-bold">
            {plan === 'FREE' ? '$0' : plan === 'STARTER' ? '$19' : '$49'}
            <span className="text-sm font-normal text-muted-foreground">/mo</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-between">
        <p className="text-sm text-muted-foreground">
          {plan === 'FREE' ? 'Upgrade for more URLs and faster checks.' : 'Manage payment methods and invoices in Stripe.'}
        </p>
        {stripeCustomerId ? (
          <Button onClick={handleManageBilling} disabled={isLoading} variant="outline">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Manage Billing
          </Button>
        ) : (
          <Button onClick={handleUpgrade} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upgrade to Starter
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
