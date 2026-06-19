'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Code, 
  Search, 
  TrendingUp, 
  ArrowUpRight, 
  Check,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

type ScenarioKey = 'pricing' | 'features' | 'repositioning';

interface Scenario {
  title: string;
  description: string;
  url: string;
  category: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  before: {
    title: string;
    details: string[];
    price?: string;
  };
  after: {
    title: string;
    details: string[];
    price?: string;
  };
  diff: {
    removed: string[];
    added: string[];
  };
  aiSummary: string;
}

const SCENARIOS: Record<ScenarioKey, Scenario> = {
  pricing: {
    title: 'Pricing Shift',
    description: 'Track pricing hikes, tier modifications, and packaging adjustments.',
    url: 'https://acme-saas.com/pricing',
    category: 'PRICING',
    impact: 'HIGH',
    before: {
      title: 'Growth Plan',
      price: '$29',
      details: ['Up to 5 team members', 'Standard tracking & history', 'Email support (24h response)']
    },
    after: {
      title: 'Growth Plan',
      price: '$49',
      details: ['Up to 20 team members', 'AI-powered deep insights', '24/7 Priority support channel']
    },
    diff: {
      removed: ['$29 / month', 'Up to 5 team members', 'Standard tracking & history', 'Email support (24h response)'],
      added: ['$49 / month', 'Up to 20 team members', 'AI-powered deep insights', '24/7 Priority support channel']
    },
    aiSummary: 'Competitor increased pricing for their core Growth plan by 69% (from $29 to $49) while expanding seats (from 5 to 20) and packaging premium capabilities like AI-powered insights. This indicates a strategic push to capture higher contract values from expanding mid-market companies.'
  },
  features: {
    title: 'Enterprise Launch',
    description: 'Detect security compliance features, SSO launches, or new add-ons.',
    url: 'https://acme-saas.com/features',
    category: 'PRODUCT',
    impact: 'HIGH',
    before: {
      title: 'Enterprise Tier',
      details: ['Custom seat plans', 'Dedicated account representative', 'Standard security audit']
    },
    after: {
      title: 'Enterprise Tier',
      details: [
        'SAML SSO & OIDC authentication',
        'Real-time Audit Logs & Compliance',
        '99.99% SLA Uptime Guarantee',
        'Custom MSA & DPA contracts'
      ]
    },
    diff: {
      removed: ['Standard security audit'],
      added: [
        'SAML SSO & OIDC authentication',
        'Real-time Audit Logs & Compliance',
        '99.99% SLA Uptime Guarantee',
        'Custom MSA & DPA contracts'
      ]
    },
    aiSummary: 'Competitor released key enterprise readiness and compliance features (SAML/OIDC, Audit Logs, and custom SLAs). This is a strong indicator that they are moving up-market to target security-conscious enterprise buyers, positioning themselves directly against enterprise category leaders.'
  },
  repositioning: {
    title: 'Brand Re-positioning',
    description: 'Detect shifts in landing page copy, value propositions, and hero text.',
    url: 'https://acme-saas.com/',
    category: 'MARKETING',
    impact: 'MEDIUM',
    before: {
      title: 'Hero Heading',
      details: ['A simple tool to track your daily team tasks and keep projects organized.']
    },
    after: {
      title: 'Hero Heading',
      details: ['The autonomous AI agent workspace to automate workflows and coordinate tasks.']
    },
    diff: {
      removed: ['A simple tool to track your daily team tasks and keep projects organized.'],
      added: ['The autonomous AI agent workspace to automate workflows and coordinate tasks.']
    },
    aiSummary: 'Competitor completely pivoted their core marketing message from standard project organization / task management to an AI-first "autonomous agent workspace." This signals a major branding shift to capture current market demand for AI-driven workflow automation.'
  }
};

export function LandingInteractiveDemo() {
  const [activeScenario, setActiveScenario] = React.useState<ScenarioKey>('pricing');
  const [step, setStep] = React.useState<'idle' | 'crawling' | 'diffing' | 'completed'>('idle');
  const [progress, setProgress] = React.useState(0);
  const [simulatedChange, setSimulatedChange] = React.useState(false);

  const scenario = SCENARIOS[activeScenario];

  // Auto transition demo steps
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'crawling') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 60) {
            clearInterval(interval);
            setStep('diffing');
            return 60;
          }
          return prev + 10;
        });
      }, 200);
      return () => clearInterval(interval);
    } else if (step === 'diffing') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep('completed');
            return 100;
          }
          return prev + 15;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleReset = () => {
    setStep('idle');
    setProgress(0);
    setSimulatedChange(false);
  };

  const handleTriggerSimulate = () => {
    setSimulatedChange(true);
    setStep('crawling');
    setProgress(10);
  };

  const handleScenarioChange = (key: ScenarioKey) => {
    setActiveScenario(key);
    setStep('idle');
    setProgress(0);
    setSimulatedChange(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl sm:rounded-3xl border border-indigo-500/20 bg-slate-950/40 p-4 sm:p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6 md:space-y-8 relative overflow-hidden">
      {/* Dynamic decorative backdrop grids */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Tabs list */}
      <div className="flex flex-col lg:flex-row items-center justify-between border-b border-indigo-500/10 pb-6 gap-4">
        <div className="space-y-1 text-center lg:text-left">
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center justify-center lg:justify-start gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
            Interactive Demo Sandbox
          </h3>
          <p className="text-sm text-muted-foreground">Select a tracking template to test the engine:</p>
        </div>

        <div className="flex flex-wrap justify-center gap-1.5 p-1 bg-slate-900/60 border border-indigo-500/10 rounded-xl">
          {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handleScenarioChange(key)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all ${
                activeScenario === key
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                  : 'text-muted-foreground hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {SCENARIOS[key].title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-stretch">
        
        {/* Left Side: Mock Competitor Website Preview */}
        <div className="flex flex-col rounded-2xl border border-indigo-500/10 bg-slate-900/40 overflow-hidden shadow-inner relative min-h-[380px]">
          
          {/* Mock Browser Header */}
          <div className="flex items-center px-4 py-3 bg-slate-950/80 border-b border-indigo-500/10 gap-2">
            <div className="flex gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="flex-1 max-w-xs sm:max-w-sm mx-auto flex items-center justify-center bg-slate-900/90 rounded-md border border-indigo-500/5 py-1 px-3 gap-1 text-[11px] text-muted-foreground font-mono overflow-hidden">
              <Globe className="h-3 w-3 text-indigo-400 shrink-0" />
              <span className="truncate">{scenario.url}</span>
            </div>
          </div>

          {/* Competitor Content body */}
          <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between space-y-6 bg-slate-950/20">
            <div>
              <div className="flex items-center justify-between mb-4 gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold text-indigo-400 uppercase tracking-wider font-mono shrink-0">
                  🔴 Simulated Page
                </span>
                {simulatedChange && (
                  <Badge variant="outline" className="text-[9px] sm:text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/5 animate-pulse truncate">
                    Live Update Detected
                  </Badge>
                )}
              </div>

              {/* Dynamic Content Morph */}
              <div className="transition-all duration-500 ease-in-out">
                {activeScenario === 'repositioning' ? (
                  <div className="space-y-4 text-center py-6">
                    <h4 className="text-[11px] sm:text-xs text-slate-500 uppercase font-mono tracking-widest">
                      {scenario.before.title}
                    </h4>
                    <div className="text-lg sm:text-xl md:text-2xl font-bold font-heading text-white max-w-md mx-auto leading-snug break-words">
                      {!simulatedChange ? (
                        <span className="transition-all duration-300">{scenario.before.details[0]}</span>
                      ) : (
                        <span className="text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded transition-all duration-500 border border-emerald-500/10">
                          {scenario.after.details[0]}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-xs sm:max-w-sm w-full mx-auto rounded-xl border border-indigo-500/10 bg-slate-900/60 p-4 sm:p-5 shadow-lg space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-white text-sm sm:text-base truncate">{scenario.before.title}</h4>
                      {scenario.before.price && (
                        <div className="text-right shrink-0">
                          <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                            {!simulatedChange ? scenario.before.price : (
                              <span className="text-emerald-400 bg-emerald-900/30 px-1 py-0.5 rounded border border-emerald-500/20">
                                {scenario.after.price}
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] sm:text-xs text-muted-foreground block">/mo</span>
                        </div>
                      )}
                    </div>
                    <ul className="space-y-2 sm:space-y-2.5 text-xs text-slate-300">
                      {(!simulatedChange ? scenario.before.details : scenario.after.details).map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />
                          <span className="break-words whitespace-normal">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Sandbox Controls */}
            <div className="border-t border-indigo-500/5 pt-4 flex flex-col gap-3">
              <p className="text-[10px] sm:text-[11px] text-muted-foreground text-center italic">
                {!simulatedChange 
                  ? 'Click "Simulate Competitor Change" to trigger the crawler and watch it analyze the edits.'
                  : 'Change completed. Reset below to try other templates.'}
              </p>
              <div className="flex gap-2">
                {!simulatedChange ? (
                  <Button 
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white gap-2 h-10 shadow-lg shadow-indigo-500/20 text-xs sm:text-sm"
                    onClick={handleTriggerSimulate}
                  >
                    <Play className="h-4 w-4 fill-white shrink-0" />
                    Simulate Competitor Change
                  </Button>
                ) : (
                  <Button 
                    variant="secondary" 
                    className="flex-1 bg-slate-900 hover:bg-slate-800 border border-indigo-500/10 text-white gap-2 h-10 text-xs sm:text-sm"
                    onClick={handleReset}
                  >
                    <RotateCcw className="h-4 w-4 shrink-0" />
                    Reset Simulation
                  </Button>
                )}
              </div>
            </div>

          </div>

          {/* Crawler status Overlay */}
          {step !== 'idle' && step !== 'completed' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in duration-300">
              <Search className="h-10 w-10 text-indigo-400 animate-bounce" />
              <div className="space-y-2 w-full max-w-xs">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
                  {step === 'crawling' ? 'Crawling Website & Snapshotting' : 'Diffing Content & Running AI Model'}
                </span>
                <Progress value={progress} className="h-2 bg-slate-900" />
                <p className="text-xs text-muted-foreground">
                  {step === 'crawling' ? 'Fetching raw DOM tree...' : 'Comparing snapshots & evaluating strategic intent...'}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Simulated Results / AI summary Card */}
        <div className="flex flex-col justify-center">
          {step === 'idle' && (
            <div className="rounded-2xl border border-indigo-500/10 border-dashed bg-slate-900/20 p-6 sm:p-8 text-center space-y-4 min-h-[380px] flex flex-col items-center justify-center">
              <Code className="h-12 w-12 text-indigo-500/40" />
              <div className="space-y-2">
                <h4 className="font-bold text-white text-lg">Change Feed Output</h4>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  When a competitor updates their page, we compute visual changes, generate code diffs, and write AI summaries. Use the controller to run the flow.
                </p>
              </div>
            </div>
          )}

          {step === 'crawling' && (
            <div className="rounded-2xl border border-indigo-500/10 border-dashed bg-slate-900/20 p-6 sm:p-8 text-center space-y-4 min-h-[380px] flex flex-col items-center justify-center animate-pulse">
              <Search className="h-12 w-12 text-indigo-400/50" />
              <h4 className="font-bold text-indigo-400 text-lg">Analyzing Competitor Updates...</h4>
              <p className="text-sm text-muted-foreground">
                Retrieving HTML nodes and storing screenshot.
              </p>
            </div>
          )}

          {step === 'diffing' && (
            <div className="rounded-2xl border border-indigo-500/10 border-dashed bg-slate-900/20 p-6 sm:p-8 text-center space-y-4 min-h-[380px] flex flex-col items-center justify-center">
              <TrendingUp className="h-12 w-12 text-indigo-400/50" />
              <h4 className="font-bold text-white text-lg">Diffing Content & Structuring Data</h4>
              <p className="text-sm text-muted-foreground">
                Comparing structural hash matrices.
              </p>
            </div>
          )}

          {step === 'completed' && (
            <div className="rounded-2xl border border-indigo-500/20 bg-slate-900/80 p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 animate-in slide-in-from-bottom-5 duration-500 shadow-xl min-h-[380px] flex flex-col justify-between">
              
              {/* Event Metadata Header */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-500 text-white font-mono text-[10px]">
                      {scenario.category}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Just now
                    </span>
                  </div>
                  <Badge variant="outline" className="border-rose-500/30 text-rose-400 bg-rose-500/5 text-[10px] font-bold">
                    {scenario.impact} IMPACT
                  </Badge>
                </div>
                
                <h4 className="text-base font-bold text-white">
                  {activeScenario === 'pricing' && 'Pricing Plan Restructured'}
                  {activeScenario === 'features' && 'Enterprise Capability Rollout'}
                  {activeScenario === 'repositioning' && 'Marketing Strategy Pivot'}
                </h4>
              </div>

              {/* Side-by-Side Diff Section */}
              <div className="rounded-lg bg-slate-950 p-3 sm:p-3.5 border border-indigo-500/5 text-xs font-mono max-h-36 overflow-y-auto space-y-1 scrollbar-thin">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-indigo-500/5 pb-1 mb-2">
                  Code / Content Diffs
                </div>
                {scenario.diff.removed.map((rem, idx) => (
                  <div key={idx} className="text-red-400 bg-red-950/25 px-1.5 py-0.5 rounded leading-normal flex items-start gap-1 overflow-hidden">
                    <span className="text-red-500 select-none shrink-0">-</span>
                    <span className="break-all sm:break-words whitespace-normal">{rem}</span>
                  </div>
                ))}
                {scenario.diff.added.map((add, idx) => (
                  <div key={idx} className="text-emerald-400 bg-emerald-950/25 px-1.5 py-0.5 rounded leading-normal flex items-start gap-1 overflow-hidden">
                    <span className="text-emerald-500 select-none shrink-0">+</span>
                    <span className="break-all sm:break-words whitespace-normal">{add}</span>
                  </div>
                ))}
              </div>

              {/* AI Strategic summary */}
              <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/10 p-3 sm:p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  AI Strategic Context
                </div>
                <p className="text-[11px] sm:text-[12px] text-slate-300 leading-relaxed break-words whitespace-normal">
                  {scenario.aiSummary}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold border-t border-indigo-500/5 pt-3">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  Notifications dispatched
                </span>
                <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                  See full history
                  <ArrowUpRight className="h-4 w-4 shrink-0" />
                </span>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
