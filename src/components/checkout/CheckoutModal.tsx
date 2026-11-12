import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  Loader2,
  CreditCard,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Order, Transaction } from '../../types';
import { formatCurrency, convertCurrency } from '../../utils/currency';

interface CheckoutModalProps {
  onOrderCompleted: (order: Order, transaction: Transaction) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onOrderCompleted }) => {
  const { isCheckoutOpen, setIsCheckoutOpen, cart, refreshCart, selectedCurrency } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<'review' | 'approving' | 'paypal' | 'capturing' | 'error'>('review');
  const [userHasApproved, setUserHasApproved] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [payerEmail, setPayerEmail] = useState('buyer.sandbox@agentpay.ai');

  if (!isCheckoutOpen) return null;

  const items = cart?.items || [];
  const totalAmount = cart?.subtotal || 0;

  // Step 1: User explicitly approves and server creates pending order + triggers approval
  const handleApproveAndInitiate = async () => {
    if (!userHasApproved) {
      setErrorMsg('You must check the explicit user authorization box to proceed.');
      return;
    }

    try {
      setStep('approving');
      setErrorMsg(null);

      // Create order with authoritative server prices
      const orderRes = await api.createOrder();
      const localOrder = orderRes.order;

      // Explicit user approval endpoint
      const approveRes = await api.approveOrder(localOrder.id);
      setCreatedOrder(approveRes.order);

      // Create PayPal Sandbox Order
      setStep('paypal');
      const ppRes = await api.createPayPalOrder(approveRes.order.id);
      setPaypalOrderId(ppRes.paypalOrderId);
    } catch (err: any) {
      console.error('Approval failed:', err);
      setErrorMsg(err.message || 'Failed to initiate checkout.');
      setStep('error');
    }
  };

  // Step 2: User completes PayPal Sandbox checkout and backend verifies & captures
  const handleCompletePayPalCapture = async () => {
    if (!createdOrder || !paypalOrderId) return;

    try {
      setStep('capturing');
      setErrorMsg(null);

      const captureRes = await api.capturePayPalPayment({
        localOrderId: createdOrder.id,
        paypalOrderId,
        payerEmail
      });

      // Fire celebratory confetti for verified payment
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      await refreshCart();
      setIsCheckoutOpen(false);
      onOrderCompleted(captureRes.order, captureRes.transaction);
    } catch (err: any) {
      console.error('Capture failed:', err);
      setErrorMsg(err.message || 'Payment capture failed.');
      setStep('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Lock className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Purchase Review & PayPal Checkout</h2>
              <p className="text-[11px] text-slate-400">Step 7-10 of Agentic Commerce Workflow</p>
            </div>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            aria-label="Close checkout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Phase 1: Review & Explicit Approval Checkpoint */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Order Summary
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                      <div>
                        <span className="text-white font-medium">{item.product?.name}</span>
                        <span className="text-slate-400 ml-1.5 font-mono">x{item.quantity}</span>
                      </div>
                      <span className="text-cyan-400 font-mono font-medium">
                        {formatCurrency(convertCurrency(item.subtotal, selectedCurrency), selectedCurrency)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800 text-sm">
                  <div>
                    <span className="font-semibold text-slate-200 block">Total Authoritative Amount:</span>
                    {selectedCurrency !== 'USD' && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        Approx: {formatCurrency(convertCurrency(totalAmount, selectedCurrency), selectedCurrency)}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-white font-mono text-base">${totalAmount.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Explicit Mandatory User Approval Checkpoint */}
              <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-800/50 space-y-2">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="user-approval-checkbox"
                    checked={userHasApproved}
                    onChange={(e) => setUserHasApproved(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                  />
                  <label htmlFor="user-approval-checkbox" className="text-xs text-slate-200 cursor-pointer select-none leading-relaxed">
                    <strong className="text-white">Required User Authorization Checkpoint:</strong> I explicitly review and authorize this purchase order of <span className="text-cyan-400 font-mono font-bold">${totalAmount.toFixed(2)} USD</span> {selectedCurrency !== 'USD' ? `(${formatCurrency(convertCurrency(totalAmount, selectedCurrency), selectedCurrency)})` : ''}. I understand this action initiates PayPal Sandbox checkout.
                  </label>
                </div>
                <p className="text-[10px] text-slate-400 pl-7">
                  Protected by Section 4.C & Section 10: Payment execution remains strictly outside autonomous AI decision-making.
                </p>
              </div>

              <button
                onClick={handleApproveAndInitiate}
                disabled={!userHasApproved}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg transition-all"
              >
                <span>Authorize & Prepare PayPal Sandbox Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Phase 2: Processing Approval */}
          {step === 'approving' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <h3 className="text-sm font-semibold text-white">Validating Order on Server...</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Recalculating trusted catalog prices, binding authorization nonce, and authenticating with PayPal Sandbox.
              </p>
            </div>
          )}

          {/* Phase 3: PayPal Sandbox Checkout Screen */}
          {step === 'paypal' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">PayPal Sandbox Order ID:</span>
                  <span className="text-cyan-300 font-mono font-bold">{paypalOrderId}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Local Reference:</span>
                  <span className="text-slate-400 font-mono">{createdOrder?.id}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-cyan-800/30 pt-1.5">
                  <span className="text-slate-300">Amount Due:</span>
                  <span className="text-white font-mono font-bold text-sm">${createdOrder?.totalAmount.toFixed(2)} USD</span>
                </div>
              </div>

              {/* PayPal Sandbox Buyer Account Simulator / Input */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  PayPal Sandbox Buyer Account:
                </label>
                <input
                  type="email"
                  value={payerEmail}
                  onChange={(e) => setPayerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  placeholder="buyer.sandbox@agentpay.ai"
                />
                <p className="text-[11px] text-slate-400">
                  Default developer test buyer account. In sandbox mode, no actual funds or credit cards are charged.
                </p>
              </div>

              {/* Official PayPal Sandbox Action Button */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCompletePayPalCapture}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-950/40 transition-all border border-sky-400/30"
                >
                  <CreditCard className="w-4 h-4 text-amber-300" />
                  <span>Pay with PayPal Sandbox (${createdOrder?.totalAmount.toFixed(2)} USD)</span>
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Server-side capture verification with PayPal Orders API v2</span>
                </div>
              </div>
            </div>
          )}

          {/* Phase 4: Capturing & Verifying */}
          {step === 'capturing' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
              <h3 className="text-sm font-semibold text-white">Capturing & Verifying Payment...</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Communicating with PayPal Sandbox endpoints, verifying capture status, and sealing order records.
              </p>
            </div>
          )}

          {/* Error fallback */}
          {step === 'error' && (
            <div className="text-center pt-2">
              <button
                onClick={() => setStep('review')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-medium hover:bg-slate-700"
              >
                Return to Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
