import Link from 'next/link';
import { ShieldCheck, Zap, RotateCcw } from 'lucide-react';
import { Metadata } from 'next';
import { BRANDING } from '@cct/db';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PricingTiers } from '@/components/pricing/PricingTiers';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: `Pricing | ${BRANDING.name}`,
  description: 'Simple, transparent pricing for competitor tracking. Choose a plan that suits your competitive intelligence needs. Cancel anytime.',
};

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-white">
      <PublicHeader />

      <main className="flex-1 py-16 md:py-24 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="container px-4 mx-auto max-w-6xl space-y-12">
          
          {/* Header Title */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Simple, Transparent <span className="text-indigo-400">Pricing</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              No hidden fees. Choose a plan that suits your competitive intelligence needs. Cancel or change plans at any time.
            </p>
          </div>

          <PricingTiers />

          {/* Secure / Payment Trust Badges */}
          <div className="border border-indigo-500/10 rounded-2xl bg-slate-950/20 p-6 flex flex-col md:flex-row items-center justify-around gap-6 text-center md:text-left max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-indigo-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-white">SSL Encrypted Checkout</h4>
                <p className="text-xs text-muted-foreground">All transactions are fully secured.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-8 w-8 text-indigo-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-white">7-Day Refund Guarantee</h4>
                <p className="text-xs text-muted-foreground">100% risk-free. No questions asked.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-indigo-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-white">Instant Activation</h4>
                <p className="text-xs text-muted-foreground">Get access to your plan limits immediately.</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mt-16 space-y-8 border-t border-indigo-500/10 pt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-heading font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Everything you need to know about billing and features.</p>
            </div>

            <Accordion type="single" collapsible className="w-full text-left">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left font-semibold">How does cancellation work?</AccordionTrigger>
                <AccordionContent className="text-slate-400 leading-relaxed">
                  You can cancel your subscription at any time with a single click from your Billing Settings page. Once canceled, your billing stops immediately. Your paid plan limits and features will remain fully active until the end of your current billing cycle.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left font-semibold">What is the money-back guarantee?</AccordionTrigger>
                <AccordionContent className="text-slate-400 leading-relaxed">
                  If you upgrade to any paid plan and decide it's not the right fit for your team within the first 7 days, just contact our support team at <a href={`mailto:${BRANDING.supportEmail}`} className="text-indigo-400 hover:underline">{BRANDING.supportEmail}</a>. We will refund your payment in full, no questions asked.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left font-semibold">Does it work on JavaScript/SPA websites?</AccordionTrigger>
                <AccordionContent className="text-slate-400 leading-relaxed">
                  Yes. OutScout runs a full headless browser (Puppeteer/Playwright) to render the page exactly as a human sees it, executing all JavaScript before taking a snapshot and extracting the DOM. This means we can track Next.js, React, Vue, and Angular sites perfectly.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left font-semibold">Can I export my data?</AccordionTrigger>
                <AccordionContent className="text-slate-400 leading-relaxed">
                  Yes. Growth and Agency tier customers can export all historical change logs, raw text diffs, and AI summaries to CSV formats at any time. We believe your competitive intelligence data belongs to you.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

        </div>
      </main>

      {/* Footer */}
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
