"use client";

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Zap } from 'lucide-react';

export default function DemoBillingPage() {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: 'Action locked',
      description: 'Demo mode: Stripe portal access is disabled in the demo environment.',
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 max-w-4xl">
      <PageHeader
        heading="Billing"
        text="Manage your subscription and usage limits."
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass flex flex-col justify-between">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-white">Current Plan</CardTitle>
                <CardDescription className="text-slate-400">Your current workspace subscription tier.</CardDescription>
              </div>
              <span className="text-xs bg-indigo-500 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Active Demo
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white">Starter Plan</span>
              <span className="text-sm text-slate-400">$19/month</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Mock account active since June 19, 2026. Next billing date is simulated.
            </p>
          </CardContent>
          <CardFooter className="border-t border-indigo-500/5 pt-4">
            <Button onClick={handleAction} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
              Manage Subscription
            </Button>
          </CardFooter>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-white">Plan Limits & Usage</CardTitle>
            <CardDescription className="text-slate-400">Usage statistics for the current billing cycle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-300">Tracked URLs</span>
                <span className="text-muted-foreground">3 / 25 URLs</span>
              </div>
              <Progress value={12} className="h-2 bg-slate-900" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-300">AI Summaries (Month)</span>
                <span className="text-muted-foreground">14 / 200 summaries</span>
              </div>
              <Progress value={7} className="h-2 bg-slate-900" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-300">Team Members</span>
                <span className="text-muted-foreground">1 / 1 members</span>
              </div>
              <Progress value={100} className="h-2 bg-slate-900" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="border border-indigo-500/10 rounded-2xl bg-slate-950/20 p-6 flex flex-col sm:flex-row items-center justify-around gap-6 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-indigo-400" />
          <div>
            <h4 className="font-bold text-sm text-white">SSL Encrypted Checkout</h4>
            <p className="text-xs text-muted-foreground">All transactions are secured by Stripe.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-indigo-400" />
          <div>
            <h4 className="font-bold text-sm text-white">Instant Activation</h4>
            <p className="text-xs text-muted-foreground">Get access to your plan limits immediately.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
