import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye, Zap, Target, Radar, CheckCircle2, ShieldCheck, ChevronDown, MessageCircle } from 'lucide-react';
import { BRANDING } from '@cct/db';
import { LandingInteractiveDemo } from '@/components/landing/LandingInteractiveDemo';
import { PublicHeader } from '@/components/layout/PublicHeader';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

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
              
              {/* Trust Signal Above the Fold */}
              <div className="flex items-center gap-4 text-sm font-medium text-slate-300 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800 backdrop-blur-sm">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-6 w-6 rounded-full bg-indigo-900 border-2 border-background flex items-center justify-center text-[10px] font-bold text-indigo-300">
                      U{i}
                    </div>
                  ))}
                </div>
                <span>Join 340+ founders staying ahead of their competition</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 drop-shadow-sm max-w-4xl leading-tight">
                Stop checking competitor sites <span className="text-indigo-400">manually</span>.
              </h1>
              <p className="mx-auto max-w-[700px] text-lg md:text-xl text-muted-foreground leading-relaxed">
                OutScout watches your competitors 24/7 and tells you exactly what changed. Know about their pricing drops and feature launches before their customers do.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button size="lg" className="h-12 px-8 text-base bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all hover:scale-105 animate-in fade-in zoom-in-95 duration-500" asChild>
                  <Link href="/sign-up">Start Tracking for Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-indigo-500/30 hover:border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 transition-all hover:scale-105" asChild>
                  <Link href="/demo-dashboard/overview">See Live Demo</Link>
                </Button>
              </div>
            </div>

            {/* Interactive Demo Sandbox Widget */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 mt-16 max-w-5xl mx-auto">
              <div className="text-center mb-6 space-y-2">
                <h3 className="text-2xl font-bold font-heading">Try it yourself &mdash; no account needed</h3>
                <p className="text-muted-foreground">This is our actual engine. See how OutScout breaks down a page change.</p>
              </div>
              <div className="border border-indigo-500/20 rounded-2xl shadow-2xl overflow-hidden bg-slate-950/50 backdrop-blur-sm">
                <LandingInteractiveDemo />
              </div>
              <div className="text-center mt-6">
                <Button variant="ghost" className="text-indigo-400 hover:text-indigo-300" asChild>
                  <Link href="/sign-up">Run this on your real competitors <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid Section */}
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
        <section className="w-full py-20 md:py-32 border-t border-indigo-500/10 relative overflow-hidden bg-slate-950">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="container px-4 md:px-6 relative z-10 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-heading font-bold">Simple pricing for any scale</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Start tracking for free, then upgrade as your monitoring needs grow.
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Free Plan */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Free</h3>
                  <div className="flex items-baseline text-white">
                    <span className="text-3xl font-extrabold font-mono">$0</span>
                    <span className="text-xs text-muted-foreground ml-1">/mo</span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-slate-500" /> 3 URLs</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-slate-500" /> 10 AI summaries/mo</li>
                  </ul>
                </div>
                <Button asChild variant="outline" className="mt-6 border-slate-700 text-white hover:bg-slate-800">
                  <Link href="/sign-up">Start Free</Link>
                </Button>
              </div>

              {/* Starter Plan */}
              <div className="rounded-2xl border border-indigo-500 bg-slate-900 p-6 flex flex-col justify-between relative shadow-lg shadow-indigo-500/10">
                <span className="absolute -top-3 right-4 bg-indigo-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Popular
                </span>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Starter</h3>
                  <div className="flex items-baseline text-white">
                    <span className="text-3xl font-extrabold font-mono">$19</span>
                    <span className="text-xs text-muted-foreground ml-1">/mo</span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> 25 URLs</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> 200 AI summaries</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> 6-hour checks</li>
                  </ul>
                </div>
                <Button asChild className="mt-6 bg-indigo-500 hover:bg-indigo-600 text-white">
                  <Link href="/sign-up?plan=starter">Get Starter</Link>
                </Button>
              </div>

              {/* Growth Plan */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Growth</h3>
                  <div className="flex items-baseline text-white">
                    <span className="text-3xl font-extrabold font-mono">$49</span>
                    <span className="text-xs text-muted-foreground ml-1">/mo</span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-slate-500" /> 100 URLs</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-slate-500" /> Unlimited AI summaries</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-slate-500" /> Hourly checks</li>
                  </ul>
                </div>
                <Button asChild variant="outline" className="mt-6 border-slate-700 text-white hover:bg-slate-800">
                  <Link href="/sign-up?plan=growth">Get Growth</Link>
                </Button>
              </div>

              {/* Agency Plan */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Agency</h3>
                  <div className="flex items-baseline text-white">
                    <span className="text-3xl font-extrabold font-mono">$199</span>
                    <span className="text-xs text-muted-foreground ml-1">/mo</span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-slate-500" /> 500 URLs</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-slate-500" /> 10 team members</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-slate-500" /> API Access</li>
                  </ul>
                </div>
                <Button asChild variant="outline" className="mt-6 border-slate-700 text-white hover:bg-slate-800">
                  <a href={`mailto:${BRANDING.supportEmail}`}>Contact Sales</a>
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
               <ShieldCheck className="h-4 w-4 text-indigo-400" />
               Includes a 7-day no-questions-asked money-back guarantee.
            </div>

            <div className="text-center">
              <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm inline-flex items-center gap-1 group border border-indigo-500/20 rounded-full px-4 py-2 bg-indigo-500/10">
                Compare all features and annual discounts
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-20 bg-background border-t border-indigo-500/10">
           <div className="container px-4 md:px-6 max-w-4xl mx-auto">
             <div className="text-center mb-12">
               <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Frequently Asked Questions</h2>
               <p className="text-muted-foreground">Everything you need to know about the product and billing.</p>
             </div>

             <Accordion type="single" collapsible className="w-full text-left">
               <AccordionItem value="item-1">
                 <AccordionTrigger className="text-left font-semibold">Does it work on JavaScript/SPA websites?</AccordionTrigger>
                 <AccordionContent className="text-slate-400 leading-relaxed">
                   Yes. OutScout runs a full headless browser (Puppeteer/Playwright) to render the page exactly as a human sees it, executing all JavaScript before taking a snapshot and extracting the DOM. This means we can track Next.js, React, Vue, and Angular sites perfectly.
                 </AccordionContent>
               </AccordionItem>
               <AccordionItem value="item-2">
                 <AccordionTrigger className="text-left font-semibold">What if a competitor blocks crawlers?</AccordionTrigger>
                 <AccordionContent className="text-slate-400 leading-relaxed">
                   We utilize rotating residential proxies and sophisticated browser fingerprinting evasion to ensure reliable access to public pages. If a page is entirely locked behind a login, we cannot track it, but public marketing and pricing pages are tracked with 99.9% uptime.
                 </AccordionContent>
               </AccordionItem>
               <AccordionItem value="item-3">
                 <AccordionTrigger className="text-left font-semibold">Can I export my data?</AccordionTrigger>
                 <AccordionContent className="text-slate-400 leading-relaxed">
                   Yes. Growth and Agency tier customers can export all historical change logs, raw text diffs, and AI summaries to CSV formats at any time. We believe your competitive intelligence data belongs to you.
                 </AccordionContent>
               </AccordionItem>
               <AccordionItem value="item-4">
                 <AccordionTrigger className="text-left font-semibold">What happens when I cancel?</AccordionTrigger>
                 <AccordionContent className="text-slate-400 leading-relaxed">
                   When you cancel your subscription, your account remains active until the end of your current billing cycle. After that, your account will drop to the Free tier, and any tracked URLs over the 3-URL limit will be paused. You can restart them anytime by upgrading.
                 </AccordionContent>
               </AccordionItem>
               <AccordionItem value="item-5">
                 <AccordionTrigger className="text-left font-semibold">Are the URLs I track private?</AccordionTrigger>
                 <AccordionContent className="text-slate-400 leading-relaxed">
                   Absolutely. Your tracked URLs are completely isolated to your workspace. We never share, sell, or aggregate which companies are tracking which competitors. Your competitive strategy remains your secret.
                 </AccordionContent>
               </AccordionItem>
               <AccordionItem value="item-6">
                 <AccordionTrigger className="text-left font-semibold">Do you offer API access?</AccordionTrigger>
                 <AccordionContent className="text-slate-400 leading-relaxed">
                   Yes, API access is available on our Growth and Agency plans. You can programmatically add URLs, retrieve change events, and pipe AI summaries directly into your own internal dashboards or CRMs.
                 </AccordionContent>
               </AccordionItem>
               <AccordionItem value="item-7">
                 <AccordionTrigger className="text-left font-semibold">How reliable are the AI summaries?</AccordionTrigger>
                 <AccordionContent className="text-slate-400 leading-relaxed">
                   We use state-of-the-art LLMs (like GPT-4o) trained specifically on HTML diffs. The AI strips out boilerplate code changes and focuses only on human-readable text, pricing numbers, and feature lists, resulting in highly accurate business summaries without technical noise.
                 </AccordionContent>
               </AccordionItem>
               <AccordionItem value="item-8">
                 <AccordionTrigger className="text-left font-semibold">What if I need a custom enterprise setup?</AccordionTrigger>
                 <AccordionContent className="text-slate-400 leading-relaxed">
                   If you need to track thousands of URLs, require custom SSO, or need a dedicated crawling cluster, please reach out to our sales team for a custom Enterprise contract.
                 </AccordionContent>
               </AccordionItem>
             </Accordion>
           </div>
        </section>
      </main>

      <footer className="border-t border-indigo-500/10 py-12 md:py-16 bg-slate-950">
        <div className="container px-4 md:px-6">
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
