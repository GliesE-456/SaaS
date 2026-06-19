"use client";

import * as React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Globe, Clock, Activity, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { UrlStatusBadge } from '@/components/urls/UrlStatusBadge';
import { DemoChangeCard } from '@/components/demo/DemoChangeCard';
import { MOCK_URLS, MOCK_CHANGES } from '@/lib/demo-mock-data';
import { useToast } from '@/hooks/use-toast';

interface Props {
  params: React.Usable<{ id: string }>;
}

export default function DemoUrlDetailPage({ params }: Props) {
  const { id } = React.use(params);
  const { toast } = useToast();
  const [isChecking, setIsChecking] = React.useState(false);

  const url = MOCK_URLS.find((u) => u.id === id);
  if (!url) {
    notFound();
  }

  const urlChanges = MOCK_CHANGES.filter((c) => c.urlId === id);

  const handleCheckNow = () => {
    setIsChecking(true);
    toast({
      title: 'Crawling started',
      description: 'Demo mode: Crawling simulated instantly.',
    });
    setTimeout(() => {
      setIsChecking(false);
      toast({
        title: 'Check complete',
        description: 'No changes detected on target page.',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="-ml-2">
          <Link href="/demo-dashboard/urls">
            <ArrowLeft className="h-5 w-5 text-slate-400" />
            <span className="sr-only">Back to URLs</span>
          </Link>
        </Button>
        <PageHeader heading={url.competitorName} />
      </div>

      {/* Main Metadata Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Tracked URL Details</CardTitle>
            <CardDescription className="text-slate-400">Settings and configuration for this crawler target.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Target Address</span>
              <a href={url.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline flex items-center font-medium">
                <Globe className="h-4 w-4 mr-2" />
                {url.url}
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Status</span>
                <UrlStatusBadge status={url.status as any} />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Crawl Frequency</span>
                <div className="flex items-center text-slate-300 gap-1.5 text-sm mt-1">
                  <Clock className="h-4 w-4 text-indigo-400" />
                  <span className="capitalize">{url.checkFrequency.toLowerCase().replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass md:col-span-1 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-white">Actions</CardTitle>
            <CardDescription className="text-slate-400">Trigger manual audits or checks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-end">
            <Button onClick={handleCheckNow} disabled={isChecking} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
              {isChecking ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Checking now...
                </>
              ) : (
                'Check Page Now'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="changes" className="space-y-6">
        <TabsList className="bg-slate-950/60 border border-indigo-500/10">
          <TabsTrigger value="changes" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Historical Changes</TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="changes" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Detected Changes Timeline</h3>
            {urlChanges.length === 0 ? (
              <p className="text-sm text-slate-400">No changes detected for this URL yet.</p>
            ) : (
              <div className="grid gap-6">
                {urlChanges.map((change) => (
                  <DemoChangeCard key={change.id} change={change} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-white">AI Competitor Profile Analysis</CardTitle>
              <CardDescription className="text-slate-400">Automatically generated competitor profile based on crawled content.</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
              {url.analysisText || 'AI has not generated a profile for this competitor yet.'}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
