'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { BRANDING } from '@cct/db';

const PLANS_DATA = [
  {
    name: 'Free',
    priceMonthly: '$0',
    priceAnnual: '$0',
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
    priceMonthly: '$19',
    priceAnnual: '$15',
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
    priceMonthly: '$49',
    priceAnnual: '$39',
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
    priceMonthly: '$199',
    priceAnnual: '$159',
    description: 'For agencies and large scale tracking requirements.',
    cta: 'Contact Sales',
    href: `mailto:${BRANDING.supportEmail}`,
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

export function PricingTiers() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="space-y-12">
      {/* Toggle */}
      <div className="flex justify-center items-center gap-4">
        <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className="relative inline-flex h-6 w-12 items-center rounded-full bg-indigo-500/20 border border-indigo-500/50 transition-colors focus:outline-none"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-indigo-400 transition-transform ${isAnnual ? 'translate-x-7' : 'translate-x-1'}`}
          />
        </button>
        <span className={`text-sm font-medium flex items-center gap-2 ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
          Annually <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full">2 Months Free</span>
        </span>
      </div>

      {/* Grid */}
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
                <span className="text-4xl font-extrabold font-mono text-white">
                  {isAnnual ? plan.priceAnnual : plan.priceMonthly}
                </span>
                <span className="text-xs text-muted-foreground ml-1">/month</span>
              </div>
              
              {isAnnual && plan.priceAnnual !== '$0' && (
                <div className="text-xs text-indigo-400 font-medium">Billed annually</div>
              )}
              {(!isAnnual || plan.priceAnnual === '$0') && (
                <div className="text-xs text-transparent font-medium select-none">&nbsp;</div>
              )}

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
              {plan.name === 'Agency' ? (
                <Button asChild className="w-full h-10 bg-slate-900 hover:bg-slate-850 text-white border border-indigo-500/10">
                  <a href={plan.href}>
                    {plan.cta}
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </a>
                </Button>
              ) : (
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
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
