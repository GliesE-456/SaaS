import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye, Zap, Shield, Target, Radar } from 'lucide-react';
import { BRANDING } from '@cct/db';
import { PageHeader } from '@/components/shared/PageHeader';
import { LandingInteractiveDemo } from '@/components/landing/LandingInteractiveDemo';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b border-indigo-500/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Link className="flex items-center gap-2 font-heading font-extrabold text-2xl text-primary tracking-tight" href="/">
          <Radar className="h-6 w-6 text-indigo-500 animate-pulse" />
          <span>{BRANDING.name}</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors flex items-center" href="/pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors flex items-center" href="/sign-in">
            Log in
          </Link>
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-28 lg:py-36 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="container px-4 md:px-6 relative z-10 space-y-16">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-400">
                <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
                Now with AI-powered change summaries
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 drop-shadow-sm max-w-4xl">
                Never Miss a Move Your <span className="text-indigo-400">Competitors</span> Make
              </h1>
              <p className="mx-auto max-w-[700px] text-lg md:text-xl text-muted-foreground leading-relaxed">
                Automatically track pricing changes, feature updates, and messaging shifts across your competitors' websites. Get instantly notified when it matters.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button size="lg" className="h-12 px-8 text-base bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all hover:scale-105 animate-in fade-in zoom-in-95 duration-500" asChild>
                  <Link href="/sign-up">Start Tracking for Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-indigo-500/30 hover:border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 transition-all hover:scale-105" asChild>
                  <Link href="/demo-dashboard/overview">Try the Demo Dashboard</Link>
                </Button>
              </div>
            </div>

            {/* Interactive Demo Sandbox Widget */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <LandingInteractiveDemo />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 md:py-32 bg-muted/30 border-t border-indigo-500/10">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Everything you need to stay ahead</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Built for founders, marketers, and product teams who need real-time competitive intelligence.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group relative rounded-2xl border border-indigo-500/10 bg-background/50 p-8 hover:border-indigo-500/30 transition-colors glass">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
                  <Eye className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Visual Tracking</h3>
                <p className="text-muted-foreground leading-relaxed">We crawl competitor pages and detect precise changes to text, layout, and structure.</p>
              </div>

              <div className="group relative rounded-2xl border border-indigo-500/10 bg-background/50 p-8 hover:border-indigo-500/30 transition-colors glass">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Summaries</h3>
                <p className="text-muted-foreground leading-relaxed">Don't sift through HTML diffs. Our AI explains exactly what changed in plain English.</p>
              </div>

              <div className="group relative rounded-2xl border border-indigo-500/10 bg-background/50 p-8 hover:border-indigo-500/30 transition-colors glass">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Alerts</h3>
                <p className="text-muted-foreground leading-relaxed">Get immediate emails for major changes, or daily digests to keep your inbox clean.</p>
              </div>
            </div>
          </div>
        </section>
        {/* Pricing Section Preview */}
        <section className="w-full py-20 md:py-32 border-t border-indigo-500/10 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="container px-4 md:px-6 relative z-10 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-heading font-bold">Simple pricing for any scale</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Start tracking for free, then upgrade as your monitoring needs grow.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Free Plan */}
              <div className="rounded-2xl border border-indigo-500/10 bg-background/50 p-6 flex flex-col justify-between glass">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Free Plan</h3>
                  <div className="flex items-baseline text-white">
                    <span className="text-4xl font-extrabold font-mono">$0</span>
                    <span className="text-xs text-muted-foreground ml-1">/mo</span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">✓ Track up to 3 URLs</li>
                    <li className="flex items-center gap-2">✓ 10 AI summaries / mo</li>
                    <li className="flex items-center gap-2">✓ Daily check frequency</li>
                  </ul>
                </div>
                <Button asChild variant="outline" className="mt-6 border-indigo-500/20 text-white hover:bg-slate-900">
                  <Link href="/sign-up">Get Started Free</Link>
                </Button>
              </div>

              {/* Starter Plan */}
              <div className="rounded-2xl border border-indigo-500 bg-slate-950/60 p-6 flex flex-col justify-between relative shadow-lg shadow-indigo-500/5">
                <span className="absolute -top-3 right-4 bg-indigo-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Recommended
                </span>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Starter Plan</h3>
                  <div className="flex items-baseline text-white">
                    <span className="text-4xl font-extrabold font-mono">$19</span>
                    <span className="text-xs text-muted-foreground ml-1">/mo</span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">✓ Track up to 25 URLs</li>
                    <li className="flex items-center gap-2">✓ 200 AI summaries / mo</li>
                    <li className="flex items-center gap-2">✓ 6-hour check frequency</li>
                    <li className="flex items-center gap-2">✓ Slack & Webhook integrations</li>
                  </ul>
                </div>
                <Button asChild className="mt-6 bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25">
                  <Link href="/sign-up?plan=starter">Upgrade to Starter <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>

            <div className="text-center">
              <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm inline-flex items-center gap-1 group">
                View all plans and features
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-indigo-500/10 py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {BRANDING.name}. All rights reserved.
            </p>
            <nav className="flex gap-4 sm:gap-6">
              <Link className="text-sm hover:underline underline-offset-4 text-muted-foreground hover:text-foreground" href="/terms">
                Terms
              </Link>
              <Link className="text-sm hover:underline underline-offset-4 text-muted-foreground hover:text-foreground" href="/privacy">
                Privacy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
