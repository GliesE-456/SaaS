import Link from 'next/link';
import { Metadata } from 'next';
import { BRANDING } from '@cct/db';
import { Radar } from 'lucide-react';

export const metadata: Metadata = {
  title: `Privacy Policy | ${BRANDING.name}`,
  description: `Privacy Policy for ${BRANDING.name}.`,
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-white">
      {/* Header */}
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
        </nav>
      </header>

      <main className="flex-1 py-16 px-4 md:px-6 relative overflow-hidden">
        <div className="container mx-auto max-w-3xl space-y-8 bg-slate-950/40 p-8 rounded-2xl border border-indigo-500/10 backdrop-blur-md">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated: June 19, 2026</p>
          
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
                We use the information collected to run crawling operations, compute visual differences, generate AI summaries of edits, send email notifications, process subscription payments via Stripe, and improve overall service functionality.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">3. Third Party Disclosures</h2>
              <p>
                We do not sell your personal data. We utilize third-party vendors (Stripe for payment processing, Resend for transactional email dispatch, OpenAI for AI summaries, and database/storage providers) to host and operate the platform securely.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">4. Cookies and Tracking</h2>
              <p>
                We use cookies to maintain user sessions and authorize requests. You can disable cookies in your browser settings, but it will prevent you from logging in and utilizing dashboard features.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-indigo-500/10 py-12">
        <div className="container px-4 mx-auto max-w-3xl flex justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {BRANDING.name}. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
