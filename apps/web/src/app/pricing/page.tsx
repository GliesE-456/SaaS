import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | Competitor Change Tracker',
  description: 'Choose the perfect plan to track competitor changes with real-time crawlers and AI summaries.',
};

const PLANS_DATA = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for side projects and testing the waters.',
    cta: 'Start for Free',
    href: '/sign-up',
    features: [
      'Track up to 3 URLs',
      '10 AI summaries per month',
      'Daily crawls',
      '7 days history retention',
      'Email notifications',
    ],
    highlight: false,
  },
  {
    name: 'Starter',
    price: '$19',
    description: 'Great for founders and growing indie startups.',
    cta: 'Get Started',
    href: '/sign-up?plan=starter',
    features: [
      'Track up to 25 URLs',
      '200 AI summaries per month',
      'Daily & 6-hour crawl frequencies',
      '30 days history retention',
      'Slack & Webhook alerts',
      'Priority crawling queue',
    ],
    highlight: true,
  },
  {
    name: 'Growth',
    price: '$49',
    description: 'Designed for professional product & marketing teams.',
    cta: 'Upgrade to Growth',
    href: '/sign-up?plan=growth',
    features: [
      'Track up to 100 URLs',
      'Unlimited AI summaries',
      'Hourly, 6-hour & daily crawls',
      '90 days history retention',
      'Slack, Webhook, and API access',
      'CSV data exports',
      'Up to 3 team members',
    ],
    highlight: false,
  },
  {
    name: 'Agency',
    price: '$199',
    description: 'For agencies and large scale tracking requirements.',
    cta: 'Contact Sales',
    href: '/sign-up?plan=agency',
    features: [
      'Track up to 500 URLs',
      'Unlimited AI summaries',
      'Hourly crawls & priority support',
      '365 days history retention',
      'Full API & custom webhooks',
      'CSV data exports',
      'Up to 10 team members & 10 workspaces',
    ],
    highlight: false,
  },
];

export default function PricingPage() {
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
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </nav>
      </header>

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

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {PLANS_DATA.map((plan) => (
              <div 
                key={plan.name} 
                className={`rounded-2xl border bg-slate-950/40 p-6 flex flex-col justify-between relative backdrop-blur-md shadow-xl transition-all hover:border-indigo-500/40 ${
                  plan.highlight 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10' 
                    : 'border-indigo-500/10'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 min-h-[32px]">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold font-mono text-white">{plan.price}</span>
                    <span className="text-xs text-muted-foreground ml-1">/month</span>
                  </div>

                  <hr className="border-indigo-500/10" />

                  <ul className="space-y-3 text-xs text-slate-300">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Button 
                    asChild 
                    className={`w-full h-10 ${
                      plan.highlight 
                        ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                        : 'bg-slate-900 hover:bg-slate-850 text-white border border-indigo-500/10'
                    }`}
                  >
                    <Link href={plan.href}>
                      {plan.cta}
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Secure / Payment Trust Badges */}
          <div className="border border-indigo-500/10 rounded-2xl bg-slate-950/20 p-6 flex flex-col sm:flex-row items-center justify-around gap-6 text-center sm:text-left max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-indigo-400" />
              <div>
                <h4 className="font-bold text-sm text-white">SSL Encrypted Checkout</h4>
                <p className="text-xs text-muted-foreground">All transactions are secured by Stripe.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-indigo-400" />
              <div>
                <h4 className="font-bold text-sm text-white">Instant Activation</h4>
                <p className="text-xs text-muted-foreground">Get access to your plan limits immediately.</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-500/10 py-12">
        <div className="container px-4 mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Competitor Change Tracker. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground hover:text-foreground" href="/terms">
              Terms
            </Link>
            <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground hover:text-foreground" href="/privacy">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
