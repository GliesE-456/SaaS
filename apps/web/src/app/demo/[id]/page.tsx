import { db } from '@cct/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check, Zap, Shield, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

const DEFAULT_COMPETITORS: Record<string, {
  name: string;
  pricing: string;
  description: string;
  features: string;
  ctaText: string;
}> = {
  'competitor-alpha': {
    name: 'Alpha Cloud',
    pricing: '$29/month',
    description: 'The premier cloud platform for modern software development. Scale your infrastructure effortlessly with our distributed network.',
    features: 'Unlimited Projects\n24/7 Priority Support\nAdvanced Analytics Dashboard\n100GB High-speed Storage\nGlobal Edge CDN',
    ctaText: 'Start Free Trial',
  },
  'competitor-beta': {
    name: 'BetaFlow Automation',
    pricing: '$49/month',
    description: 'BetaFlow is the ultimate workflow automation tool for growing teams. Streamline your tasks and sync your tools seamlessly.',
    features: '10 Active Workflows\nSlack & Webhook Integrations\nBasic Reports & Exporting\nStandard Email Support\nDaily Automated Syncs',
    ctaText: 'Get Started Now',
  },
  'competitor-gamma': {
    name: 'Gamma Security',
    pricing: '$199/month',
    description: 'Gamma Security offers next-generation enterprise cybersecurity, threat monitoring, and zero-trust remote access solutions.',
    features: 'Enterprise SSO & SAML\nCustom Firewalls & WAF\nDedicated Support Engineer\nAudit Logs & SOC2 Compliance\n24/7 Threat Hunting',
    ctaText: 'Contact Sales',
  },
};

export default async function CompetitorDemoPage({ params }: PageProps) {
  const { id } = await params;

  if (!DEFAULT_COMPETITORS[id]) {
    notFound();
  }

  // JIT-seed database record if not existing
  let competitor = await db.demoCompetitor.findUnique({
    where: { id },
  });

  if (!competitor) {
    const defaults = DEFAULT_COMPETITORS[id];
    competitor = await db.demoCompetitor.create({
      data: {
        id,
        name: defaults.name,
        pricing: defaults.pricing,
        description: defaults.description,
        features: defaults.features,
        ctaText: defaults.ctaText,
      },
    });
  }

  const featuresList = competitor.features
    .split('\n')
    .map((f: any) => f.trim())
    .filter((f: any) => f.length > 0);

  // Styling helpers
  const isAlpha = id === 'competitor-alpha';
  const isBeta = id === 'competitor-beta';

  const themeGradient = isAlpha
    ? 'from-blue-500 via-indigo-500 to-purple-600'
    : isBeta
    ? 'from-emerald-500 via-teal-500 to-cyan-600'
    : 'from-orange-500 via-red-500 to-pink-600';

  const borderGlow = isAlpha
    ? 'hover:shadow-blue-500/10'
    : isBeta
    ? 'hover:shadow-emerald-500/10'
    : 'hover:shadow-rose-500/10';

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F3F4F6] relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/15 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[120px]" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-gray-800/80 bg-[#0B0F19]/80 backdrop-blur-md relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isAlpha && <Zap className="w-6 h-6 text-indigo-400" />}
            {isBeta && <Sparkles className="w-6 h-6 text-emerald-400" />}
            {!isAlpha && !isBeta && <Shield className="w-6 h-6 text-rose-400" />}
            <span className="font-heading font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {competitor.name}
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
            <a
              href="#pricing"
              className="text-xs font-semibold px-4 py-2 rounded-full border border-gray-700 hover:border-gray-500 transition-all"
            >
              Log In
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-gray-800 bg-gray-900/50 text-xs text-gray-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Demo Page Active</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-heading font-black tracking-tight leading-[1.1]">
            Build the Future with{' '}
            <span className={`bg-gradient-to-r ${themeGradient} bg-clip-text text-transparent`}>
              {competitor.name}
            </span>
          </h1>

          <p className="text-lg text-gray-400 leading-relaxed pt-2">
            {competitor.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#pricing"
              className={`w-full sm:w-auto px-8 py-3.5 rounded-lg bg-gradient-to-r ${themeGradient} text-white font-medium hover:opacity-95 transition-opacity shadow-lg shadow-indigo-500/10 flex items-center justify-center space-x-2`}
            >
              <span>{competitor.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-gray-800 bg-gray-900/20 hover:bg-gray-900/40 hover:border-gray-700 text-gray-300 font-medium transition-all flex items-center justify-center"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="pt-32 scroll-mt-20">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl font-heading font-bold">Comprehensive Capabilities</h2>
            <p className="text-gray-400 max-w-lg mx-auto">Everything you need to deliver high-performing experiences for your organization.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {featuresList.map((feature, i) => (
              <div
                key={i}
                className={`p-6 rounded-xl border border-gray-800/80 bg-gray-950/40 hover:bg-gray-950/60 transition-all ${borderGlow} flex items-start space-x-4`}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${themeGradient} bg-opacity-10 text-white shrink-0`}>
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-200">{feature}</h3>
                  <p className="text-gray-400 text-sm mt-1">Included with every setup, fully configured and production ready from day one.</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="pt-32 scroll-mt-20">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl font-heading font-bold">Simple, Predictable Pricing</h2>
            <p className="text-gray-400 max-w-lg mx-auto">No hidden fees. Choose the plan that scales with your growth.</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className={`rounded-2xl border-2 border-indigo-500/30 bg-gray-950/80 p-8 shadow-2xl relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 px-4 py-1 bg-gradient-to-r ${themeGradient} text-white text-xs font-semibold rounded-bl-lg`}>
                POPULAR
              </div>

              <div className="space-y-4">
                <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">Standard Plan</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-extrabold text-white tracking-tight">{competitor.pricing}</span>
                </div>
                <p className="text-gray-400 text-sm">Best choice for professionals and scaling operations looking for optimal support.</p>
              </div>

              <div className="border-t border-gray-800 my-8" />

              <ul className="space-y-4 mb-8">
                {featuresList.map((feature, i) => (
                  <li key={i} className="flex items-center space-x-3 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3.5 rounded-lg bg-gradient-to-r ${themeGradient} text-white font-medium hover:opacity-95 transition-opacity shadow-lg flex items-center justify-center space-x-2`}
              >
                <span>{competitor.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-gray-800/80 bg-gray-950/40 relative z-10 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} {competitor.name}. All rights reserved.</p>
          <div className="flex space-x-6 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-400">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
