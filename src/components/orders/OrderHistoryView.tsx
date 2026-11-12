import React, { useState, useEffect } from 'react';
import { History, Search, ArrowRight, ShieldCheck, Download, Clock, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';

export const OrderHistoryView: React.FC<{
  onViewInvoice: (order: Order) => void;
  onNavigateToCatalog: () => void;
}> = ({ onViewInvoice, onNavigateToCatalog }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.getOrders();
        setOrders(res.orders);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return o.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Order Lifecycle & History</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete auditable order records with server-enforced state transitions and PayPal Sandbox tracking.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['ALL', 'PAID', 'PENDING', 'AWAITING_PAYMENT', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                filterStatus === st
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-3">
          <p className="text-sm font-semibold text-slate-300">No orders found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore our verified catalog or use the AI Agent to prepare a purchase plan.
          </p>
          <button
            onClick={onNavigateToCatalog}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-medium hover:opacity-95"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isPaid = order.status === 'PAID';
            const isPending = order.status === 'PENDING' || order.status === 'AWAITING_PAYMENT';

            return (
              <div
                key={order.id}
                className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
              >
                {/* Order Meta */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">{order.id}</span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                        isPaid
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : isPending
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {order.status}
                    </span>
                    {order.userApproved && (
                      <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>User Approved</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">
                    Created on {new Date(order.createdAt).toLocaleString()} • {order.items.length} items
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(order.items || []).map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                      >
                        {item.productName} (x{item.quantity})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-left md:text-right">
                    <span className="text-base font-bold font-mono text-white block">
                      ${order.totalAmount.toFixed(2)} USD
                    </span>
                    {order.paypalCaptureId && (
                      <span className="text-[10px] text-slate-500 font-mono block">
                        PayPal: {order.paypalCaptureId}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onViewInvoice(order)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700/60"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Receipt</span>
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
