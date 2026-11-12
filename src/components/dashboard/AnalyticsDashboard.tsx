import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Clock,
  PieChart as PieIcon,
  CreditCard,
  ShieldCheck,
  ArrowUpRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { api } from '../../services/api';
import { AnalyticsSummary, AiSpendingInsight } from '../../types';

export const AnalyticsDashboard: React.FC<{
  onNavigateToOrders: () => void;
  onNavigateToTransactions: () => void;
}> = ({ onNavigateToOrders, onNavigateToTransactions }) => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [insights, setInsights] = useState<AiSpendingInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [dashRes, insRes] = await Promise.all([
          api.getDashboardSummary(),
          api.getAiInsights()
        ]);
        setData(dashRes.summary);
        setInsights(insRes.insights);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const COLORS = ['#8B5CF6', '#06B6D4', '#3B82F6', '#10B981', '#F59E0B'];

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-28 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Intelligence & Commerce Analytics</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time financial metrics, PayPal Sandbox verified settlement ledger, and budget allocation telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>PayPal Sandbox Live Synced</span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Spend */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Verified Total Spend</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">${data.totalSpend.toFixed(2)}</span>
            <span className="text-xs text-slate-400 font-mono">USD</span>
          </div>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Captured via PayPal Orders API v2</span>
          </p>
        </div>

        {/* Card 2: Budget Utilization */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Budget Utilization</span>
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{data.budgetUtilizationPct}%</span>
            <span className="text-xs text-slate-400 font-mono">of ${data.monthlyBudget}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${data.budgetUtilizationPct > 90 ? 'bg-rose-500' : 'bg-gradient-to-r from-violet-500 to-cyan-400'}`}
              style={{ width: `${Math.min(100, data.budgetUtilizationPct)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Successful Payments */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Successful Payments</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{data.successfulPayments}</span>
            <span className="text-xs text-slate-400">orders settled</span>
          </div>
          <p className="text-[10px] text-slate-400">Zero chargebacks in sandbox</p>
        </div>

        {/* Card 4: Orders in Pipeline */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Orders in Pipeline</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{data.pendingOrders}</span>
            <span className="text-xs text-slate-400">pending approval</span>
          </div>
          <p className="text-[10px] text-slate-400">Protected by user authorization gate</p>
        </div>
      </div>

      {/* AI Financial Intelligence & Cost Optimization Section */}
      {insights.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                AI Financial Intelligence & Cost Recommendations
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800">
              Autonomous Audit
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.map((ins) => (
              <div
                key={ins.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-white">{ins.title}</span>
                    {ins.potentialSavings > 0 && (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        Save ${ins.potentialSavings}/yr
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{ins.description}</p>
                </div>
                {ins.actionLabel && (
                  <span className="text-[11px] font-mono text-cyan-400 font-semibold cursor-pointer hover:underline">
                    {ins.actionLabel} →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Analytics Charts: Spending Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Area Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Monthly Spending Trajectory
              </h3>
              <p className="text-[11px] text-slate-400">Verified monthly expenditure in USD</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlySpendingTrend}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                  formatter={(val: any) => [`$${val} USD`, 'Total Spend']}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#spendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Category Distribution
              </h3>
              <p className="text-[11px] text-slate-400">Total spent across software categories</p>
            </div>
          </div>

          {data.spendByCategory.length === 0 ? (
            <p className="text-xs text-slate-500 py-20 text-center">No paid transactions recorded yet.</p>
          ) : (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.spendByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis type="number" stroke="#64748B" fontSize={10} tickFormatter={(v) => `$${v}`} />
                  <YAxis type="category" dataKey="category" stroke="#94A3B8" fontSize={10} width={90} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                    formatter={(val: any) => [`$${val} USD`, 'Amount']}
                  />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {data.spendByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent Ledger Entries (Orders & Transactions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Recent Application Orders
            </h3>
            <button
              onClick={onNavigateToOrders}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {data.recentOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No orders recorded yet.</p>
            ) : (
              data.recentOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono text-white font-medium block">{ord.id}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString()} • {ord.items.length} items
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white block">${ord.totalAmount.toFixed(2)}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        ord.status === 'PAID'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent PayPal Transactions */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              PayPal Sandbox Captures
            </h3>
            <button
              onClick={onNavigateToTransactions}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {data.recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No transactions captured yet.</p>
            ) : (
              data.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono text-cyan-400 font-medium block">{tx.paypalCaptureId}</span>
                    <span className="text-[10px] text-slate-400">{tx.payerEmail}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white block">+${tx.amount.toFixed(2)}</span>
                    <span className="text-[9px] text-slate-400 font-mono">Net: ${tx.netAmount.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
