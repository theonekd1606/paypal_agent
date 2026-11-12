import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, ToggleLeft, ToggleRight, Sparkles, Download } from 'lucide-react';
import { api } from '../../services/api';
import { Subscription, Currency } from '../../types';
import { formatCurrency, calculateAnnualDiscount } from '../../utils/currency';

export const SubscriptionManager: React.FC<{
  selectedCurrency?: Currency;
  onNavigateToCatalog: () => void;
}> = ({ selectedCurrency = 'USD', onNavigateToCatalog }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchSubs = async () => {
    try {
      setLoading(true);
      const res = await api.getSubscriptions();
      setSubscriptions(res.subscriptions);
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const handleToggleAutoRenew = async (sub: Subscription) => {
    const updated = await api.updateSubscription(sub.id, { autoRenew: !sub.autoRenew });
    setSubscriptions((prev) => prev.map((s) => (s.id === sub.id ? updated.subscription : s)));
    showBanner(`Auto-renewal ${!sub.autoRenew ? 'enabled' : 'disabled'} for ${sub.productName}`);
  };

  const handleTogglePlan = async (sub: Subscription) => {
    const targetPlan = sub.plan === 'monthly' ? 'annual' : 'monthly';
    const updated = await api.updateSubscription(sub.id, { plan: targetPlan });
    setSubscriptions((prev) => prev.map((s) => (s.id === sub.id ? updated.subscription : s)));
    showBanner(`Switched ${sub.productName} to ${targetPlan} billing`);
  };

  const handleToggleStatus = async (sub: Subscription) => {
    const nextStatus = sub.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    const updated = await api.updateSubscription(sub.id, { status: nextStatus });
    setSubscriptions((prev) => prev.map((s) => (s.id === sub.id ? updated.subscription : s)));
    showBanner(`Subscription ${nextStatus === 'PAUSED' ? 'paused' : 'resumed'}`);
  };

  const showBanner = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const totalMonthlyCommitment = subscriptions
    .filter((s) => s.status === 'ACTIVE')
    .reduce((sum, s) => sum + (s.plan === 'annual' ? s.amount / 12 : s.amount), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Active Software Subscriptions & Licenses</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage recurring PayPal developer licenses, switch annual discounts, or pause renewal cycles.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono">
          <span className="text-slate-400">Monthly Commitment:</span>
          <span className="text-white font-bold">{formatCurrency(totalMonthlyCommitment, selectedCurrency)}/mo</span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Annual Savings Opportunity Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/30 via-slate-900 to-cyan-950/30 border border-cyan-500/30 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Annual Billing Optimization Available
            </h3>
            <p className="text-xs text-slate-300">
              Save 15% across all cloud licenses by switching from monthly to annual billing. Subscriptions remain covered by PayPal Sandbox purchase protection.
            </p>
          </div>
        </div>
      </div>

      {/* Subscriptions Grid / Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-3">
          <p className="text-sm font-semibold text-slate-300">No active subscriptions</p>
          <p className="text-xs text-slate-500">
            When you purchase verified tools through the AI Agent or Catalog, your digital licenses will appear here.
          </p>
          <button
            onClick={onNavigateToCatalog}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-medium"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map((sub) => {
            const isActive = sub.status === 'ACTIVE';
            const annualMath = calculateAnnualDiscount(sub.plan === 'annual' ? sub.amount / (1 - 0.15) / 12 : sub.amount);

            return (
              <div
                key={sub.id}
                className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-sm"
              >
                {/* Product & Plan Details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-bold text-white">{sub.productName}</h3>
                    <span
                      className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {sub.status}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                      {sub.plan.toUpperCase()} PLAN
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Next Renewal Date: {new Date(sub.nextBillingDate).toLocaleDateString()} • Ref Order: {sub.orderId}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono pt-1 text-slate-300">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Rate:</span>
                      <span className="font-bold text-white">
                        {formatCurrency(sub.amount, selectedCurrency)} / {sub.plan === 'annual' ? 'year' : 'month'}
                      </span>
                    </div>
                    {sub.plan === 'monthly' && (
                      <div className="text-cyan-400 text-[11px]">
                        Save {formatCurrency(annualMath.annualSavings, selectedCurrency)}/yr on annual plan
                      </div>
                    )}
                  </div>
                </div>

                {/* Controls & Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  {/* Plan Switch Button */}
                  <button
                    onClick={() => handleTogglePlan(sub)}
                    className="px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-300 hover:text-white text-xs font-mono transition-colors"
                  >
                    Switch to {sub.plan === 'monthly' ? 'Annual (-15%)' : 'Monthly'}
                  </button>

                  {/* Auto Renew Toggle */}
                  <button
                    onClick={() => handleToggleAutoRenew(sub)}
                    className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Auto-Renew:</span>
                    <span className={sub.autoRenew ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {sub.autoRenew ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* Pause / Resume Button */}
                  <button
                    onClick={() => handleToggleStatus(sub)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-amber-950/40 text-amber-300 border border-amber-800/60 hover:bg-amber-900/40'
                        : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/40'
                    }`}
                  >
                    {isActive ? 'Pause Renewal' : 'Resume License'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
