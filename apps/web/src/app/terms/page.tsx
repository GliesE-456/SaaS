import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Competitor Change Tracker',
  description: 'Terms of Service for Competitor Change Tracker.',
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-white">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b border-indigo-500/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Link className="flex items-center justify-center font-heading font-bold text-lg text-primary tracking-tight" href="/">
          Competitor Change Tracker
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors flex items-center" href="/pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors flex items-center" href="/sign-in">
            Log in
          </Link>
        </nav>
      </header>

      <main className="flex-1 py-16 px-4 md:px-6 relative overflow-hidden">
        <div className="container mx-auto max-w-3xl space-y-8 bg-slate-950/40 p-8 rounded-2xl border border-indigo-500/10 backdrop-blur-md">
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-xs text-muted-foreground">Last updated: June 19, 2026</p>
          
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Competitor Change Tracker ("Service"), you agree to be bound by these Terms of Service. If you do not agree, you must immediately stop using the Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">2. Description of Service</h2>
              <p>
                Competitor Change Tracker provides website monitoring, visual diff analysis, and notification alerts regarding updates made to public webpages.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">3. Crawling Compliance</h2>
              <p>
                Our Service respects robots.txt directives by default. By explicitly opting to override robots.txt for a specific URL, you represent and warrant that you have explicit, authorized consent from the target website owner to scrape and inspect their domain, or that such scraping is permissible under applicable local regulations.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">4. Fair Usage & Plan Limits</h2>
              <p>
                You agree not to abuse the Service by registering multiple accounts to bypass plan limits. The Service reserves the right to suspend accounts that engage in malicious traffic generation or seek to compromise the stability of our distributed crawling fleet.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">5. Limitation of Liability</h2>
              <p>
                The Service is provided "as is". In no event shall we be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the Service.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-indigo-500/10 py-12">
        <div className="container px-4 mx-auto max-w-3xl flex justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Competitor Change Tracker. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
