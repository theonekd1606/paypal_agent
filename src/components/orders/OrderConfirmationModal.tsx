import React from 'react';
import { CheckCircle2, Download, ExternalLink, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { Order, Transaction } from '../../types';

interface OrderConfirmationModalProps {
  order: Order | null;
  transaction: Transaction | null;
  onClose: () => void;
  onNavigateToOrders: () => void;
  onNavigateToDashboard: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  transaction,
  onClose,
  onNavigateToOrders,
  onNavigateToDashboard
}) => {
  if (!order) return null;

  const handleDownloadReceipt = () => {
    const receiptData = {
      title: 'AgentPay AI — Official Sandbox Payment Receipt',
      orderId: order.id,
      paypalOrderId: order.paypalOrderId,
      paypalCaptureId: order.paypalCaptureId,
      status: order.status,
      timestamp: order.updatedAt,
      payerEmail: order.paypalPayerEmail,
      items: order.items,
      totalAmount: order.totalAmount,
      currency: order.currency,
      transactionId: transaction?.id,
      netSettled: transaction?.netAmount,
      fee: transaction?.feeAmount
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AgentPay-Receipt-${order.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-emerald-950/40 to-slate-900 border-b border-slate-800 text-center relative">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Payment Verified & Order Confirmed!</h2>
          <p className="text-xs text-slate-400 mt-1">
            PayPal Sandbox captured successfully and local ledger updated.
          </p>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Local Order ID</span>
              <span className="text-white font-semibold">{order.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">PayPal Capture ID</span>
              <span className="text-cyan-400 font-semibold">{order.paypalCaptureId || 'Verified'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Payer Account</span>
              <span className="text-slate-200">{order.paypalPayerEmail || 'Sandbox Payer'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Payment State</span>
              <span className="text-emerald-400 font-bold uppercase">{order.status}</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Itemized Products
            </span>
            <div className="rounded-xl border border-slate-800/80 divide-y divide-slate-800/60 bg-slate-950/30 overflow-hidden">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{item.productName}</span>
                    <span className="text-slate-400 font-mono">x{item.quantity}</span>
                  </div>
                  <span className="font-mono text-cyan-400 font-semibold">${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <span className="text-slate-300 font-medium">Total Paid (PayPal Sandbox):</span>
            <span className="text-base font-bold text-white font-mono">${order.totalAmount.toFixed(2)} USD</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-400/90 bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Digital subscriptions activated. Audit record logged to transaction ledger.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center gap-2">
          <button
            onClick={handleDownloadReceipt}
            className="px-3.5 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onNavigateToOrders();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View in Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              onClose();
              onNavigateToDashboard();
            }}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-95 text-white font-medium text-xs transition-all shadow-md"
          >
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
