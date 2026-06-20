import Link from 'next/link';
import { Metadata } from 'next';
import { BRANDING } from '@cct/db';
import { PublicHeader } from '@/components/layout/PublicHeader';

export const metadata: Metadata = {
  title: `Terms of Service | ${BRANDING.name}`,
  description: `Terms of Service for ${BRANDING.name}.`,
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-white">
      <PublicHeader />

      <main className="flex-1 py-16 px-4 md:px-6 relative overflow-hidden">
        <div className="container mx-auto max-w-3xl space-y-8 bg-slate-950/40 p-8 rounded-2xl border border-indigo-500/10 backdrop-blur-md">
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-xs text-muted-foreground">Last updated: June 20, 2026</p>
          
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">1. Acceptance of Terms</h2>
              <p>
                By accessing or using {BRANDING.name} ("Service"), you agree to be bound by these Terms of Service. If you do not agree, you must immediately stop using the Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">2. Description of Service</h2>
              <p>
                {BRANDING.name} provides website monitoring, visual diff analysis, and notification alerts regarding updates made to public webpages.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">3. Crawling Compliance & Consent</h2>
              <p>
                Our Service respects robots.txt directives by default. By explicitly opting to override robots.txt for a specific URL, you represent and warrant that you have explicit, authorized consent from the target website owner to scrape and inspect their domain, or that such scraping is permissible under applicable local regulations. {BRANDING.name} logs all manual overrides for compliance purposes.
              </p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">4. Payment, Refunds, and Cancellation</h2>
              <p>
                <strong>Subscriptions:</strong> Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis (monthly or annually).
              </p>
              <p>
                <strong>Cancellation:</strong> You can cancel your subscription at any time. When you cancel, you will continue to have access to the paid features until the end of your current billing cycle.
              </p>
              <p>
                <strong>7-Day Money-Back Guarantee:</strong> We offer a full 7-day money-back guarantee for all new paid subscriptions. If you are unsatisfied for any reason within the first 7 days, contact us at {BRANDING.supportEmail} and we will refund your payment in full.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">5. Fair Usage & Plan Limits</h2>
              <p>
                You agree not to abuse the Service by registering multiple accounts to bypass plan limits. The Service reserves the right to suspend accounts that engage in malicious traffic generation, exceed reasonable API limits, or seek to compromise the stability of our distributed crawling fleet.
              </p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">6. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are and will remain the exclusive property of {BRANDING.name} and its licensors. You retain all rights to the data you provide or configure within the service. We do not claim ownership over the URLs you track or the specific insights generated for you.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">7. Limitation of Liability</h2>
              <p>
                The Service is provided "as is" and "as available". In no event shall we be liable for any direct, indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">8. Account Termination</h2>
              <p>
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-indigo-500/10 py-12">
        <div className="container px-4 mx-auto max-w-3xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {BRANDING.name}. All rights reserved. Built with ❤️ by a solo founder.</p>
          <div className="flex items-center gap-6">
            <a href={`mailto:${BRANDING.supportEmail}`} className="hover:text-indigo-400 transition-colors">
              {BRANDING.supportEmail}
            </a>
            <a href="https://twitter.com/outscout_app" className="hover:text-indigo-400 transition-colors" target="_blank" rel="noreferrer">
              @outscout_app
            </a>
            <nav className="flex gap-4 border-l border-indigo-500/20 pl-6 ml-2">
              <Link href="/terms" className="hover:underline hover:text-white">Terms</Link>
              <Link href="/privacy" className="hover:underline hover:text-white">Privacy</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
