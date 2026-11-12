import React, { useState } from 'react';
import { Settings, User, DollarSign, ShieldCheck, Check, Sparkles, Key, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency, convertCurrency } from '../../utils/currency';

export const ProfileSettings: React.FC = () => {
  const { user, updateBudget, login } = useAuth();
  const { refreshCart, selectedCurrency } = useCart();

  const [budgetVal, setBudgetVal] = useState(user?.monthlyBudget || 250);
  const [userName, setUserName] = useState(user?.name || 'Alex Rivera');
  const [userRole, setUserRole] = useState<string>(user?.role || 'founder');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBudget(budgetVal);
    await refreshCart();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDemoSwitch = async (role: string, name: string, budget: number) => {
    await login(`${role}@agentpay.ai`, name, role);
    setUserName(name);
    setUserRole(role);
    setBudgetVal(budget);
    await updateBudget(budget);
    await refreshCart();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">User Profile & Budget Preferences</h1>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure spending constraints, currency denomination, and PayPal Developer Sandbox environments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Demo Persona Quick Switcher */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Demo Personas</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Quickly switch profiles to test different budget limits and agent optimizations.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleDemoSwitch('founder', 'Alex Rivera (SaaS Founder)', 300)}
                className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
              >
                <span className="text-xs font-semibold text-white block">Alex Rivera</span>
                <span className="text-[10px] text-cyan-400 font-mono">$300/mo • AI SaaS Founder</span>
              </button>

              <button
                onClick={() => handleDemoSwitch('developer', 'Maya Chen (DevOps Lead)', 150)}
                className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
              >
                <span className="text-xs font-semibold text-white block">Maya Chen</span>
                <span className="text-[10px] text-violet-400 font-mono">$150/mo • DevOps Engineer</span>
              </button>

              <button
                onClick={() => handleDemoSwitch('buyer', 'Sam Jordan (Security Director)', 500)}
                className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
              >
                <span className="text-xs font-semibold text-white block">Sam Jordan</span>
                <span className="text-[10px] text-emerald-400 font-mono">$500/mo • Security Architect</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences Form & PayPal Info */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Profile Configuration
            </h3>

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Profile and budget preferences updated successfully.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">User Full Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">User Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'user@agentpay.ai'}
                  className="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Monthly Spending Budget Ceiling</label>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs font-bold text-cyan-400">${budgetVal} USD</span>
                  {selectedCurrency !== 'USD' && (
                    <span className="text-[11px] text-slate-400">
                      ({formatCurrency(convertCurrency(budgetVal, selectedCurrency), selectedCurrency)})
                    </span>
                  )}
                </div>
              </div>
              <input
                type="range"
                min={20}
                max={1000}
                step={10}
                value={budgetVal}
                onChange={(e) => setBudgetVal(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                The AI Agent will use this figure to automatically optimize tool bundles and warn when additions exceed budget.
              </p>
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-95 text-white font-semibold text-xs shadow-md transition-all"
            >
              Save Preferences
            </button>
          </form>

          {/* PayPal Developer Sandbox Status Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  PayPal Developer Sandbox Environment
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                Sandbox v2 Active
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              AgentPay AI connects directly to PayPal Developer Sandbox Orders API (<code>api-m.sandbox.paypal.com</code>). Orders are created server-side, locked against client tampering, and captured with zero actual monetary liability.
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway API Endpoint:</span>
                <span>https://api-m.sandbox.paypal.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Checkout Mode:</span>
                <span className="text-cyan-400">REST API v2 (CAPTURE)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Test Buyer:</span>
                <span className="text-slate-200">buyer.sandbox@agentpay.ai</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
