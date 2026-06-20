import Link from 'next/link';
import { Metadata } from 'next';
import { BRANDING } from '@cct/db';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Button } from '@/components/ui/button';
import { Radar, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: `About | ${BRANDING.name}`,
  description: 'The story behind OutScout and our mission to automate competitive intelligence.',
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-white">
      <PublicHeader />

      <main className="flex-1 py-16 md:py-24 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="container px-4 mx-auto max-w-3xl space-y-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20 shadow-xl shadow-indigo-500/10">
              <Radar className="h-8 w-8 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              About OutScout
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Our mission is to give product and marketing teams an unfair advantage through automated competitive intelligence.
            </p>
          </div>

          <div className="space-y-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 md:p-12 text-slate-300 leading-relaxed shadow-xl backdrop-blur-sm">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">The Origin Story</h2>
              <p>
                In early 2024, I was running marketing for a fast-growing B2B startup. One Friday afternoon, our sales team lost three major deals in a row. The reason? Our biggest competitor had quietly dropped their pricing by 30% on Tuesday, and we had no idea.
              </p>
              <p>
                I realized I was spending 3 to 4 hours every week manually opening a dozen competitor websites, taking screenshots, and trying to spot what had changed in their pricing, feature lists, and positioning. It was tedious, error-prone, and soul-crushing work.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Building a Better Way</h2>
              <p>
                There were existing website monitoring tools, but they were built for developers tracking server uptime, not marketers tracking copy changes. They would alert me every time a dynamic timestamp changed or a cookie banner was added. The noise was unbearable.
              </p>
              <p>
                I built OutScout to solve this exact problem. By combining headless browser rendering with modern LLMs (Large Language Models), OutScout doesn't just tell you that HTML changed—it tells you <em>what it means for your business</em>. 
              </p>
              <p className="pl-4 border-l-2 border-indigo-500/50 text-slate-400 italic">
                Instead of "div#pricing changed from $49 to $29", OutScout tells you "Competitor X dropped the price of their Pro plan by $20 and added API access."
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Contact Us</h2>
              <p>
                OutScout is proudly built by a solo founder. When you reach out to support, you're talking directly to the person who writes the code.
              </p>
              <div className="flex gap-4 pt-4">
                <Button asChild className="bg-indigo-500 hover:bg-indigo-600 text-white">
                  <a href={`mailto:${BRANDING.supportEmail}`}>Email Founder</a>
                </Button>
                <Button asChild variant="outline" className="border-slate-700 text-white hover:bg-slate-800">
                  <a href="https://twitter.com/outscout_app" target="_blank" rel="noreferrer">
                    Follow on X <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
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
