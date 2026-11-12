import React from 'react';
import { Bot, ArrowRight, ShieldCheck, Sparkles, CreditCard, Layers, Sliders, CheckCircle2, Lock, Zap, Share2, Youtube } from 'lucide-react';

export const LandingPage: React.FC<{
  onLaunchAgent: () => void;
  onBrowseCatalog: () => void;
  onViewDashboard: () => void;
  onShareDemo?: () => void;
}> = ({ onLaunchAgent, onBrowseCatalog, onViewDashboard, onShareDemo }) => {
  const workflowSteps = [
    { title: 'User Request', desc: 'Describe project goals & budget constraints in natural language' },
    { title: 'AI Analysis', desc: 'Extract requirements, tags, features, and target ceiling' },
    { title: 'Discovery', desc: 'Search verified digital catalog with authoritative pricing' },
    { title: 'Comparison', desc: 'Cross-evaluate latency, features, SLAs, and architecture fit' },
    { title: 'Budget Optimizer', desc: 'Knapsack algorithm selects best combination under budget' },
    { title: 'User Approval', desc: 'Explicit human-in-the-loop checkpoint before payment initiation' },
    { title: 'PayPal Sandbox', desc: 'Server-side order creation & capture via PayPal Orders API v2' },
    { title: 'Confirmation', desc: 'Digital receipt, immutable audit ledger, and subscription activation' }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:py-24 border-b border-slate-800/80">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-violet-600/20 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-mono text-cyan-300">AgentPay AI</span>
            <span className="text-slate-500">•</span>
            <span>PayPal Sandbox Integrated</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            An Agentic AI Platform for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400">
              Intelligent Commerce & Payments
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover, evaluate, and purchase cloud infrastructure and developer SaaS tools with an autonomous AI agent. Features grounded catalog discovery, knapsack budget optimization, explicit human approval gates, and PayPal Sandbox checkout.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={onLaunchAgent}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs sm:text-sm hover:opacity-95 shadow-xl shadow-violet-600/20 flex items-center gap-2 transition-all"
            >
              <Bot className="w-4 h-4 text-cyan-300" />
              <span>Launch AI Agent Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onBrowseCatalog}
              className="px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-white font-semibold text-xs sm:text-sm hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Browse 10 Verified Products</span>
            </button>

            <button
              onClick={onViewDashboard}
              className="px-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs sm:text-sm transition-all"
            >
              Analytics Dashboard
            </button>

            {onShareDemo && (
              <>
                <button
                  onClick={onShareDemo}
                  className="px-4 py-3.5 rounded-xl bg-gradient-to-r from-violet-600/20 to-cyan-500/20 hover:from-violet-600/30 hover:to-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>Share Demo Link</span>
                </button>

                <button
                  onClick={onShareDemo}
                  className="px-4 py-3.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/40 text-rose-300 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                  title="Watch YouTube Walkthrough or publish your custom video"
                >
                  <Youtube className="w-4 h-4 text-rose-400" />
                  <span>YouTube Demo</span>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Workflow Architecture Diagram Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            End-to-End Orchestration
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            The Agentic Commerce Lifecycle
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            From natural language requirement parsing to verified PayPal Sandbox settlement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {workflowSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative space-y-2 hover:border-slate-700 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="w-6 h-6 rounded-lg bg-slate-800 font-mono font-bold text-cyan-400 flex items-center justify-center">
                  0{idx + 1}
                </span>
                {idx === 5 ? (
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    Human Gate
                  </span>
                ) : idx === 6 ? (
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    PayPal Sandbox
                  </span>
                ) : null}
              </div>
              <h3 className="font-semibold text-white text-sm">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 Core Pillars of AgentPay AI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="font-semibold text-white text-sm">Grounded Agent Discovery</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No hallucinated tools, pricing, or discounts. The agent strictly executes approved catalog query tools against verified software products.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Budget Optimization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Knapsack algorithm balances candidate tools against user budget ceilings, highlighting trade-offs and remaining reserves.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">Mandatory Approval Gate</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomous AI cannot initiate payments independently. Every checkout requires explicit cryptographic human authorization.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">PayPal Sandbox v2</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Server-side order creation, capture, and verification using PayPal Orders API v2. Replay protection and anti-tampering guaranteed.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
