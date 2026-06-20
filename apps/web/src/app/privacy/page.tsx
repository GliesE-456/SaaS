import Link from 'next/link';
import { Metadata } from 'next';
import { BRANDING } from '@cct/db';
import { PublicHeader } from '@/components/layout/PublicHeader';

export const metadata: Metadata = {
  title: `Privacy Policy | ${BRANDING.name}`,
  description: `Privacy Policy for ${BRANDING.name}.`,
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-white">
      <PublicHeader />

      <main className="flex-1 py-16 px-4 md:px-6 relative overflow-hidden">
        <div className="container mx-auto max-w-3xl space-y-8 bg-slate-950/40 p-8 rounded-2xl border border-indigo-500/10 backdrop-blur-md">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated: June 20, 2026</p>
          
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">1. Information We Collect</h2>
              <p>
                We collect personal information that you provide to us, such as email address, account passwords, and billing details. We also collect the competitor URLs that you register in order to perform checking tasks on your behalf.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">2. How We Use Information</h2>
              <p>
                We use the information collected to run crawling operations, compute visual differences, generate AI summaries of edits, send email notifications, process subscription payments, and improve overall service functionality.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">3. Third Party Disclosures</h2>
              <p>
                We do not sell your personal data. We utilize third-party vendors to host and operate the platform securely, including:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Payment processors for secure checkout</li>
                <li>Transactional email providers for notifications</li>
                <li>AI processing partners for generating summaries</li>
                <li>Cloud infrastructure and database providers for secure data storage</li>
              </ul>
              <p className="pt-2">
                These providers have access to your personal information only to perform these specific tasks on our behalf and are obligated not to disclose or use it for any other purpose.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">4. Cookies and Tracking</h2>
              <p>
                We use cookies to maintain user sessions and authorize requests. You can disable cookies in your browser settings, but it will prevent you from logging in and utilizing dashboard features. We also use analytics tools to help us understand how users engage with our platform, which helps us improve the product.
              </p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">5. Data Retention & Account Deletion</h2>
              <p>
                We retain your personal information and monitored data only for as long as is necessary for the purposes set out in this Privacy Policy. You can delete your account and all associated data at any time through the dashboard settings. Upon account deletion, all active monitoring stops immediately, and your associated historical data is permanently deleted from our primary servers within 30 days.
              </p>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">6. GDPR and User Rights</h2>
              <p>
                If you are a resident of the European Economic Area (EEA), you have certain data protection rights under the General Data Protection Regulation (GDPR). We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.
              </p>
              <p>Your rights include:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>The right to access, update or delete the information we have on you.</li>
                <li>The right of rectification.</li>
                <li>The right to object.</li>
                <li>The right of restriction.</li>
                <li>The right to data portability.</li>
                <li>The right to withdraw consent.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">7. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at <a href={`mailto:${BRANDING.supportEmail}`} className="text-indigo-400 hover:underline">{BRANDING.supportEmail}</a>.
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
