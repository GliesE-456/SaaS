'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function OnboardingWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);

  // Step 1 state
  const [competitorName, setCompetitorName] = React.useState('');

  // Step 2 state
  const [url, setUrl] = React.useState('');
  const [category, setCategory] = React.useState('PRICING');

  // Step 3 state
  const [emailEnabled, setEmailEnabled] = React.useState(true);
  const [emailDigest, setEmailDigest] = React.useState('IMMEDIATE');

  const handleNext = () => {
    if (step === 1 && !competitorName) {
      toast({ title: 'Please enter a competitor name', variant: 'destructive' });
      return;
    }
    if (step === 2 && !url) {
      toast({ title: 'Please enter a URL', variant: 'destructive' });
      return;
    }
    setStep((s) => s + 1);
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      // 1. Add URL
      const urlRes = await fetch('/api/v1/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          label: `${competitorName} ${category}`,
          competitorName,
          category,
          checkFrequency: 'DAILY',
          noiseThreshold: 2.0,
        }),
      });

      if (!urlRes.ok) {
        const error = await urlRes.json();
        throw new Error(error.error || 'Failed to add URL');
      }

      const urlData = await urlRes.json();
      const urlId = urlData.data.id;

      // 2. Trigger first check immediately
      const checkRes = await fetch(`/api/v1/urls/${urlId}/check`, { method: 'POST' });
      let jobId = '';
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        jobId = checkData.data.jobId;
      }

      // 3. Update Notification Prefs
      const prefRes = await fetch('/api/v1/settings/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailEnabled,
          emailDigest,
        }),
      });

      if (!prefRes.ok) throw new Error('Failed to update preferences');

      toast({
        title: 'Setup Complete!',
        description: "We've started crawling your competitor's page.",
      });

      if (jobId) {
        router.push(`/dashboard/urls?firstCheckJobId=${jobId}`);
      } else {
        router.push('/dashboard/urls');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg pt-12">
      <div className="mb-8 flex items-center justify-between px-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                step >= i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > i ? <CheckCircle2 className="h-5 w-5" /> : i}
            </div>
            {i < 3 && (
              <div
                className={`mx-2 h-1 w-16 sm:w-24 rounded-full ${
                  step > i ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Who are you tracking?'}
            {step === 2 && 'Add their website'}
            {step === 3 && 'Set up alerts'}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Start by naming your primary competitor."}
            {step === 2 && "Which page do you want to monitor first?"}
            {step === 3 && "How should we notify you when changes happen?"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="competitorName">Competitor Name</Label>
                <Input
                  id="competitorName"
                  placeholder="e.g. Acme Corp"
                  value={competitorName}
                  onChange={(e) => setCompetitorName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL to Track</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://acme.com/pricing"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Page Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRICING">Pricing</SelectItem>
                    <SelectItem value="FEATURES">Features</SelectItem>
                    <SelectItem value="PRODUCT">Product Page</SelectItem>
                    <SelectItem value="LANDING">Landing Page</SelectItem>
                    <SelectItem value="TOS">Terms of Service</SelectItem>
                    <SelectItem value="BLOG">Blog</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive an email when we detect a change.
                  </p>
                </div>
                <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
              </div>

              {emailEnabled && (
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={emailDigest} onValueChange={setEmailDigest}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IMMEDIATE">Immediately</SelectItem>
                      <SelectItem value="DAILY">Daily Digest</SelectItem>
                      <SelectItem value="WEEKLY">Weekly Digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1 || isLoading}
          >
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={handleNext}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Setup
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
