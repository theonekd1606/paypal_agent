import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, convertCurrency } from '../../utils/currency';

export const CartDrawer: React.FC<{ onNavigateToCatalog: () => void }> = ({ onNavigateToCatalog }) => {
  const { cart, budgetStatus, isCartOpen, setIsCartOpen, updateQuantity, removeItem, clearCart, setIsCheckoutOpen, selectedCurrency } = useCart();
  const { user } = useAuth();

  if (!isCartOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const userBudget = budgetStatus?.userBudget || user?.monthlyBudget || 250;
  const withinBudget = budgetStatus?.withinBudget ?? (subtotal <= userBudget);
  const remainingBudget = budgetStatus?.remainingBudget ?? (userBudget - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-semibold text-white">Your Shopping Cart</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {items.length} items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              aria-label="Close cart"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Budget Impact Banner */}
          <div className="p-4 bg-slate-950/60 border-b border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">Budget Impact</span>
              <span className={`font-mono font-medium ${withinBudget ? 'text-emerald-400' : 'text-rose-400'}`}>
                {withinBudget
                  ? `+${formatCurrency(convertCurrency(remainingBudget, selectedCurrency), selectedCurrency)} remaining`
                  : `Exceeds budget by ${formatCurrency(convertCurrency(Math.abs(remainingBudget), selectedCurrency), selectedCurrency)}`}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${withinBudget ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(100, budgetStatus?.utilizationPct || (subtotal / userBudget) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>Cart: {formatCurrency(convertCurrency(subtotal, selectedCurrency), selectedCurrency)}</span>
              <span>Limit: {formatCurrency(convertCurrency(userBudget, selectedCurrency), selectedCurrency)}</span>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-7 h-7 text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1">Your cart is currently empty</h3>
                <p className="text-xs text-slate-400 max-w-xs mb-5">
                  Discover verified cloud products or ask the AI Agent to build a tailored stack for you.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigateToCatalog();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-xs font-medium hover:opacity-95 transition-all shadow-md"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.productId}
                  className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center gap-3.5 hover:border-slate-700/80 transition-all"
                >
                  <img
                    src={item.product?.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120'}
                    alt={item.product?.name || item.productId}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700/50"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {item.product?.name || item.productId}
                    </h4>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      {formatCurrency(convertCurrency(item.unitPrice, selectedCurrency), selectedCurrency)} / month
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-slate-700 rounded-lg bg-slate-900 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          aria-label={`Decrease quantity for ${item.product?.name}`}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-medium text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          aria-label={`Increase quantity for ${item.product?.name}`}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-200">
                        = {formatCurrency(convertCurrency(item.subtotal, selectedCurrency), selectedCurrency)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.product?.name} from cart`}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div>
                  <span className="block text-slate-300 font-medium">Catalog Subtotal</span>
                  <span className="text-[10px] text-slate-500 font-mono">PayPal Settlement: ${subtotal.toFixed(2)} USD</span>
                </div>
                <span className="font-mono text-base font-bold text-white">
                  {formatCurrency(convertCurrency(subtotal, selectedCurrency), selectedCurrency)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-violet-950/30 border border-violet-800/40 text-[11px] text-violet-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>
                  Anti-tampering security enabled: backend recalculates authoritative totals directly from database.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={clearCart}
                  className="px-3 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-medium text-xs flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-violet-600/20 transition-all"
                >
                  <span>Proceed to Approval & PayPal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
