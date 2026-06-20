import Link from 'next/link';
import { Metadata } from 'next';
import { BRANDING } from '@cct/db';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Badge } from '@/components/ui/badge';
import { Calendar, Rocket, Sparkles, Wrench } from 'lucide-react';

export const metadata: Metadata = {
  title: `Changelog | ${BRANDING.name}`,
  description: 'See the latest updates, features, and improvements to our competitive intelligence platform.',
};

const LOGS = [
  {
    date: 'June 18, 2026',
    title: 'AI Summaries 2.0 & Slack Integration',
    type: 'feature',
    content: 'We completely overhauled our AI summary generation using the latest LLM models. Summaries are now 40% more concise and filter out noise from cookie banners and generic footer changes. Plus, you can now pipe these summaries directly into your Slack channels!',
    icon: Sparkles,
  },
  {
    date: 'June 5, 2026',
    title: 'Advanced Visual Diffing',
    type: 'improvement',
    content: 'Our visual diff engine has been upgraded. We now properly handle sticky headers and lazy-loaded images, resulting in fewer false-positive change alerts on modern SPA applications.',
    icon: Rocket,
  },
  {
    date: 'May 20, 2026',
    title: 'Hourly Crawling & Custom Intervals',
    type: 'feature',
    content: 'Growth and Agency users can now track URLs on an hourly basis. We also added support for customizing crawl times (e.g., checking every Tuesday at 9 AM).',
    icon: Calendar,
  },
  {
    date: 'May 10, 2026',
    title: 'Dashboard Performance Boost',
    type: 'fix',
    content: 'Fixed an issue where the activity feed would load slowly for workspaces tracking more than 50 URLs. Load times are now 3x faster across the board.',
    icon: Wrench,
  },
];

export default function ChangelogPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-white">
      <PublicHeader />

      <main className="flex-1 py-16 md:py-24 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="container px-4 mx-auto max-w-3xl space-y-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Changelog
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              New updates and improvements to {BRANDING.name}.
            </p>
          </div>

          <div className="space-y-12">
            {LOGS.map((log, idx) => (
              <div key={idx} className="relative pl-8 md:pl-0">
                {/* Desktop Timeline Line */}
                <div className="hidden md:block absolute top-0 bottom-0 left-[160px] w-px bg-indigo-500/20" />
                
                <div className="flex flex-col md:flex-row gap-4 md:gap-12 relative">
                  <div className="md:w-[140px] shrink-0 pt-1 text-left md:text-right">
                    <span className="text-sm font-medium text-slate-400">{log.date}</span>
                  </div>
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-[-32px] md:left-[156px] top-1.5 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-background" />

                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl flex-1 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <log.icon className="h-4 w-4" />
                      </div>
                      <Badge variant={
                        log.type === 'feature' ? 'default' : 
                        log.type === 'fix' ? 'destructive' : 'secondary'
                      } className={log.type === 'feature' ? 'bg-indigo-500' : ''}>
                        {log.type}
                      </Badge>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white">{log.title}</h3>
                    <p className="text-slate-300 leading-relaxed">
                      {log.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border border-indigo-500/20 rounded-2xl bg-indigo-500/5 p-8 text-center mt-20">
            <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
            <p className="text-slate-400 mb-6">Here's what we're working on next</p>
            <div className="grid sm:grid-cols-3 gap-4 text-sm text-left">
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <div className="font-semibold text-white mb-1">Competitor Dashboards</div>
                <div className="text-slate-400">Group URLs by company for aggregate analytics.</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <div className="font-semibold text-white mb-1">Zapier Integration</div>
                <div className="text-slate-400">Connect OutScout to 5000+ apps without writing code.</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                <div className="font-semibold text-white mb-1">Mobile App</div>
                <div className="text-slate-400">Review competitor changes on the go with native push alerts.</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-indigo-500/10 py-12 bg-slate-950">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} {BRANDING.name}. All rights reserved.
              </p>
              <p className="text-xs text-slate-500 mt-1">Built with ❤️ by a solo founder.</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
              <a href={`mailto:${BRANDING.supportEmail}`} className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                {BRANDING.supportEmail}
              </a>
              <a href="https://twitter.com/outscout_app" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors" target="_blank" rel="noreferrer">
                @outscout_app
              </a>
              <nav className="flex gap-4 sm:gap-6 border-l border-slate-800 pl-6">
                <Link className="text-sm hover:underline underline-offset-4 text-muted-foreground hover:text-foreground" href="/terms">
                  Terms
                </Link>
                <Link className="text-sm hover:underline underline-offset-4 text-muted-foreground hover:text-foreground" href="/privacy">
                  Privacy
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
