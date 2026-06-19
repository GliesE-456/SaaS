'use client';

import * as React from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { MarkdownRenderer } from '../shared/MarkdownRenderer';
import { Sparkles, AlertCircle, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CompetitorAnalysisPanelProps {
  urlId: string;
}

export function CompetitorAnalysisPanel({ urlId }: CompetitorAnalysisPanelProps) {
  const { toast } = useToast();
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/urls/${urlId}/analysis`,
    fetcher,
    { refreshInterval: (data) => (data?.data?.analysisStatus === 'PROCESSING' ? 3000 : 0) }
  );

  const [isTriggering, setIsTriggering] = React.useState(false);

  const handleTriggerAnalysis = async () => {
    setIsTriggering(true);
    try {
      const res = await fetch(`/api/v1/urls/${urlId}/analysis`, { method: 'POST' });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to trigger competitor analysis');
      }
      toast({
        title: 'Analysis Started',
        description: 'AI is now generating a detailed profile of the competitor website.',
      });
      mutate();
    } catch (err: any) {
      toast({
        title: 'Trigger Failed',
        description: err.message || 'An error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsTriggering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <LoadingSpinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4 text-destructive">
        <AlertCircle className="h-8 w-8" />
        <p>Failed to load competitor analysis data</p>
      </div>
    );
  }

  const analysis = data?.data;
  const status = analysis?.analysisStatus || 'PENDING';
  const text = analysis?.analysisText;
  const hasSuccessfulCheck = analysis?.hasSuccessfulCheck;

  if (status === 'PROCESSING') {
    return (
      <Card className="glass border-indigo-500/20 bg-indigo-500/5 py-12">
        <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
          <Sparkles className="h-10 w-10 animate-spin text-indigo-500" />
          <CardTitle className="text-indigo-400">Analyzing Competitor Website...</CardTitle>
          <CardDescription className="max-w-md">
            We are parsing the scraped website content to build a detailed positioning, pricing, and feature analysis. This takes about 15-30 seconds.
          </CardDescription>
          <LoadingSpinner className="h-5 w-5 text-indigo-500 mt-2" />
        </CardContent>
      </Card>
    );
  }

  if (!hasSuccessfulCheck) {
    return (
      <Card className="glass border-dashed py-12">
        <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
          <FileText className="h-12 w-12 text-muted-foreground opacity-40" />
          <CardTitle>Crawl Required</CardTitle>
          <CardDescription className="max-w-md">
            The competitor website has not been crawled successfully yet. Run a check to gather content snapshots first, then generate the profile.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  if (status === 'PENDING' || !text) {
    return (
      <Card className="glass border-indigo-500/20 bg-indigo-500/5 py-12">
        <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
          <Sparkles className="h-12 w-12 text-indigo-500 opacity-80" />
          <CardTitle>Generate Competitor Profile</CardTitle>
          <CardDescription className="max-w-md">
            Understand the competitor's value proposition, positioning strategy, feature catalog, pricing packages, and get competitive recommendations.
          </CardDescription>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            onClick={handleTriggerAnalysis}
            disabled={isTriggering}
          >
            {isTriggering ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Starting...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Run AI Competitor Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass border-indigo-500/10 shadow-xl shadow-indigo-500/5">
        <CardHeader className="pb-4 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-indigo-400">
              <Sparkles className="h-4 w-4" /> AI Competitor Profile
            </CardTitle>
            <CardDescription>Generated automatically from crawled webpage content.</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 gap-1.5"
            onClick={handleTriggerAnalysis}
            disabled={isTriggering}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isTriggering ? 'animate-spin' : ''}`} />
            Regenerate Analysis
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {status === 'FAILED' && (
            <div className="mb-6 flex items-center gap-2 text-amber-500 text-sm bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Note: The previous AI run failed; showing local fallback profile. Click regenerate to retry.</span>
            </div>
          )}
          <MarkdownRenderer content={text} />
        </CardContent>
      </Card>
    </div>
  );
}
