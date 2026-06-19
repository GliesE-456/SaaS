import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@cct/db';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Globe, Clock, Tag, Activity, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompetitorAnalysisPanel } from '@/components/urls/CompetitorAnalysisPanel';
import { UrlStatusBadge } from '@/components/urls/UrlStatusBadge';
import { CheckNowButton } from '@/components/urls/CheckNowButton';
import { formatRelativeTime } from '@/lib/utils';
import { ChangeCard } from '@/components/changes/ChangeCard';

export const metadata: Metadata = {
  title: 'Competitor Details | Competitor Change Tracker',
};

export default async function TrackedUrlDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !session.user || !(session as any).workspace) {
    redirect('/sign-in');
  }

  const workspaceId = (session as any).workspace.id;
  const { id } = await params;

  const urlRecord = await db.trackedUrl.findUnique({
    where: { id },
    include: {
      checkRuns: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      changeEvents: {
        orderBy: { createdAt: 'desc' },
        include: {
          trackedUrl: true
        }
      }
    }
  });

  if (!urlRecord || urlRecord.workspaceId !== workspaceId) {
    notFound();
  }

  const successfulRuns = urlRecord.checkRuns.filter((r: any) => r.status === 'SUCCESS');
  const failRuns = urlRecord.checkRuns.filter((r: any) => r.status === 'FAILED');

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex items-center gap-4 px-2">
        <Button variant="ghost" size="icon" asChild className="-ml-2">
          <Link href="/dashboard/urls">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to URLs</span>
          </Link>
        </Button>
        <PageHeader 
          heading={urlRecord.competitorName || 'Competitor Details'} 
          text={urlRecord.url} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="analysis" className="space-y-6">
            <TabsList className="glass border-border/40 p-1 w-full sm:w-auto grid grid-cols-2">
              <TabsTrigger value="analysis">Competitor Profile</TabsTrigger>
              <TabsTrigger value="changes">
                Change History ({urlRecord.changeEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="outline-none">
              <CompetitorAnalysisPanel urlId={urlRecord.id} />
            </TabsContent>

            <TabsContent value="changes" className="space-y-4 outline-none">
              {urlRecord.changeEvents.length === 0 ? (
                <Card className="glass border-dashed py-12 text-center text-muted-foreground">
                  <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                    <Activity className="h-10 w-10 opacity-30 text-indigo-400" />
                    <CardTitle className="text-foreground">No Changes Detected Yet</CardTitle>
                    <CardDescription>
                      We will show a historical feed of changes here when the competitor modifies their website.
                    </CardDescription>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {urlRecord.changeEvents.map((change) => (
                    // We render a wrapper to disable live mutation locally or use a placeholder reloader
                    <ChangeCard 
                      key={change.id} 
                      change={change} 
                      onUpdate={() => {}} 
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Metadata Area */}
        <div className="space-y-6">
          <Card className="glass border-indigo-500/10 shadow-lg">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Competitor Metadata</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-4 w-4" /> Domain
                </span>
                <span className="font-medium truncate max-w-[180px]" title={urlRecord.url}>
                  {urlRecord.url.replace(/^https?:\/\//, '')}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Tag className="h-4 w-4" /> Category
                </span>
                <span className="font-medium bg-muted/60 text-foreground text-xs px-2.5 py-0.5 rounded-full uppercase">
                  {urlRecord.category}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Check Frequency
                </span>
                <span className="font-medium capitalize">
                  {urlRecord.checkFrequency.toLowerCase().replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Activity className="h-4 w-4" /> Status
                </span>
                <UrlStatusBadge status={urlRecord.status} />
              </div>

              <hr className="border-border/40" />

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Last Scrape Date</span>
                <p className="text-sm font-medium">
                  {urlRecord.lastCheckedAt ? formatRelativeTime(urlRecord.lastCheckedAt) : 'Never checked'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Next Scheduled Run</span>
                <p className="text-sm font-medium">
                  {urlRecord.nextCheckAt ? formatRelativeTime(urlRecord.nextCheckAt) : 'Not scheduled'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-indigo-500/10 shadow-lg">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Monitoring Controls</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Runs</span>
                <span className="font-semibold">{urlRecord.checkRuns.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground text-emerald-500">Successful Crawls</span>
                <span className="font-semibold text-emerald-500">{successfulRuns.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground text-destructive">Failed Crawls</span>
                <span className="font-semibold text-destructive">{failRuns.length}</span>
              </div>

              <div className="pt-2">
                <CheckNowButton urlId={urlRecord.id} onComplete={() => {}} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
