import React from 'react';
import { Bot, ShoppingCart, Sparkles, Layers, History, CreditCard, BarChart3, Settings, ShieldCheck, ArrowRight, RefreshCw, Terminal, Globe, Share2, Youtube } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Currency } from '../../types';
import { formatCurrency, convertCurrency } from '../../utils/currency';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedCurrency: Currency;
  onSelectCurrency: (c: Currency) => void;
  onOpenShareModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, selectedCurrency, onSelectCurrency, onOpenShareModal }) => {
  const { user } = useAuth();
  const { cart, budgetStatus, setIsCartOpen, comparisonList } = useCart();

  const totalItems = cart?.itemCount || 0;

  const navItems = [
    { id: 'workspace', label: 'AI Agent', icon: Bot, badge: 'Agentic' },
    { id: 'catalog', label: 'Catalog', icon: Layers },
    { id: 'compare', label: 'Compare', icon: Sparkles, count: comparisonList.length },
    { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw },
    { id: 'orders', label: 'Orders', icon: History },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'webhooks', label: 'Webhooks', icon: Terminal, badge: 'Sandbox' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0 py-1" onClick={() => setCurrentTab('landing')}>
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 leading-none">
                <span className="text-base font-bold tracking-tight text-white font-mono">
                  Agent<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Pay</span> AI
                </span>
                <span className="text-[9px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Sandbox
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5 hidden sm:block">Commerce & Payments</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-300 font-mono">
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Share, Currency, Budget & Cart */}
          <div className="flex items-center gap-2.5">
            {/* YouTube Demo Trigger */}
            <button
              onClick={onOpenShareModal}
              aria-label="YouTube Demonstration"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/40 text-rose-300 text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Watch demonstration video on YouTube"
            >
              <Youtube className="w-3.5 h-3.5 text-rose-400" />
              <span>YouTube Demo</span>
            </button>

            {/* Share Demo Button */}
            <button
              onClick={onOpenShareModal}
              aria-label="Share demonstration model"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600/20 to-cyan-500/20 hover:from-violet-600/30 hover:to-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Get shareable URL for presentation"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Share Demo</span>
            </button>

            {/* Currency Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
              <select
                value={selectedCurrency}
                onChange={(e) => onSelectCurrency(e.target.value as Currency)}
                className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
                aria-label="Select currency"
              >
                <option value="USD" className="bg-slate-900">USD ($)</option>
                <option value="EUR" className="bg-slate-900">EUR (€)</option>
                <option value="GBP" className="bg-slate-900">GBP (£)</option>
                <option value="INR" className="bg-slate-900">INR (₹)</option>
              </select>
            </div>

            {/* Budget status badge */}
            {budgetStatus && (
              <div
                onClick={() => setCurrentTab('profile')}
                className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700 transition-colors"
                title="Click to adjust monthly budget"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[11px] text-slate-400">Budget:</span>
                  <span className="font-semibold text-white font-mono">
                    {formatCurrency(convertCurrency(budgetStatus.userBudget, selectedCurrency), selectedCurrency)}
                  </span>
                </div>
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${budgetStatus.withinBudget ? 'bg-cyan-400' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(100, budgetStatus.utilizationPct)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open cart with ${totalItems} items`}
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-medium font-mono hidden sm:inline">
                {formatCurrency(convertCurrency(cart?.subtotal || 0, selectedCurrency), selectedCurrency)}
              </span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Profile Avatar / Quick switch */}
            <div
              onClick={() => setCurrentTab('profile')}
              className="flex items-center gap-2 pl-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm border border-violet-400/30">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile secondary nav */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs whitespace-nowrap ${
                  isActive
                    ? 'bg-violet-600/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
